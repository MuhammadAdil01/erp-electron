import { Button } from '@erp/ui';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, useAuthState } from './auth';

// The frame around every page: title, language switch (Urdu right to left) and sign-out.

export function Shell({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const state = useAuthState();
  const navigate = useNavigate();
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
  }, [i18n.language]);
  return (
    <div className="min-h-screen">
      <header
        className="flex items-center justify-between gap-4 border-b px-6 py-3"
        style={{ borderColor: 'var(--erp-color-border)' }}
      >
        <span className="text-lg font-semibold">{t('app.title')}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="underline"
            onClick={() => void i18n.changeLanguage(i18n.language === 'ur' ? 'en' : 'ur')}
          >
            {t('common.language')}
          </button>
          {state.status === 'signed_in' && (
            <Button
              onClick={() => {
                void auth()
                  .signOut()
                  .then(() => navigate({ to: '/signin' }));
              }}
            >
              {t('common.sign_out')}
            </Button>
          )}
        </div>
      </header>
      <main className="mx-auto flex max-w-xl flex-col gap-6 p-6">{children}</main>
    </div>
  );
}

/** Pages for signed-in people only; others go to sign-in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const state = useAuthState();
  if (state.status === 'loading') return <p aria-busy="true">{t('common.loading')}</p>;
  if (state.status === 'signed_out') return <Navigate to="/signin" />;
  return <>{children}</>;
}
