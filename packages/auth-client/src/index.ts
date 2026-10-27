import type { LoginResponse, MembershipSummary, SignedIn } from '@erp/contracts';

// Token handling for the web app, the Platform Console and the desktop app (Part 10 §10.3,
// §10.6). The access token lives in memory only. The refresh token never reaches page code:
// the web keeps it in an httpOnly cookie, the desktop in the main process (safeStorage).

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed_out' }
  | { status: 'signed_in'; membership: MembershipSummary | null; memberships: MembershipSummary[] };

export type EnrolResult = SignedIn & { recovery_codes: string[] };

/** How sign-in reaches the API: the sdk and the cookie (web), or the preload bridge (desktop). */
export interface AuthTransport {
  login(email: string, password: string): Promise<LoginResponse>;
  verifyMfa(input: { challenge: string; code?: string; recovery_code?: string }): Promise<SignedIn>;
  /** Staff only: confirm the first authenticator. */
  enrol?(challenge: string, code: string): Promise<EnrolResult>;
  /** Rotates the refresh token kept by the browser or the main process. */
  refresh(): Promise<SignedIn>;
  logout(accessToken: string | null): Promise<void>;
}

type LockManagerLike = {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
};

export type AuthClientOptions = {
  /** One name per app, so the web app's and the console's refreshes do not wait on each other. */
  lockName: string;
  now?: () => number;
  /** Web Locks; found on navigator by default, absent in tests and old browsers. */
  locks?: LockManagerLike | null;
};

/** Refresh this long before the access token expires. */
const EARLY_MS = 60_000;

export class AuthClient {
  private token: { value: string; expiresAt: number } | null = null;
  private state: AuthState = { status: 'loading' };
  private readonly listeners = new Set<(state: AuthState) => void>();
  private refreshing: Promise<boolean> | null = null;
  private readonly now: () => number;
  private readonly locks: LockManagerLike | null;

  constructor(
    private readonly transport: AuthTransport,
    private readonly options: AuthClientOptions,
  ) {
    this.now = options.now ?? (() => Date.now());
    this.locks =
      options.locks !== undefined
        ? options.locks
        : ((globalThis as { navigator?: { locks?: LockManagerLike } }).navigator?.locks ?? null);
  }

  getState(): AuthState {
    return this.state;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** At start-up: signed in again if the cookie or the desktop's stored token is still good. */
  async restore(): Promise<AuthState> {
    await this.refresh();
    return this.state;
  }

  /** Signs in, or returns the next step (second factor, or staff enrolment). */
  async signIn(email: string, password: string): Promise<LoginResponse> {
    const response = await this.transport.login(email, password);
    if (response.status === 'signed_in') this.accept(response);
    return response;
  }

  async verifyMfa(input: {
    challenge: string;
    code?: string;
    recovery_code?: string;
  }): Promise<void> {
    this.accept(await this.transport.verifyMfa(input));
  }

  /** Staff: confirms the first authenticator; the recovery codes are shown once. */
  async enrol(challenge: string, code: string): Promise<string[]> {
    if (!this.transport.enrol) throw new Error('enrolment is for staff sign-in');
    const result = await this.transport.enrol(challenge, code);
    this.accept(result);
    return result.recovery_codes;
  }

  /** Takes a signed-in answer from elsewhere (for example after switching company). */
  accept(body: SignedIn): void {
    this.token = { value: body.access_token, expiresAt: this.now() + body.expires_in * 1000 };
    this.set({ status: 'signed_in', membership: body.membership, memberships: body.memberships });
  }

  /** A valid access token, refreshed when it is about to expire; null when signed out. */
  async getAccessToken(): Promise<string | null> {
    if (this.token && this.token.expiresAt - this.now() > EARLY_MS) return this.token.value;
    if (this.state.status === 'signed_out') return null;
    return (await this.refresh()) ? (this.token?.value ?? null) : null;
  }

  /** Forgets the access token, for example when the API says the permissions changed. */
  invalidate(): void {
    this.token = null;
  }

  /**
   * One refresh at a time: requests in this tab share it, and Web Locks queue other tabs, so two
   * tabs never send the same refresh token (the API would take that for theft).
   */
  refresh(): Promise<boolean> {
    this.refreshing ??= this.withLock(async () => {
      try {
        this.accept(await this.transport.refresh());
        return true;
      } catch {
        this.token = null;
        this.set({ status: 'signed_out' });
        return false;
      }
    }).finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }

  async signOut(): Promise<void> {
    const token = this.token?.value ?? null;
    this.token = null;
    this.set({ status: 'signed_out' });
    await this.transport.logout(token).catch(() => undefined);
  }

  private withLock<T>(work: () => Promise<T>): Promise<T> {
    return this.locks ? this.locks.request(this.options.lockName, work) : work();
  }

  private set(state: AuthState): void {
    this.state = state;
    for (const listener of this.listeners) listener(state);
  }
}

/** The browser's device id: random, kept in localStorage, sent at sign-in (new-device notice). */
export function webDeviceId(
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = globalThis.localStorage,
): string | undefined {
  try {
    let id = storage?.getItem('erp.device_id') ?? null;
    if (!id) {
      id = `web-${crypto.randomUUID()}`;
      storage?.setItem('erp.device_id', id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/** The calls the web transport needs from @erp/sdk (members' or staff's). */
export type SdkAuthCalls = {
  login(body: { email: string; password: string; device_id?: string }): Promise<LoginResponse>;
  verifyMfa(body: { challenge: string; code?: string; recovery_code?: string }): Promise<SignedIn>;
  enrol?(challenge: string, code: string): Promise<EnrolResult>;
  refresh(): Promise<SignedIn>;
  logout(): Promise<unknown>;
};

/** Web: the refresh token is the API's httpOnly cookie; nothing here can read it. */
export function webTransport(calls: SdkAuthCalls, deviceId = webDeviceId()): AuthTransport {
  return {
    login: (email, password) =>
      calls.login({ email, password, ...(deviceId ? { device_id: deviceId } : {}) }),
    verifyMfa: (input) => calls.verifyMfa(input),
    ...(calls.enrol
      ? { enrol: (challenge: string, code: string) => calls.enrol!(challenge, code) }
      : {}),
    refresh: () => calls.refresh(),
    logout: async () => {
      await calls.logout();
    },
  };
}

/** What the desktop preload bridge exposes as window.erp.auth (apps/desktop). */
export type DesktopAuthBridge = {
  login(email: string, password: string): Promise<LoginResponse>;
  verifyMfa(input: { challenge: string; code?: string; recovery_code?: string }): Promise<SignedIn>;
  refresh(): Promise<SignedIn>;
  logout(): Promise<void>;
};

/** Desktop: the main process keeps the refresh token; the page only ever sees access tokens. */
export function desktopTransport(bridge: DesktopAuthBridge): AuthTransport {
  return {
    login: (email, password) => bridge.login(email, password),
    verifyMfa: (input) => bridge.verifyMfa(input),
    refresh: () => bridge.refresh(),
    logout: () => bridge.logout(),
  };
}

/** The bridge, when the page runs inside the desktop app. */
export function desktopBridge(): DesktopAuthBridge | undefined {
  return (globalThis as { erp?: { auth?: DesktopAuthBridge } }).erp?.auth;
}

export { AccessClient, type AccessClientOptions } from './access';
