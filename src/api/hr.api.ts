import api from '../lib/axios';
import type { CrudApi } from './crud';

// ── Shared types ────────────────────────────────────────────────────────────

export interface HrPermission {
  id: string;
  moduleId: string;
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'MANAGE';
  module: { id: string; name: string; slug: string; icon?: string };
}

export interface HrRolePermission {
  permission: HrPermission;
}

// ── HR Role types ───────────────────────────────────────────────────────────

export interface HrRole {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  companyId: string;
  domain: 'HR';
  createdAt: string;
  _count: { userRoles: number };
  rolePermissions: HrRolePermission[];
}

export interface CreateHrRolePayload {
  name: string;
  description?: string;
  isDefault?: boolean;
  permissionIds?: string[];
}

// ── HR User types ───────────────────────────────────────────────────────────

export interface HrUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  roleType: string;
  departmentId?: string;
  department?: { id: string; name: string };
  userRoles?: { role: { id: string; name: string; domain: string } }[];
  userModules?: { module: { id: string; name: string; slug: string } }[];
}

export interface CreateHrUserPayload {
  name: string;
  email: string;
  password: string;
  departmentId?: string;
  roleIds?: string[];
}

export interface UpdateHrUserPayload {
  name?: string;
  email?: string;
  password?: string;
  departmentId?: string;
  roleIds?: string[];
  isActive?: boolean;
}

// ── API client ──────────────────────────────────────────────────────────────

const cq = (companyId?: string) => (companyId ? { params: { companyId } } : {});

export const hrApi = {
  // HR Roles
  getAllRoles: (companyId?: string) =>
    api.get<HrRole[]>('/hr/roles', cq(companyId)).then(r => r.data),

  getOneRole: (id: string, companyId?: string) =>
    api.get<HrRole>(`/hr/roles/${id}`, cq(companyId)).then(r => r.data),

  getAvailablePermissions: (companyId?: string) =>
    api.get<HrPermission[]>('/hr/roles/permissions/available', cq(companyId)).then(r => r.data),

  createRole: (payload: CreateHrRolePayload, companyId?: string) =>
    api.post<HrRole>('/hr/roles', payload, cq(companyId)).then(r => r.data),

  updateRole: (id: string, payload: Partial<CreateHrRolePayload>, companyId?: string) =>
    api.patch<HrRole>(`/hr/roles/${id}`, payload, cq(companyId)).then(r => r.data),

  removeRole: (id: string, companyId?: string) =>
    api.delete<{ message: string }>(`/hr/roles/${id}`, cq(companyId)).then(r => r.data),

  // HR Users
  getAllUsers: (companyId?: string) =>
    api.get<HrUser[]>('/hr/users', cq(companyId)).then(r => r.data),

  getOneUser: (id: string, companyId?: string) =>
    api.get<HrUser>(`/hr/users/${id}`, cq(companyId)).then(r => r.data),

  createUser: (payload: CreateHrUserPayload, companyId?: string) =>
    api.post<HrUser>('/hr/users', payload, cq(companyId)).then(r => r.data),

  updateUser: (id: string, payload: UpdateHrUserPayload, companyId?: string) =>
    api.patch<HrUser>(`/hr/users/${id}`, payload, cq(companyId)).then(r => r.data),

  removeUser: (id: string, companyId?: string) =>
    api.delete<{ message: string }>(`/hr/users/${id}`, cq(companyId)).then(r => r.data),

  // Seed default HR roles for the company
  seedDefaults: (companyId?: string) =>
    api.post<{ message: string; seeded: string[] }>('/hr/seed-defaults', {}, cq(companyId)).then(r => r.data),
};

// ── Shifts (HR Payroll → Masters → Shift Master) ────────────────────────────

export interface Shift {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  breakMinutes: number;
  workDays: number[];
  remarks?: string | null;
  isActive: boolean;
}
export interface ShiftPayload {
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  isOvernight?: boolean;
  breakMinutes?: number;
  workDays: number[];
  remarks?: string;
  isActive?: boolean;
}

/**
 * The `/hr/shifts` routes use PATCH (not PUT) and have no `/:id` or `/count`
 * endpoints, so this is hand-written to `CrudApi`'s shape rather than built
 * with `createCrudApi` — `getOne`/`count` are served from the already-fetched
 * list since the backend has nothing to call for them.
 */
