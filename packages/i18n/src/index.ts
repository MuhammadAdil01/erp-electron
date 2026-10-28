import i18next, { type i18n, type Module } from 'i18next';
import en from './locales/en.json';

// Screen texts come from the translation file, never from the code (Part 12 §12.7). English is
// the only language (D12); the file keeps the door open for another one.

export const languages = ['en'] as const;
export type Language = (typeof languages)[number];

export const resources = {
  en: { translation: en },
} as const;

export type CreateI18nOptions = {
  language?: Language;
  /** i18next plugins, for example initReactI18next from react-i18next. */
  plugins?: Module[];
};

/** Creates an i18next instance with the bundled translations, ready to use. */
export function createI18n({ language = 'en', plugins = [] }: CreateI18nOptions = {}): i18n {
  const instance = i18next.createInstance();
  for (const plugin of plugins) instance.use(plugin);
  void instance.init({
    resources,
    lng: language,
    fallbackLng: 'en',
    initAsync: false,
    interpolation: { escapeValue: false },
  });
  return instance;
}
