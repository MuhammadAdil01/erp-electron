import api from '../lib/axios';

export interface UserRole {
  role: { id: string; name: string };
}

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  userRoles?: UserRole[];
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleIds?: string[];
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  roleIds?: string[];
  isActive?: boolean;
}

// companyId is forwarded as a query param so super admins can target any company.
// Regular users' backend ignores it and uses their JWT companyId instead.
const cq = (companyId?: string) => (companyId ? { params: { companyId } } : {});

export const usersApi = {
  getAll: (companyId?: string) =>
    api.get<User[]>('/users', cq(companyId)).then((r) => r.data),

  getOne: (id: string, companyId?: string) =>
    api.get<User>(`/users/${id}`, cq(companyId)).then((r) => r.data),

  create: (payload: CreateUserPayload, companyId?: string) =>
    api.post<User>('/users', payload, cq(companyId)).then((r) => r.data),

  update: (id: string, payload: UpdateUserPayload, companyId?: string) =>
    api.patch<User>(`/users/${id}`, payload, cq(companyId)).then((r) => r.data),

  remove: (id: string, companyId?: string) =>
    api.delete<{ message: string }>(`/users/${id}`, cq(companyId)).then((r) => r.data),
};
