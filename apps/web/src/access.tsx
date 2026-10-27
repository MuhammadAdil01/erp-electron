import { AccessClient } from '@erp/auth-client';
import {
  canAccess,
  CATALOGUE,
  type MeAccess,
  type ScopedRecord,
  type TenantStatus,
} from '@erp/contracts';
import { redirect } from '@tanstack/react-router';
import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { auth, onAccessVersion, sdk } from './auth';

// What the member may do in the current company (GET /me/access, Part 10 §10.7.5), for screens:
// useCan()/<Can> around buttons, requirePermission() on routes, and the company's status. The
// API is the authority; this only decides what to show.

export const access = new AccessClient({
  load: () => sdk.me.access(),
  refreshToken: () => auth().refresh(),
});
onAccessVersion((version) => access.noteVersion(version));

/** Called once at start-up: access follows the session (sign-in, company switch, sign-out). */
export function startAccess(): void {
  access.follow(auth());
}

/** Lets a part of the page show someone else's access (tests, "Preview as this user"). */
const AccessOverride = createContext<MeAccess | null | undefined>(undefined);
export const AccessPreview = AccessOverride.Provider;

export function useAccess(): MeAccess | null {
  const preview = useContext(AccessOverride);
  const live = useSyncExternalStore(
    (listener) => access.subscribe(listener),
    () => access.get(),
    () => access.get(),
  );
  return preview !== undefined ? preview : live;
}

export function useCan(): (permission: string, record?: ScopedRecord) => boolean {
  const current = useAccess();
  return useCallback(
    (permission, record) => (current ? canAccess(current, permission, record) : false),
    [current],
  );
}

/** Shows `children` only when the member may do `permission` (on `record`, if given). */
export function Can({
  permission,
  record,
  children,
  fallback = null,
}: {
  permission: string;
  record?: ScopedRecord;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <>{useCan()(permission, record) ? children : fallback}</>;
}

/**
 * A route's beforeLoad: without the permission, go to the "no access" page, which says why.
 * `source` is for tests.
 */
export function requirePermission(
  permission: string,
  source: { ready(): Promise<MeAccess | null> } = access,
) {
  return async () => {
    const current = await source.ready();
    if (!current || !canAccess(current, permission)) {
      throw redirect({ to: '/no-access', search: { permission } });
    }
  };
}

/** Why a permission is missing (Part 05 §5.5.7): not in the company's plan, or not in the role. */
export function reasonOf(current: MeAccess | null, permission: string): 'plan' | 'role' {
  const effective = new Set(current?.features.map((f) => f.key));
  return CATALOGUE.featuresOfPermission(permission).some((f) => effective.has(f)) ? 'role' : 'plan';
}

/** Company statuses that limit what members can do, each with its banner (Part 03 §3.7.2). */
export const LIMITED_STATUSES: readonly TenantStatus[] = [
  'trial_expired',
  'suspended_read_only',
  'suspended_locked',
  'pending_termination',
];
