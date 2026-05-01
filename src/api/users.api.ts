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

export const usersApi = {
  getAll: () =>
    api.get<User[]>('/users').then((r) => r.data),

  getOne: (id: string) =>
    api.get<User>(`/users/${id}`).then((r) => r.data),

  create: (payload: CreateUserPayload) =>
    api.post<User>('/users', payload).then((r) => r.data),

  update: (id: string, payload: UpdateUserPayload) =>
    api.patch<User>(`/users/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete<{ message: string }>(`/users/${id}`).then((r) => r.data),
};
