import type { ProblemDetails } from '@erp/contracts';
import { ApiError } from '@erp/sdk';
import { describe, expect, it, vi } from 'vitest';
import { holds } from './staff-access';
import { withStepUp } from './step-up';

const problem = (code: ProblemDetails['code']) =>
  new ApiError(403, { type: 'about:blank', title: 'Forbidden', status: 403, code });

describe('step-up for sensitive console actions (Part 03 §3.3.1)', () => {
  it('asks for a fresh MFA check when the API wants one, then runs the action again', async () => {
    const action = vi.fn().mockRejectedValueOnce(problem('step_up_required')).mockResolvedValueOnce('done');
    const ask = vi.fn().mockResolvedValue(undefined);
    await expect(withStepUp(action, ask)).resolves.toBe('done');
    expect(ask).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('does not ask when the action runs, and passes other refusals through untouched', async () => {
    const ask = vi.fn();
    await expect(withStepUp(() => Promise.resolve(1), ask)).resolves.toBe(1);
    await expect(withStepUp(() => Promise.reject(problem('permission_denied')), ask)).rejects.toMatchObject({ code: 'permission_denied' });
    expect(ask).not.toHaveBeenCalled();
  });

  it('gives up when the person closes the code dialog', async () => {
    const action = vi.fn().mockRejectedValue(problem('step_up_required'));
    await expect(withStepUp(action, () => Promise.reject(new Error('step-up cancelled')))).rejects.toThrow('cancelled');
    expect(action).toHaveBeenCalledOnce();
  });
});

describe('what a staff member is shown', () => {
  const access = {
    staff_id: 's1',
    roles: ['billing_manager' as const],
    permissions: { 'catalogue.prices': 'four_eyes' as const, 'audit.view_billing': 'allow' as const },
    menu: [],
    badges: {},
    mfa_verified_at: null,
  };

  it('counts a permission held with four-eyes as held: the request goes to a second approver', () => {
    expect(holds(access, 'catalogue.prices')).toBe(true);
    expect(holds(access, 'catalogue.edit', 'audit.view_billing')).toBe(true);
    expect(holds(access, 'staff.manage')).toBe(false);
    expect(holds(null, 'dashboard.view')).toBe(false);
  });
});
