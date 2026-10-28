import { CONSOLE_MENU } from '@erp/contracts';
import { describe, expect, it } from 'vitest';
import { router } from './App';

// The live Stage 4 run found a page looking for its route under an id that no longer existed.
// Pages now read their params without naming a route, and this checks the paths themselves.

const found = (path: string) => {
  const [, params, route] = router.getMatchedRoutes(path);
  return { route: route?.fullPath, params };
};

describe('console routes', () => {
  it('give every sidebar entry a screen', () => {
    for (const entry of CONSOLE_MENU.flatMap((g) => g.entries)) {
      expect(found(entry.path).route, entry.path).toBe(entry.path);
    }
  });

  it('pass the parameters the record pages read', () => {
    expect(found('/catalogue/templates/restaurant_cafe/1.1.0')).toEqual({
      route: '/catalogue/templates/$key/$version',
      params: { key: 'restaurant_cafe', version: '1.1.0' },
    });
    expect(found('/catalogue/country-packs/PK/1.0')).toEqual({
      route: '/catalogue/country-packs/$country/$version',
      params: { country: 'PK', version: '1.0' },
    });
    expect(found('/setup/abc123')).toEqual({ route: '/setup/$token', params: { token: 'abc123' } });
    expect(found('/signin').route).toBe('/signin');
  });
});
