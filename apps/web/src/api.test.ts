import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_BASE, fetchHealth } from './api';

const answer = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('fetchHealth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls GET /health on the API and returns the parsed body', async () => {
    const fetch = answer(200, { status: 'ok' });
    vi.stubGlobal('fetch', fetch);
    await expect(fetchHealth()).resolves.toEqual({ status: 'ok' });
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/health`);
  });

  it('fails on an error status', async () => {
    vi.stubGlobal('fetch', answer(503, { status: 'error' }));
    await expect(fetchHealth()).rejects.toThrow('API returned 503');
  });

  it('fails when the body does not match the shared contract', async () => {
    vi.stubGlobal('fetch', answer(200, { status: 'maybe' }));
    await expect(fetchHealth()).rejects.toThrow();
  });
});
