import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it } from 'vitest';
import { i18n } from './i18n';
import { Translated } from './toasts';

describe('toasts', () => {
  afterEach(() => i18n.changeLanguage('en'));

  it('translate when they render, so an open toast follows a language switch', async () => {
    const toast = <Translated k="security.mfa_enabled" />;
    const render = () =>
      renderToStaticMarkup(<I18nextProvider i18n={i18n}>{toast}</I18nextProvider>);
    expect(render()).toBe('Two-step sign-in is on.');
    await i18n.changeLanguage('ur');
    expect(render()).toBe('دو مرحلہ سائن اِن آن ہو گئی ہے۔');
  });
});
