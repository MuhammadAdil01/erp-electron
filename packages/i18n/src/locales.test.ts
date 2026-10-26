import { describe, expect, it } from 'vitest';
import en from './locales/en.json';
import ur from './locales/ur.json';
import { createI18n } from './index';

const keys = (o: object, prefix = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? keys(v as object, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

describe('translations', () => {
  it('has every English key in Urdu and nothing more', () => {
    expect(keys(ur).sort()).toEqual(keys(en).sort());
  });

  it('fills in values the same way in both languages', () => {
    const vars = (s: string) => [...s.matchAll(/{{(\w+)}}/g)].map((m) => m[1]).sort();
    const flat = (o: object) =>
      Object.fromEntries(
        keys(o).map((k) => [
          k,
          k.split('.').reduce<unknown>((x, p) => (x as Record<string, unknown>)[p], o),
        ]),
      );
    const e = flat(en);
    const u = flat(ur);
    for (const key of Object.keys(e))
      expect(vars(String(u[key])), key).toEqual(vars(String(e[key])));
  });

  it('switches to Urdu', () => {
    const i18n = createI18n({ language: 'ur' });
    expect(i18n.t('signin.title')).toBe('سائن اِن');
  });
});
