import { describe, expect, it } from 'vitest';
import { DEV_API_URL, resolveApiUrl } from './api-url';

const pkg = (body: object) => () => JSON.stringify({ name: '@erp/desktop', ...body });

describe('resolveApiUrl', () => {
  it('uses ERP_API_URL first, without a trailing slash', () => {
    expect(
      resolveApiUrl({
        env: { ERP_API_URL: 'http://localhost:3070/' },
        packaged: true,
        appPath: 'x',
        read: pkg({ erpApiUrl: 'https://api.example.test' }),
      }),
    ).toBe('http://localhost:3070');
  });

  it('an installer uses the address it was built for', () => {
    expect(
      resolveApiUrl({
        env: {},
        packaged: true,
        appPath: 'C:/app/resources/app.asar',
        read: pkg({ erpApiUrl: 'https://erp-api-staging.up.railway.app/' }),
      }),
    ).toBe('https://erp-api-staging.up.railway.app');
  });

  it('falls back to the local API in development or when the package has no usable address', () => {
    const read = pkg({ erpApiUrl: 'https://api.example.test' });
    expect(resolveApiUrl({ env: {}, packaged: false, appPath: 'x', read })).toBe(DEV_API_URL);
    for (const erpApiUrl of [undefined, '', 'ftp://x', 'not a url', 42]) {
      expect(
        resolveApiUrl({ env: {}, packaged: true, appPath: 'x', read: pkg({ erpApiUrl }) }),
      ).toBe(DEV_API_URL);
    }
    const broken = () => {
      throw new Error('ENOENT');
    };
    expect(resolveApiUrl({ env: {}, packaged: true, appPath: 'x', read: broken })).toBe(
      DEV_API_URL,
    );
  });
});