export const shiftsApi: CrudApi<Shift, ShiftPayload, Partial<ShiftPayload>> = {
  path: '/hr/shifts',
  getAll: () => api.get<Shift[]>('/hr/shifts').then(r => r.data),
  count: async () => (await api.get<Shift[]>('/hr/shifts')).data.length,
  getOne: async (id) => {
    const all = await api.get<Shift[]>('/hr/shifts').then(r => r.data);
    const found = all.find(s => s.id === id);
    if (!found) throw new Error(`Shift ${id} not found`);
    return found;
  },
  create: (payload) => api.post<Shift>('/hr/shifts', payload).then(r => r.data),
  update: (id, payload) => api.patch<Shift>(`/hr/shifts/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete<{ id: string; message: string }>(`/hr/shifts/${id}`).then(r => ({ id, message: r.data.message })),
};

// ── Leave Types (HR Payroll → Masters → Leave Master) ───────────────────────

export type LeaveAccrualMode = 'NONE' | 'PERIODIC';

export interface LeaveTypeDateRange {
  id?: string;
  fromDate: string;
  toDate: string;
  isLocked?: boolean;
}

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  accrualMode: LeaveAccrualMode;
  accrualDays?: string | number | null;
  accrualPeriod?: string | null;
  maxBalance?: string | number | null;
  paid: boolean;
  requiresApproval: boolean;
  workflowKey?: string | null;
  isActive: boolean;
  totalLeavesInYear?: string | number | null;
  totalLeavesInYearForTrainer?: string | number | null;
  leaveCategory?: string | null;
  applicableDuringProbation: boolean;
  encashable: boolean;
  minBalanceForEncash?: string | number | null;
  maxLeaveToEncash?: string | number | null;
  payableLeave: boolean;
  maxMonthlyApplications?: string | number | null;
  minContinuousDays?: string | number | null;
  maxContinuousDays?: string | number | null;
  minContinuousDurationProb?: string | number | null;
  maxContinuousDurationProb?: string | number | null;
  effectiveFrom?: string | null;
  carryForwardToNextYear: boolean;
  maxLeaveCarryForward?: string | number | null;
  isClosed: boolean;
  remarks?: string | null;
  dateRanges?: LeaveTypeDateRange[];
}

export interface LeaveTypePayload {
  code: string;
  name: string;
  description?: string;
  totalLeavesInYear?: number;
  totalLeavesInYearForTrainer?: number;
  leaveCategory?: string;
  applicableDuringProbation?: boolean;
  encashable?: boolean;
  minBalanceForEncash?: number;
  maxLeaveToEncash?: number;
  payableLeave?: boolean;
  /** false ⇒ each approved day is docked from salary in Payroll Process. */
  paid?: boolean;
  maxMonthlyApplications?: number;
  minContinuousDays?: number;
  maxContinuousDays?: number;
  minContinuousDurationProb?: number;
  maxContinuousDurationProb?: number;
  effectiveFrom?: string;
  carryForwardToNextYear?: boolean;
  maxLeaveCarryForward?: number;
  isClosed?: boolean;
  remarks?: string;
  isActive?: boolean;
}

export const leaveTypesApi: CrudApi<LeaveType, LeaveTypePayload, Partial<LeaveTypePayload>> = {
  path: '/hr/leaves/types',
  getAll: () => api.get<LeaveType[]>('/hr/leaves/types').then(r => r.data),
  count: async () => (await api.get<LeaveType[]>('/hr/leaves/types')).data.length,
  getOne: async (id) => {
    const all = await api.get<LeaveType[]>('/hr/leaves/types').then(r => r.data);
    const found = all.find(t => t.id === id);
    if (!found) throw new Error(`Leave type ${id} not found`);
    return found;
  },
  create: (payload) => api.post<LeaveType>('/hr/leaves/types', payload).then(r => r.data),
  update: (id, payload) => api.patch<LeaveType>(`/hr/leaves/types/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete<{ id: string; message: string }>(`/hr/leaves/types/${id}`).then(r => ({ id, message: r.data.message })),
};

export const leaveDateRangesApi = {
  replace: (leaveTypeId: string, rows: LeaveTypeDateRange[]) =>
    api.put<LeaveTypeDateRange[]>(`/hr/leaves/types/${leaveTypeId}/date-ranges`, { rows }).then(r => r.data),
};

export const leaveBalancesApi = {
  forEmployee: (employeeId: string) =>
    api.get<{
      id: string; periodKey: string; accruedDays: string; usedDays: string; pendingDays: string; carryOverDays: string;
      leaveType: { id: string; code: string; name: string };
    }[]>('/hr/leaves/balances', { params: { employeeId } }).then(r => r.data),
};

// ── Leave Requests (HR Payroll → Transactions → Leave Application) ─────────

export type LeaveRequestStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'TAKEN';

export interface LeaveRequest {
  id: string;
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: string | number;
  reason?: string | null;
  status: LeaveRequestStatus;
  approvedById?: string | null;
  approvedAt?: string | null;
  rejectedReason?: string | null;
  leaveDurationType?: string | null;
  signedBy?: string | null;
  contactNo?: string | null;
  preparedBy?: string | null;
  approvedByName?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: { id: string; name: string; managerId?: string | null };
  leaveType?: { id: string; code: string; name: string };
}

export interface SubmitLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  leaveDurationType?: string;
  signedBy?: string;
  contactNo?: string;
  preparedBy?: string;
}

