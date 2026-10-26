import type { SignedIn } from '@erp/contracts';
import { describe, expect, it, vi } from 'vitest';
import { AuthClient, webDeviceId, type AuthTransport } from './index';

const signedIn = (token: string, expiresIn = 600): SignedIn => ({
  status: 'signed_in',
  access_token: token,
  token_type: 'Bearer',
  expires_in: expiresIn,
  membership: null,
  memberships: [],
});

function transport(overrides: Partial<AuthTransport> = {}): AuthTransport {
  return {
    login: vi.fn(async () => signedIn('login-token')),
    verifyMfa: vi.fn(async () => signedIn('mfa-token')),
    refresh: vi.fn(async () => signedIn('refreshed-token')),
    logout: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe('AuthClient', () => {
  it('keeps the access token in memory and reuses it until a minute before it expires', async () => {
    let now = 0;
    const t = transport();
    const client = new AuthClient(t, { lockName: 'test', now: () => now, locks: null });
    await client.signIn('a@example.com', 'pw');
    expect(await client.getAccessToken()).toBe('login-token');
    now = 9 * 60_000 + 1; // less than a minute left
    expect(await client.getAccessToken()).toBe('refreshed-token');
    expect(t.refresh).toHaveBeenCalledTimes(1);
  });

  it('sends one refresh for many waiting requests (single flight)', async () => {
    let release!: () => void;
    const t = transport({
      refresh: vi.fn(
        () => new Promise<SignedIn>((resolve) => (release = () => resolve(signedIn('one')))),
      ),
    });
    const client = new AuthClient(t, { lockName: 'test', locks: null });
    const waiting = [client.getAccessToken(), client.getAccessToken(), client.getAccessToken()];
    release();
    expect(await Promise.all(waiting)).toEqual(['one', 'one', 'one']);
    expect(t.refresh).toHaveBeenCalledTimes(1);
  });

  it('queues refreshes behind a Web Lock, so tabs never send the same refresh token', async () => {
    const names: string[] = [];
    const locks = {
      request: <T>(name: string, work: () => Promise<T>) => {
        names.push(name);
        return work();
      },
    };
    const client = new AuthClient(transport(), { lockName: 'erp-web-refresh', locks });
    await client.restore();
    expect(names).toEqual(['erp-web-refresh']);
  });

  it('reports signed out when the refresh fails, and stops asking', async () => {
    const t = transport({ refresh: vi.fn(async () => Promise.reject(new Error('401'))) });
    const client = new AuthClient(t, { lockName: 'test', locks: null });
    const states: string[] = [];
    client.subscribe((s) => states.push(s.status));
    expect((await client.restore()).status).toBe('signed_out');
    expect(await client.getAccessToken()).toBeNull();
    expect(t.refresh).toHaveBeenCalledTimes(1);
    expect(states).toEqual(['signed_out']);
  });

  it('waits for the second factor before signing in', async () => {
    const t = transport({
      login: vi.fn(async () => ({
        status: 'mfa_required' as const,
        challenge: 'c'.repeat(32),
        methods: ['totp' as const],
      })),
    });
    const client = new AuthClient(t, { lockName: 'test', locks: null });
    const first = await client.signIn('a@example.com', 'pw');
    expect(first.status).toBe('mfa_required');
    expect(client.getState().status).toBe('loading');
    await client.verifyMfa({ challenge: 'c'.repeat(32), code: '123456' });
    expect(client.getState().status).toBe('signed_in');
    expect(await client.getAccessToken()).toBe('mfa-token');
  });

  it('signs out locally even when the API cannot be reached', async () => {
    const t = transport({ logout: vi.fn(async () => Promise.reject(new Error('offline'))) });
    const client = new AuthClient(t, { lockName: 'test', locks: null });
    await client.signIn('a@example.com', 'pw');
    await client.signOut();
    expect(client.getState().status).toBe('signed_out');
    expect(t.logout).toHaveBeenCalledWith('login-token');
  });
});

describe('webDeviceId', () => {
  it('makes one random id per browser and keeps it', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
    const id = webDeviceId(storage);
    expect(id).toMatch(/^web-[0-9a-f-]{36}$/);
    expect(webDeviceId(storage)).toBe(id);
  });
});
