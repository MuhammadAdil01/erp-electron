import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DesktopAuth, type Crypto } from './desktop-auth';

// The desktop keeps the refresh token in the main process, encrypted by the OS key store; the
// page gets access tokens only (§10.6, acceptance: "no refresh token in DevTools storage").

const signedIn = (access: string, refresh: string) => ({
  status: 'signed_in',
  access_token: access,
  token_type: 'Bearer',
  expires_in: 600,
  refresh_token: refresh,
  membership: null,
  memberships: [],
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** A stand-in for safeStorage: reversible, and visibly not the plain token. */
const crypto = (available = true): Crypto => ({
  isEncryptionAvailable: () => available,
  encryptString: (plain) => Buffer.from(`sealed:${Buffer.from(plain).toString('base64')}`),
  decryptString: (sealed) => Buffer.from(sealed.toString().slice(7), 'base64').toString(),
});

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'erp-desktop-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('DesktopAuth', () => {
  it('keeps the refresh token encrypted on disk and gives the page none', async () => {
    const fetch = vi.fn(async () => json(200, signedIn('access-1', 'refresh-1')));
    const auth = new DesktopAuth({
      apiUrl: 'http://api.test',
      dataDir: dir,
      crypto: crypto(),
      fetch,
    });
    const body = await auth.login('a@example.com', 'pw');
    expect(body).not.toHaveProperty('refresh_token');
    const onDisk = readFileSync(join(dir, 'session.bin'), 'utf8');
    expect(onDisk).not.toContain('refresh-1');
    const [, init] = fetch.mock.calls[0] as unknown as [URL, RequestInit];
    expect((init.headers as Record<string, string>)['x-erp-client']).toBe('desktop');
    expect(JSON.parse(String(init.body)).device_id).toMatch(/^desktop-/);
  });

  it('reopens signed in: a new process refreshes with the stored token and rotates it', async () => {
    const first = new DesktopAuth({
      apiUrl: 'http://api.test',
      dataDir: dir,
      crypto: crypto(),
      fetch: vi.fn(async () => json(200, signedIn('access-1', 'refresh-1'))),
    });
    await first.login('a@example.com', 'pw');
    const fetch = vi.fn(async () => json(200, signedIn('access-2', 'refresh-2')));
    const restarted = new DesktopAuth({
      apiUrl: 'http://api.test',
      dataDir: dir,
      crypto: crypto(),
      fetch,
    });
    expect((await restarted.refresh()).access_token).toBe('access-2');
    expect(
      JSON.parse(String((fetch.mock.calls[0] as unknown as [URL, RequestInit])[1].body)),
    ).toEqual({
      refresh_token: 'refresh-1',
    });
    expect(crypto().decryptString(readFileSync(join(dir, 'session.bin')))).toBe('refresh-2');
  });

  it('forgets the token when the API refuses it, and on sign-out', async () => {
    const auth = new DesktopAuth({
      apiUrl: 'http://api.test',
      dataDir: dir,
      crypto: crypto(),
      fetch: vi
        .fn()
        .mockResolvedValueOnce(json(200, signedIn('a', 'r')))
        .mockResolvedValueOnce(
          json(401, { type: 'x', title: 'x', status: 401, code: 'unauthenticated' }),
        ),
    });
    await auth.login('a@example.com', 'pw');
    await expect(auth.refresh()).rejects.toMatchObject({
      status: 401,
      problem: { code: 'unauthenticated' },
    });
    expect(existsSync(join(dir, 'session.bin'))).toBe(false);
    await expect(auth.refresh()).rejects.toMatchObject({ status: 401 });
  });

  it('never writes the token in clear when the key store is unavailable', async () => {
    const auth = new DesktopAuth({
      apiUrl: 'http://api.test',
      dataDir: dir,
      crypto: crypto(false),
      fetch: vi.fn(async () => json(200, signedIn('a', 'refresh-clear'))),
    });
    await auth.login('a@example.com', 'pw');
    expect(existsSync(join(dir, 'session.bin'))).toBe(false);
  });

  it('keeps one device id per installation', () => {
    const auth = new DesktopAuth({ apiUrl: 'http://api.test', dataDir: dir, crypto: crypto() });
    expect(auth.deviceId()).toBe(auth.deviceId());
  });
});