export interface DecideLeaveRequestPayload {
  reason?: string;
  approvedByName?: string;
}

/**
 * Deciding a leave request is not one write. Submitting runs employee and type
 * lookups, creates the request, reserves the balance, starts the approval
 * workflow and writes an audit record; approving unwinds the same chain. Each
 * step is a round trip, and against a hosted database the whole thing was
 * measured at ~13s — close enough to the client's 15s default that the window
 * reported "timeout exceeded" on a request the server had in fact accepted.
 * These four get the budget the work actually needs.
 */
const LEAVE_WRITE = { timeout: 60_000 };

export const leaveRequestsApi = {
  list: (params?: { employeeId?: string; status?: string }) =>
    api.get<LeaveRequest[]>('/hr/leaves/requests', { params }).then((r) => r.data),

  submit: (employeeId: string, payload: SubmitLeaveRequestPayload) =>
    api.post<LeaveRequest>(`/hr/leaves/requests/employees/${employeeId}`, payload, LEAVE_WRITE).then((r) => r.data),

  approve: (id: string, payload?: DecideLeaveRequestPayload) =>
    api.post<LeaveRequest>(`/hr/leaves/requests/${id}/approve`, payload ?? {}, LEAVE_WRITE).then((r) => r.data),

  reject: (id: string, payload?: DecideLeaveRequestPayload) =>
    api.post<LeaveRequest>(`/hr/leaves/requests/${id}/reject`, payload ?? {}, LEAVE_WRITE).then((r) => r.data),

  cancel: (id: string) =>
    api.post<LeaveRequest>(`/hr/leaves/requests/${id}/cancel`, {}, LEAVE_WRITE).then((r) => r.data),
};

// ── Positions (HR Payroll → Employee Current Information → Designation) ────

export interface Position {
  id: string;
  title: string;
  code?: string | null;
  description?: string | null;
  level?: number | null;
  departmentId?: string | null;
  branchId?: string | null;
  isActive: boolean;
}
export interface PositionPayload {
  title: string;
  code?: string;
  description?: string;
  level?: number;
  departmentId?: string;
  branchId?: string;
  isActive?: boolean;
}

export const positionsApi: CrudApi<Position, PositionPayload, Partial<PositionPayload>> = {
  path: '/hr/positions',
  getAll: () => api.get<Position[]>('/hr/positions').then(r => r.data),
  count: async () => (await api.get<Position[]>('/hr/positions')).data.length,
  getOne: (id) => api.get<Position>(`/hr/positions/${id}`).then(r => r.data),
  create: (payload) => api.post<Position>('/hr/positions', payload).then(r => r.data),
  update: (id, payload) => api.patch<Position>(`/hr/positions/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete<{ id: string; message: string }>(`/hr/positions/${id}`).then(r => ({ id, message: r.data.message })),
};
