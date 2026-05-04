import api from '../lib/axios';

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
