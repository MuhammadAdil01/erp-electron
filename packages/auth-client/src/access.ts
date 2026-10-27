import { canAccess, type MeAccess, type ScopedRecord } from '@erp/contracts';
import type { AuthState } from './index';

// The member's access in the current company (GET /me/access, Part 10 §10.7.5), for screens:
// can(key, record?), the menu and the company's status. Loaded when a company is chosen; loaded
// again (and the token refreshed) when a response's X-Access-Version moves past it, and when
// the answer says it will change by itself (an entitlement or exception ending). The API
// decides; this only decides what to show.

export type AccessClientOptions = {
  /** GET /me/access */
  load: () => Promise<MeAccess>;
  /** Refreshes the access token, so its pv matches the new access. */
  refreshToken: () => Promise<unknown>;
  now?: () => number;
  setTimer?: (run: () => void, ms: number) => unknown;
  clearTimer?: (timer: unknown) => void;
};

type AuthSource = {
  getState(): AuthState;
  subscribe(listener: (state: AuthState) => void): () => void;
};

export class AccessClient {
  private access: MeAccess | null = null;
  private membershipId: string | null = null;
  private loading: Promise<MeAccess | null> | null = null;
  /** Counts loads; only the latest one marks loading as finished. */
  private generation = 0;
  private timer: unknown = null;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly options: AccessClientOptions) {}

  /** Follows the session: loads for the chosen company, forgets without one. */
  follow(auth: AuthSource): () => void {
    const onState = (state: AuthState) => {
      const id = state.status === 'signed_in' ? (state.membership?.membership_id ?? null) : null;
      if (id === this.membershipId) return;
      this.membershipId = id;
      this.loading = null; // a load still running is for the previous company
      this.replace(null);
      if (id) void this.start();
    };
    onState(auth.getState());
    return auth.subscribe(onState);
  }

  get(): MeAccess | null {
    return this.access;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  can(permission: string, record?: ScopedRecord): boolean {
    return this.access ? canAccess(this.access, permission, record) : false;
  }

  /** The current company's access once loaded; null without a company. */
  ready(): Promise<MeAccess | null> {
    if (this.access || !this.membershipId) return Promise.resolve(this.access);
    return this.loading ?? this.start();
  }

  /** The X-Access-Version of a company response: another number means access changed. */
  noteVersion(version: number): void {
    if (!this.access || version === this.access.pv || this.loading) return;
    void this.start(() => this.options.refreshToken());
  }

  /** Loads again now (one load at a time). */
  reload(): Promise<MeAccess | null> {
    return this.loading ?? this.start();
  }

  /**
   * One load: `before` (a token refresh) then GET /me/access. An answer is kept only while it
   * is still for the chosen company, and only the latest load marks loading as finished.
   */
  private start(before?: () => Promise<unknown>): Promise<MeAccess | null> {
    const membershipId = this.membershipId;
    const generation = ++this.generation;
    const run = (async () => {
      try {
        await before?.().catch(() => undefined);
        const access = await this.options.load();
        if (membershipId && membershipId === this.membershipId) this.replace(access);
      } catch {
        // Keep what we have; the next response or company change tries again.
      } finally {
        if (this.generation === generation) this.loading = null;
      }
      return this.access;
    })();
    this.loading = run;
    return run;
  }

  private replace(access: MeAccess | null): void {
    const clear =
      this.options.clearTimer ?? ((t) => clearTimeout(t as ReturnType<typeof setTimeout>));
    if (this.timer !== null) clear(this.timer);
    this.timer = null;
    if (access?.valid_until) {
      const now = this.options.now ?? (() => Date.now());
      const set = this.options.setTimer ?? ((run, ms) => setTimeout(run, ms));
      const wait = Math.max(1000, Date.parse(access.valid_until) - now());
      this.timer = set(() => void this.reload(), wait);
    }
    this.access = access;
    for (const listener of this.listeners) listener();
  }
}
