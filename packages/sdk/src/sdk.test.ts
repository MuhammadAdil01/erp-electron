import { describe, expect, it, vi } from 'vitest';
import { ApiError, createSdk } from './index';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('sdk', () => {
  it('checks responses against the contracts and sends the cookie on web', async () => {
    const fetch = vi.fn(async () => json(200, { status: 'accepted' }));
    const sdk = createSdk({ baseUrl: 'http://api.test', fetch });
    await expect(sdk.auth.forgotPassword('a@example.com')).resolves.toEqual({ status: 'accepted' });
    const [url, init] = fetch.mock.calls[0] as unknown as [URL, RequestInit];
    expect(url.toString()).toBe('http://api.test/api/v1/auth/password/forgot');
    expect(init.credentials).toBe('include');
    expect(JSON.parse(String(init.body))).toEqual({ email: 'a@example.com' });
  });

  it('turns a problem response into an ApiError with its code', async () => {
    const problem = {
      type: 'https://erp.invalid/problems/invalid-credentials',
      title: 'The e-mail or password is not right',
      status: 401,
      code: 'invalid_credentials',
    };
    const sdk = createSdk({
      baseUrl: 'http://api.test',
      fetch: vi.fn(async () => json(401, problem)),
    });
    const error = await sdk.auth.login({ email: 'a@example.com', password: 'x' }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('invalid_credentials');
  });

  it('adds the access token, refreshes once on 401 and retries', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        json(401, { type: 'x', title: 'x', status: 401, code: 'unauthenticated' }),
      )
      .mockResolvedValueOnce(json(200, { id: 's', email: 'a', name: 'A', roles: [] }));
    let token = 'old';
    const onUnauthorized = vi.fn(async () => {
      token = 'new';
      return true;
    });
    const sdk = createSdk({
      baseUrl: 'http://api.test',
      fetch,
      getAccessToken: async () => token,
      onUnauthorized,
    });
    await expect(sdk.staff.me()).rejects.toThrow(); // id is not a uuid: the contract refuses it
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    const headers = fetch.mock.calls.map(
      (c) => (c[1] as RequestInit).headers as Record<string, string>,
    );
    expect(headers.map((h) => h.authorization)).toEqual(['Bearer old', 'Bearer new']);
  });

  it('marks desktop calls and never sends cookies from the main process', async () => {
    const fetch = vi.fn(async () => json(200, { status: 'done' }));
    const sdk = createSdk({ baseUrl: 'http://api.test', fetch, client: 'desktop' });
    await sdk.auth.logout('refresh-token-value-123456');
    const init = (fetch.mock.calls[0] as unknown as [URL, RequestInit])[1];
    expect((init.headers as Record<string, string>)['x-erp-client']).toBe('desktop');
    expect(init.credentials).toBe('omit');
    expect(JSON.parse(String(init.body))).toEqual({ refresh_token: 'refresh-token-value-123456' });
  });
  it('reports the access version of each response, refused ones included', async () => {
    const versions: number[] = [];
    const withVersion = (status: number, body: unknown, version: string) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json', 'x-access-version': version },
      });
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(withVersion(200, { status: 'done' }, '12'))
      .mockResolvedValueOnce(
        withVersion(403, { type: 'x', title: 'x', status: 403, code: 'permission_denied' }, '13'),
      )
      .mockResolvedValueOnce(json(200, { status: 'done' }));
    const sdk = createSdk({
      baseUrl: 'http://api.test',
      fetch,
      getAccessToken: async () => 't',
      onAccessVersion: (v) => versions.push(v),
    });
    await sdk.auth.logoutAll();
    await sdk.auth.logoutAll().catch(() => undefined);
    await sdk.auth.logoutAll();
    expect(versions).toEqual([12, 13]);
  });
  it('reads ETags, sends If-Match, returns CSV as text and leaves out empty query values', async () => {
    const detail = {
      key: 't',
      version: '1.0.0',
      status: 'draft',
      name: { en: 'T', ur: 'ٹی' },
      industry: 'general',
      roles: 0,
      entitlements: 0,
      published_at: null,
      published_by: null,
      updated_at: '2026-10-29T00:00:00.000Z',
      revision: 2,
      definition: {
        key: 't',
        version: '1.0.0',
        name: { en: 'T', ur: 'ٹی' },
        industry: 'general',
        description: '',
        entitlements: [],
        limits: {},
        terminology: {},
        roles: [],
        settings: {},
        wizard: [],
      },
      problems: [],
    };
    const CSV = ['seq,at', '1,x', ''].join(String.fromCharCode(13, 10));
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(detail), { status: 200, headers: { etag: 'W/"2"' } }),
      )
      .mockResolvedValueOnce(new Response(CSV, { status: 200 }))
      .mockResolvedValueOnce(json(200, { data: [] }));
    const sdk = createSdk({ baseUrl: 'http://api.test', fetch, getAccessToken: async () => 't' });
    const got = await sdk.console.templates.update(
      't',
      '1.0.0',
      { definition: detail.definition, reason: 'test' } as never,
      'W/"1"',
    );
    expect(got.etag).toBe('W/"2"');
    const [, init] = fetch.mock.calls[0] as unknown as [URL, RequestInit];
    expect((init.headers as Record<string, string>)['if-match']).toBe('W/"1"');
    expect(init.method).toBe('PUT');
    expect(await sdk.console.audit.exportCsv({ action: 'catalogue.' })).toBe(CSV);
    await sdk.console.approvals.list();
    const [url] = fetch.mock.calls[2] as unknown as [URL];
    expect(url.toString()).toBe('http://api.test/api/platform/v1/approvals');
  });
});
