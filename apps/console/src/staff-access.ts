import type { StaffAccess, StaffPermission } from '@erp/contracts';
import { useSyncExternalStore } from 'react';
import { auth, sdk } from './auth';

// The signed-in staff member's roles, permissions, sidebar and badges (GET /me/access), loaded
// at sign-in and after changes. The API checks every call; this only decides what to show.

let current: StaffAccess | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export async function reloadStaffAccess(): Promise<StaffAccess | null> {
  try {
    current = await sdk.console.access();
  } catch {
    current = null;
  }
  notify();
  return current;
}

/** Called once at start-up: access follows the session. */
export function followStaffAccess(): void {
  auth().subscribe((state) => {
    if (state.status === 'signed_in') void reloadStaffAccess();
    else if (current) {
      current = null;
      notify();
    }
  });
}

export function useStaffAccess(): StaffAccess | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => current,
  );
}

/** Whether the staff member holds any of these permissions (outright or with four-eyes). */
export function holds(access: StaffAccess | null, ...permissions: StaffPermission[]): boolean {
  return Boolean(access && permissions.some((p) => access.permissions[p]));
}
