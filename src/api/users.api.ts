import api from '../lib/axios';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'user';
  modules: string[];
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: 'super_admin' | 'user';
  modules?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: 'super_admin' | 'user';
  modules?: string[];
}

export const usersApi = {
  getAll: () =>
    api.get<User[]>('/users').then((r) => r.data),

  getOne: (id: number) =>
    api.get<User>(`/users/${id}`).then((r) => r.data),

  create: (payload: CreateUserPayload) =>
    api.post<User>('/users', payload).then((r) => r.data),

  update: (id: number, payload: UpdateUserPayload) =>
    api.patch<User>(`/users/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete<{ message: string }>(`/users/${id}`).then((r) => r.data),
};
