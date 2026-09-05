import api from '../lib/axios';

/**
 * A row of the platform permission catalog, exactly as
 * GET /roles/permissions/available returns it.
 *
 * This is a flat catalog row — there is no `module` relation and no `moduleId`
 * on it. A previous version of this type invented both; the roles matrix read
 * `permission.module.id` while rendering, which threw and took the whole React
 * root down with it (the "blank white screen"). Group by `moduleSlug` instead.
 */
export interface Permission {
  id: string;
  key: string;          // "administration.approval.decide"
  resource: string;     // "administration.approval"
  action: string;       // "decide"
  moduleSlug: string;   // "administration"
  description?: string;
}

export type PermissionScope = 'OWN' | 'DEPARTMENT' | 'BRANCH' | 'ALL';

export interface RolePermission {
  id?: string;
  permissionId?: string;
  scope?: PermissionScope;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  domain?: string | null;
  isDefault: boolean;
  defaultScope?: PermissionScope;
  companyId: string;
  createdAt: string;
  _count?: { userRoles: number };
  rolePermissions?: RolePermission[];
}

/** What the backend's CreateRoleDto actually accepts. */
export interface RolePermissionAssignment {
  permissionKey: string;
  scope?: PermissionScope;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  isDefault?: boolean;
  defaultScope?: PermissionScope;
  permissions?: RolePermissionAssignment[];
  permissionSetIds?: string[];
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
