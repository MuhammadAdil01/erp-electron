import type { MeAccess } from '@erp/contracts';
import { isRedirect } from '@tanstack/react-router';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AuthState } from '@erp/auth-client';
import { AccessPreview, Can, reasonOf, requirePermission, sessionSettled } from './access';

const waiter: MeAccess = {
  tenant: { id: 't', code: 'T-AAAAAA', status: 'active' },
  membership_id: 'm1',
  is_owner: false,
  pv: 5,
  valid_until: null,
  features: [
    { key: 'core.org', state: 'on' },
    { key: 'restaurant.waiter_app', state: 'on' },
  ],
  permissions: {
    'restaurant.orders.create': [
      { scope: 'assigned', values: { section_ids: ['hall-a'] }, thresholds: {} },
    ],
  },
  menu: [],
  home: 'home',
  quick_create: [],
};

const render = (access: MeAccess | null, node: React.ReactNode) =>
  renderToStaticMarkup(<AccessPreview value={access}>{node}</AccessPreview>);

describe('<Can>', () => {
  it('shows its children only for a permission the member holds, record by record', () => {
    const button = (
      <Can permission="restaurant.orders.create" fallback="no">
        yes
      </Can>
    );
    expect(render(waiter, button)).toBe('yes');
    expect(render(null, button)).toBe('no');
    expect(render(waiter, <Can permission="restaurant.payments.create">pay</Can>)).toBe('');
    const onTable = (section: string) => (
      <Can permission="restaurant.orders.create" record={{ assigned: { section_ids: section } }}>
        order
      </Can>
    );
    expect(render(waiter, onTable('hall-a'))).toBe('order');
    expect(render(waiter, onTable('terrace'))).toBe('');
  });
});

describe('requirePermission (a route guard)', () => {
  const source = (access: MeAccess | null) => ({ ready: async () => access });

  it('lets the route load when the member holds the permission', async () => {
    await expect(requirePermission('restaurant.orders.create', source(waiter))()).resolves.toBe(
      undefined,
    );
  });

  it('sends everyone else to the no-access page, naming the permission', async () => {
    const error = await requirePermission('core.members.view', source(waiter))().catch((e) => e);
    expect(isRedirect(error)).toBe(true);
    expect(error.options).toMatchObject({
      to: '/no-access',
      search: { permission: 'core.members.view' },
    });
    expect(
      isRedirect(await requirePermission('core.members.view', source(null))().catch((e) => e)),
    ).toBe(true);
  });
});

describe('reasonOf (Part 05 §5.5.7)', () => {
  it('tells "not in your plan" from "not in your role"', () => {
    expect(reasonOf(waiter, 'school.students.view')).toBe('plan');
    expect(reasonOf(waiter, 'core.members.view')).toBe('plan'); // core.iam not listed here
    expect(reasonOf(waiter, 'core.branches.view')).toBe('role');
    expect(reasonOf(waiter, 'restaurant.orders.transfer')).toBe('role');
  });
});

describe('sessionSettled (route guards on a cold start)', () => {
  function session(initial: AuthState) {
    let state = initial;
    const listeners = new Set<(s: AuthState) => void>();
    return {
      getState: () => state,
      subscribe: (listener: (s: AuthState) => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      set(next: AuthState) {
        state = next;
        listeners.forEach((l) => l(next));
      },
      listening: () => listeners.size,
    };
  }

  it('resolves at once when the session is already known', async () => {
    await expect(sessionSettled(session({ status: 'signed_out' }))).resolves.toBeUndefined();
  });

  it('waits while the session is still being restored, then stops listening', async () => {
    const s = session({ status: 'loading' });
    let settled = false;
    const done = sessionSettled(s).then(() => (settled = true));
    await Promise.resolve();
    expect(settled).toBe(false);
    s.set({ status: 'signed_in', membership: null, memberships: [] });
    await done;
    expect(settled).toBe(true);
    expect(s.listening()).toBe(0);
  });
});
