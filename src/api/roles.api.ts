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

export const rolesApi = {
  getAll: () =>
    api.get<Role[]>('/roles').then((r) => r.data),

  getOne: (id: string) =>
    api.get<Role>(`/roles/${id}`).then((r) => r.data),

  getAvailablePermissions: () =>
    api.get<Permission[]>('/roles/permissions/available').then((r) => r.data),

  create: (payload: CreateRolePayload) =>
    api.post<Role>('/roles', payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateRolePayload>) =>
    api.patch<Role>(`/roles/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete<{ message: string }>(`/roles/${id}`).then((r) => r.data),
};
