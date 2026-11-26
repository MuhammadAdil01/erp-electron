import {
  createBrowserHistory,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import type { ComponentType } from 'react';
import { ChoosePage } from './pages/ChoosePage';
import { EmailConfirmPage } from './pages/EmailConfirmPage';
import { ForgotPage } from './pages/ForgotPage';
import { HomePage } from './pages/HomePage';
import { NoAccessPage } from './pages/NoAccessPage';
import { PartiesPage } from './pages/parties/PartiesPage';
import { NewPartyPage, PartyRecordPage } from './pages/parties/PartyPage';
import { ResetPage } from './pages/ResetPage';
import { SecurityPage } from './pages/SecurityPage';
import { SignInPage } from './pages/SignInPage';
import { requirePermission } from './access';
import { RequireAuth, WebShell } from './shell';

const rootRoute = createRootRoute({ component: Outlet });

/** Pages for signed-in people only, in the app shell. */
const signedIn = (Page: ComponentType) =>
  function SignedInPage() {
    return (
      <RequireAuth>
        <WebShell>
          <Page />
        </WebShell>
      </RequireAuth>
    );
  };

/** Signed-in pages without the shell: the company choice comes before any company. */
const signedInBare = (Page: ComponentType) =>
  function SignedInBarePage() {
    return (
      <RequireAuth>
        <Page />
      </RequireAuth>
    );
  };

const parent = () => rootRoute;

const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: parent, path: '/', component: signedIn(HomePage) }),
  createRoute({ getParentRoute: parent, path: '/signin', component: SignInPage }),
  createRoute({ getParentRoute: parent, path: '/forgot', component: ForgotPage }),
  createRoute({ getParentRoute: parent, path: '/reset/$token', component: ResetPage }),
  createRoute({
    getParentRoute: parent,
    path: '/email/confirm/$token',
    component: EmailConfirmPage,
  }),
  createRoute({ getParentRoute: parent, path: '/choose', component: signedInBare(ChoosePage) }),
  createRoute({
    getParentRoute: parent,
    path: '/account/security',
    component: signedIn(SecurityPage),
  }),
  // Parties (Part 06 §6.2.1): replaces the old build's Business Partners.
  createRoute({
    getParentRoute: parent,
    path: '/parties',
    beforeLoad: requirePermission('core.parties.view'),
    component: signedIn(PartiesPage),
  }),
  createRoute({
    getParentRoute: parent,
    path: '/parties/new',
    beforeLoad: requirePermission('core.parties.create'),
    component: signedIn(NewPartyPage),
  }),
  createRoute({
    getParentRoute: parent,
    path: '/parties/$id',
    beforeLoad: requirePermission('core.parties.view'),
    component: signedIn(PartyRecordPage),
  }),
  createRoute({
    getParentRoute: parent,
    path: '/no-access',
    validateSearch: (search: Record<string, unknown>) => ({
      permission: typeof search.permission === 'string' ? search.permission : '',
    }),
    component: signedIn(NoAccessPage),
  }),
]);

// The packaged desktop app loads the build from file://, where only hash URLs work.
const history =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? createHashHistory()
    : createBrowserHistory();

export const router = createRouter({ routeTree, history });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
