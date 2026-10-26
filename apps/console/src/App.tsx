import { injectTokens, Button, ToastProvider } from '@erp/ui';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useNavigate,
} from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { auth, useAuthState } from './auth';
import { i18n } from './i18n';
import { startIdleTimer } from './idle';
import { HomePage } from './pages/HomePage';
import { SetupPage } from './pages/SetupPage';
import { SignInPage } from './pages/SignInPage';

// Platform operators' app (§10.1, Part 03 §3.3), separate from the tenant web app: staff
// sign-in only, signed out after 30 minutes without use.

let signedOutForIdle = false;

/** The frame of every console page: title, and sign-out once signed in. */
export function ConsoleFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const state = useAuthState();
  const navigate = useNavigate();
  useEffect(() => {
    if (state.status !== 'signed_in') return;
    return startIdleTimer({
      onIdle: () => {
        signedOutForIdle = true;
        void auth()
          .signOut()
          .then(() => navigate({ to: '/signin' }));
      },
    });
  }, [state.status, navigate]);
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          borderBottom: '1px solid var(--erp-color-border)',
        }}
      >
        <strong>{t('app.console_title')}</strong>
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
      </header>
      <main style={{ maxWidth: 560, margin: '0 auto', padding: 24 }}>{children}</main>
    </div>
  );
}

function RequireStaff({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const state = useAuthState();
  if (state.status === 'loading') return <p aria-busy="true">{t('common.loading')}</p>;
  if (state.status === 'signed_out') return <Navigate to="/signin" />;
  return <>{children}</>;
}

function SignInRoute() {
  const [idle] = useState(() => {
    const was = signedOutForIdle;
    signedOutForIdle = false;
    return was;
  });
  return <SignInPage idle={idle} />;
}

const rootRoute = createRootRoute({
  component: () => (
    <ConsoleFrame>
      <Outlet />
    </ConsoleFrame>
  ),
});
const parent = () => rootRoute;

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    createRoute({
      getParentRoute: parent,
      path: '/',
      component: () => (
        <RequireStaff>
          <HomePage />
        </RequireStaff>
      ),
    }),
    createRoute({ getParentRoute: parent, path: '/signin', component: SignInRoute }),
    createRoute({ getParentRoute: parent, path: '/setup/$token', component: SetupPage }),
  ]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ToastProvider closeLabel={i18n.t('common.close')}>
        <RouterProvider router={router} />
      </ToastProvider>
    </I18nextProvider>
  );
}

export function start(): void {
  injectTokens();
  void auth().restore();
}
