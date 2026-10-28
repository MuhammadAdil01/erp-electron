import type { StaffPermission } from '@erp/contracts';
import { injectTokens, ToastProvider } from '@erp/ui';
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
import { ApprovalsPage } from './pages/ApprovalsPage';
import { AuditPage } from './pages/AuditPage';
import { CountryPackPage, CountryPacksPage } from './pages/CountryPacksPage';
import { HomePage } from './pages/HomePage';
import { ModulesPage } from './pages/ModulesPage';
import { PlansPage } from './pages/PlansPage';
import { SetupPage } from './pages/SetupPage';
import { SignInPage } from './pages/SignInPage';
import { StaffPage } from './pages/StaffPage';
import { TemplatePage, TemplatesPage } from './pages/TemplatesPage';
import { ConsoleShell, Guarded } from './shell';
import { followStaffAccess } from './staff-access';
import { StepUpProvider } from './step-up';

// Platform operators' app (§10.1, Part 03 §3.3), separate from the tenant web app: staff
// sign-in only, signed out after 30 minutes without use. Signed-in pages sit in the console
// shell; each page also checks the staff permission it needs, as the API does.

let signedOutForIdle = false;

/** Signs the staff member out after 30 minutes without use. */
function IdleWatch() {
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
  return null;
}

/** The frame of the signed-out pages: sign-in and account set-up. */
export function ConsoleFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <header style={{ padding: '12px 24px', borderBottom: '1px solid var(--erp-color-border)' }}>
        <strong>{t('app.console_title')}</strong>
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
    <>
      <IdleWatch />
      <Outlet />
    </>
  ),
});
const publicLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: () => (
    <ConsoleFrame>
      <Outlet />
    </ConsoleFrame>
  ),
});
const staffLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'staff',
  component: () => (
    <RequireStaff>
      <StepUpProvider>
        <ConsoleShell>
          <Outlet />
        </ConsoleShell>
      </StepUpProvider>
    </RequireStaff>
  ),
});

/** A page for staff holding one of these permissions (the API checks them too). */
const guarded = (anyOf: StaffPermission[], Page: () => ReactNode) =>
  function GuardedPage() {
    return (
      <Guarded anyOf={anyOf}>
        <Page />
      </Guarded>
    );
  };
const staffPage = () => staffLayout;
const AUDIT: StaffPermission[] = [
  'audit.view',
  'audit.view_own',
  'audit.view_billing',
  'audit.view_ops',
];

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    publicLayout.addChildren([
      createRoute({ getParentRoute: () => publicLayout, path: '/signin', component: SignInRoute }),
      createRoute({
        getParentRoute: () => publicLayout,
        path: '/setup/$token',
        component: SetupPage,
      }),
    ]),
    staffLayout.addChildren([
      createRoute({
        getParentRoute: staffPage,
        path: '/',
        component: guarded(['dashboard.view'], HomePage),
      }),
      createRoute({
        getParentRoute: staffPage,
        path: '/staff',
        component: guarded(['staff.view'], StaffPage),
      }),
      createRoute({
        getParentRoute: staffPage,
        path: '/catalogue/modules',
        component: guarded(['catalogue.view'], ModulesPage),
      }),
      createRoute({
        getParentRoute: staffPage,
        path: '/catalogue/plans',
        component: guarded(['catalogue.view', 'catalogue.prices'], PlansPage),
      }),
      createRoute({
        getParentRoute: staffPage,
        path: '/catalogue/templates',
        component: guarded(['catalogue.view', 'catalogue.draft'], TemplatesPage),
      }),
      createRoute({
        getParentRoute: staffPage,
        path: '/catalogue/templates/$key/$version',
        component: guarded(['catalogue.view', 'catalogue.draft'], TemplatePage),
      }),
      createRoute({
        getParentRoute: staffPage,
        path: '/catalogue/country-packs',
        component: guarded(['country_packs.view'], CountryPacksPage),
      }),
      createRoute({
        getParentRoute: staffPage,
        path: '/catalogue/country-packs/$country/$version',
        component: guarded(['country_packs.view'], CountryPackPage),
      }),
      createRoute({
        getParentRoute: staffPage,
        path: '/approvals',
        component: guarded(['approvals.view'], ApprovalsPage),
      }),
      createRoute({
        getParentRoute: staffPage,
        path: '/audit',
        component: guarded(AUDIT, AuditPage),
      }),
    ]),
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
  followStaffAccess();
  void auth().restore();
}
