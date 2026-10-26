import {
  LoginResponseSchema,
  ProblemDetailsSchema,
  SignedInSchema,
  type LoginResponse,
  type ProblemDetails,
  type SignedIn,
} from '@erp/contracts';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Sign-in for the desktop app (Part 10 §10.6, §10.12.1). The main process talks to the API with
// X-ERP-Client: desktop and keeps the refresh token, encrypted by the operating system's key
// store (safeStorage), in the app's data folder. The page only ever receives access tokens.

export type Crypto = {
  isEncryptionAvailable(): boolean;
  encryptString(plain: string): Buffer;
  decryptString(sealed: Buffer): string;
};

/** A failed API call, passed to the page as data (an Error would lose its fields over IPC). */
export type BridgeError = { status: number; problem: ProblemDetails | null };

export class DesktopAuth {
  private refreshing: Promise<SignedIn> | null = null;
  /** When the key store is unavailable the token lives in memory only, never on disk in clear. */
  private memoryToken: string | null = null;

  constructor(
    private readonly options: {
      apiUrl: string;
      dataDir: string;
      crypto: Crypto;
      fetch?: typeof fetch;
    },
  ) {}

  private get tokenFile(): string {
    return join(this.options.dataDir, 'session.bin');
  }

  /** A random id for this installation, so the API can tell a new device (§5.3.8). */
  deviceId(): string {
    const file = join(this.options.dataDir, 'device-id');
    if (existsSync(file)) return readFileSync(file, 'utf8').trim();
    const id = `desktop-${randomUUID()}`;
    writeFileSync(file, id, 'utf8');
    return id;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const body = LoginResponseSchema.parse(
      await this.call('/api/v1/auth/login', { email, password, device_id: this.deviceId() }),
    );
    return body.status === 'signed_in' ? this.keep(body) : body;
  }

  async verifyMfa(input: {
    challenge: string;
    code?: string;
    recovery_code?: string;
  }): Promise<SignedIn> {
    return this.keep(SignedInSchema.parse(await this.call('/api/v1/auth/mfa/verify', input)));
  }

  /** Rotates the stored refresh token; one request at a time. */
  refresh(): Promise<SignedIn> {
    this.refreshing ??= (async () => {
      const token = this.storedToken();
      if (!token) throw { status: 401, problem: null } satisfies BridgeError;
      try {
        return this.keep(
          SignedInSchema.parse(await this.call('/api/v1/auth/refresh', { refresh_token: token })),
        );
      } catch (error) {
        if ((error as BridgeError).status === 401) this.forget();
        throw error;
      }
    })().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }

  async logout(): Promise<void> {
    const token = this.storedToken();
    this.forget();
    if (token)
      await this.call('/api/v1/auth/logout', { refresh_token: token }).catch(() => undefined);
  }

  /** Keeps the refresh token; returns the body without it, for the page. */
  private keep(body: SignedIn): SignedIn {
    const { refresh_token: token, ...rest } = body;
    if (token) this.store(token);
    return rest;
  }

  private store(token: string): void {
    if (this.options.crypto.isEncryptionAvailable()) {
      writeFileSync(this.tokenFile, this.options.crypto.encryptString(token));
      this.memoryToken = null;
    } else {
      this.memoryToken = token;
    }
  }

  private storedToken(): string | null {
    if (this.memoryToken) return this.memoryToken;
    if (!existsSync(this.tokenFile) || !this.options.crypto.isEncryptionAvailable()) return null;
    try {
      return this.options.crypto.decryptString(readFileSync(this.tokenFile));
    } catch {
      return null;
    }
  }

  private forget(): void {
    this.memoryToken = null;
    rmSync(this.tokenFile, { force: true });
  }

  private async call(path: string, body: unknown): Promise<unknown> {
    const doFetch = this.options.fetch ?? fetch;
    let response: Response;
    try {
      response = await doFetch(new URL(path, this.options.apiUrl), {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-erp-client': 'desktop' },
        body: JSON.stringify(body),
      });
    } catch {
      throw { status: 0, problem: null } satisfies BridgeError;
    }
    const text = await response.text();
    const json: unknown = text ? JSON.parse(text) : undefined;
    if (!response.ok) {
      const problem = ProblemDetailsSchema.safeParse(json);
      throw {
        status: response.status,
        problem: problem.success ? problem.data : null,
      } satisfies BridgeError;
    }
    return json;
  }
}
