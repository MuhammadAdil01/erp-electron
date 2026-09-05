import api, { authClient } from '../lib/axios';
import type { AuthUser } from '../store/authStore';

export interface LoginPayload {
  email: string;
  password: string;
  companySlug?: string;  // omit for super admin login
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  companySlug?: string;
}

/**
 * The backend issues a short-lived access token (15 min by default) alongside a
 * long-lived rotating refresh token. Both keys are camelCase — an earlier client
 * read `access_token`, which has not existed since the auth rewrite, so every
 * login silently stored `undefined` and the first authenticated call 401'd.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export interface LoginResponse extends TokenPair {
  user: AuthUser;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<{ message: string; user: Partial<AuthUser> }>('/auth/register', payload).then((r) => r.data),

  profile: () =>
    api.get<AuthUser>('/auth/profile').then((r) => r.data),

  /**
   * Exchanges a refresh token for a fresh pair. Goes through `authClient` — the
   * bare instance with no 401 interceptor — because a failed refresh must not
   * re-enter the refresh path.
   */
  refresh: (refreshToken: string) =>
    authClient.post<{ data: TokenPair }>('/auth/refresh', { refreshToken })
      .then((r) => r.data.data),

  /**
   * Revokes the refresh token server-side. The access token is passed in
   * explicitly and the call goes through `authClient`, because the caller
   * clears the local session immediately afterwards — reading the token from
   * the store at interceptor time would find it already gone, and the
   * resulting 401 would re-enter the session-expiry path for no reason.
   */
  logout: (refreshToken?: string | null, accessToken?: string | null) =>
    authClient.post(
      '/auth/logout',
      refreshToken ? { refreshToken } : {},
      accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    ).then((r) => r.data),
};
