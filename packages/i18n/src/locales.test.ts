import { describe, expect, it } from 'vitest';
import en from './locales/en.json';
import { createI18n } from './index';

const entries = (o: object, prefix = ''): [string, unknown][] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? entries(v as object, `${prefix}${k}.`)
      : [[`${prefix}${k}`, v] as [string, unknown]],
  );

describe('translations', () => {
  it('give every key a text', () => {
    for (const [key, value] of entries(en)) {
      expect(typeof value, key).toBe('string');
      expect(String(value).trim(), key).not.toBe('');
    }
  });

  it('write placeholders as {{name}}', () => {
    for (const [key, value] of entries(en)) {
      const text = String(value);
      expect(text.match(/{{/g)?.length ?? 0, key).toBe(text.match(/{{\w+}}/g)?.length ?? 0);
    }
  });

  it('load English', () => {
    const i18n = createI18n();
    expect(i18n.language).toBe('en');
    expect(i18n.t('signin.title')).toBe('Sign in');
  });
});
