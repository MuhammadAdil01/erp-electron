import { ToastProvider, useToast } from '@erp/ui';
import { useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Toasts show texts from the translation file: the caller passes a key, and the toast
// translates it when it renders.

export function Translated({ k }: { k: string }) {
  const { t } = useTranslation();
  return <>{t(k)}</>;
}

/** The toast area, with its close label from the translation file. */
export function Toasts({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return <ToastProvider closeLabel={t('common.close')}>{children}</ToastProvider>;
}

/** toast('security.changed'): shows the text of a translation key. */
export function useTranslatedToast() {
  const show = useToast();
  return useCallback(
    (key: string, tone?: 'success' | 'error' | 'info') => show(<Translated k={key} />, tone),
    [show],
  );
}
