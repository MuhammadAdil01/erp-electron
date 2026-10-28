import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from './i18n';
import { Translated } from './toasts';

describe('toasts', () => {
  it('show the text of their translation key', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18n}>
        <Translated k="security.mfa_enabled" />
      </I18nextProvider>,
    );
    expect(html).toBe('Two-step sign-in is on.');
  });
});
