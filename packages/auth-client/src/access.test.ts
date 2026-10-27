import type { MeAccess, MembershipSummary } from '@erp/contracts';
import { describe, expect, it, vi } from 'vitest';
import { AccessClient } from './access';
import type { AuthState } from './index';

const membership = (id: string): MembershipSummary =>
  ({
    membership_id: id,
    tenant_id: `t-${id}`,
    tenant_code: 'T-AAAAAA',
    tenant_slug: 'demo',
    tenant_name: 'Demo',
    kind: 'member',
    display_name: 'Demo',
  }) as MembershipSummary;

function accessOf(pv: number, extra: Partial<MeAccess> = {}): MeAccess {
  return {
    tenant: { id: 't', code: 'T-AAAAAA', status: 'active' },
    membership_id: 'm1',
    is_owner: false,
    pv,
    valid_until: null,
    features: [{ key: 'core.org', state: 'on' }],
    permissions: {
      'core.branches.view': [{ scope: 'branch', values: { branch_ids: ['b1'] }, thresholds: {} }],
    },
    menu: [],
    home: 'home',
    quick_create: [],
    ...extra,
  };
}

/** A tiny stand-in for AuthClient's state. */
function session(initial: AuthState) {
  let state = initial;
  const listeners = new Set<(s: AuthState) => void>();
  return {
    getState: () => state,
    subscribe: (l: (s: AuthState) => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    set(next: AuthState) {
      state = next;
      for (const l of listeners) l(next);
    },
  };
}

const signedInto = (id: string | null): AuthState => ({
  status: 'signed_in',
  membership: id ? membership(id) : null,
  memberships: id ? [membership(id)] : [],
});

describe('AccessClient', () => {
  it('loads access when a company is chosen and forgets it on sign-out', async () => {
    const load = vi.fn(async () => accessOf(3));
    const client = new AccessClient({ load, refreshToken: vi.fn(async () => undefined) });
    const auth = session(signedInto(null));
    client.follow(auth);
    expect(await client.ready()).toBeNull();
    expect(load).not.toHaveBeenCalled();
    auth.set(signedInto('m1'));
    expect((await client.ready())?.pv).toBe(3);
    expect(client.can('core.branches.view')).toBe(true);
    expect(client.can('core.branches.view', { branch_id: 'b1' })).toBe(true);
    expect(client.can('core.branches.view', { branch_id: 'b2' })).toBe(false);
    expect(client.can('core.members.view')).toBe(false);
    auth.set({ status: 'signed_out' });
    expect(client.get()).toBeNull();
    expect(client.can('core.branches.view')).toBe(false);
  });

  it('refreshes the token and loads again once when the access version moves', async () => {
    const load = vi.fn().mockResolvedValueOnce(accessOf(3)).mockResolvedValueOnce(accessOf(4));
    const refreshToken = vi.fn(async () => undefined);
    const client = new AccessClient({ load, refreshToken });
    client.follow(session(signedInto('m1')));
    await client.ready();
    client.noteVersion(3); // same version: nothing to do
    expect(refreshToken).not.toHaveBeenCalled();
    client.noteVersion(4);
    client.noteVersion(4); // already loading: not twice
    await vi.waitFor(() => expect(client.get()?.pv).toBe(4));
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('loads again when the answer says it changes by itself', async () => {
    const timers: { run: () => void; ms: number }[] = [];
    const load = vi
      .fn()
      .mockResolvedValueOnce(accessOf(3, { valid_until: '2026-10-28T10:05:00.000Z' }))
      .mockResolvedValueOnce(accessOf(3));
    const client = new AccessClient({
      load,
      refreshToken: vi.fn(async () => undefined),
      now: () => Date.parse('2026-10-28T10:00:00.000Z'),
      setTimer: (run, ms) => timers.push({ run, ms }),
      clearTimer: () => undefined,
    });
    client.follow(session(signedInto('m1')));
    await client.ready();
    expect(timers.map((t) => t.ms)).toEqual([300_000]);
    timers[0]!.run();
    await vi.waitFor(() => expect(load).toHaveBeenCalledTimes(2));
  });

  it('drops an answer that arrives after another company was chosen', async () => {
    let resolveFirst: (a: MeAccess) => void = () => undefined;
    const load = vi
      .fn()
      .mockImplementationOnce(() => new Promise<MeAccess>((r) => (resolveFirst = r)))
      .mockResolvedValueOnce(accessOf(9, { membership_id: 'm2' }));
    const client = new AccessClient({ load, refreshToken: vi.fn(async () => undefined) });
    const auth = session(signedInto('m1'));
    client.follow(auth);
    auth.set(signedInto('m2'));
    resolveFirst(accessOf(3));
    await vi.waitFor(() => expect(client.get()?.membership_id).toBe('m2'));
  });
});
