import api from '../lib/axios';
import type { AuthUser } from '../store/authStore';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'super_admin' | 'user';
  modules?: string[];
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<LoginResponse>('/auth/register', payload).then((r) => r.data),

  profile: () =>
    api.get<AuthUser>('/auth/profile').then((r) => r.data),
};
