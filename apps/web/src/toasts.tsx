import { ToastProvider, useToast } from '@erp/ui';
import { useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// A toast outlives the render that showed it, so it keeps its translation key and translates
// itself: switching the language while it is open switches its text too.

export function Translated({ k }: { k: string }) {
  const { t } = useTranslation();
  return <>{t(k)}</>;
}

/** The toast area, with its close label in the current language. */
export function Toasts({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return <ToastProvider closeLabel={t('common.close')}>{children}</ToastProvider>;
}

/** toast('security.changed'): shows the text of a translation key in the current language. */
export function useTranslatedToast() {
  const show = useToast();
  return useCallback(
    (key: string, tone?: 'success' | 'error' | 'info') => show(<Translated k={key} />, tone),
    [show],
  );
}
