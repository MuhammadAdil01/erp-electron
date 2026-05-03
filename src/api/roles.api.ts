import api from '../lib/axios';

export interface Permission {
  id: string;
  moduleId: string;
  action: string;
  module: { id: string; name: string; slug: string; icon?: string };
}

export interface RolePermission {
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  companyId: string;
  createdAt: string;
  _count: { userRoles: number };
  rolePermissions: RolePermission[];
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  isDefault?: boolean;
  permissionIds?: string[];
}

// companyId is forwarded as a query param so super admins can target any company.
const cq = (companyId?: string) => (companyId ? { params: { companyId } } : {});

export const rolesApi = {
  getAll: (companyId?: string) =>
    api.get<Role[]>('/roles', cq(companyId)).then((r) => r.data),

  getOne: (id: string, companyId?: string) =>
    api.get<Role>(`/roles/${id}`, cq(companyId)).then((r) => r.data),

  getAvailablePermissions: (companyId?: string) =>
    api.get<Permission[]>('/roles/permissions/available', cq(companyId)).then((r) => r.data),

  create: (payload: CreateRolePayload, companyId?: string) =>
    api.post<Role>('/roles', payload, cq(companyId)).then((r) => r.data),

  update: (id: string, payload: Partial<CreateRolePayload>, companyId?: string) =>
    api.patch<Role>(`/roles/${id}`, payload, cq(companyId)).then((r) => r.data),

  remove: (id: string, companyId?: string) =>
    api.delete<{ message: string }>(`/roles/${id}`, cq(companyId)).then((r) => r.data),
};
