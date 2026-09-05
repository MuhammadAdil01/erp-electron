import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useAuthStore, type ActiveCompany, type AuthUser } from '../store/authStore';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  /**
   * The tenant the session is acting in — the user's own company, or the one a
   * platform operator picked in Choose Company.
   *
   * Windows must gate on this rather than on `user.companyId`: a platform
   * operator's `companyId` is always null, so gating on it left every
   * Administration window permanently empty and made its writes fail.
   */
  activeCompany: ActiveCompany | null;
  activeCompanyId: string | null;
  setActiveCompany: (company: ActiveCompany | null) => void;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string, companySlug?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user, token, activeCompany, activeCompanyId: storedCompanyId,
    setAuth, setActiveCompany, clearAuth, updateUser, hasPermission,
  } = useAuthStore();

  const isAuthenticated = !!token && !!user;
  const isSuperAdmin = user?.isSuperAdmin ?? false;

  /**
   * The company the session acts in.
   *
   * A company user's own tenant always wins: it comes from their token and is
   * not theirs to change. Only a platform operator, who has none, falls through
   * to whatever Choose Company recorded.
   *
   * The fallback also covers sessions that were already signed in before this
   * field existed — their persisted state has no `activeCompanyId`, and without
   * this they would see every window report "no company selected" until they
   * signed out and back in.
   */
  const activeCompanyId = user?.companyId ?? storedCompanyId ?? null;

  const login = useCallback(async (email: string, password: string, companySlug?: string) => {
    const res = await authApi.login({ email, password, companySlug });
    if (!res?.accessToken) {
      throw new Error('The server did not return an access token. Please contact your administrator.');
    }
    setAuth(res.user, res.accessToken, res.refreshToken, companySlug);
  }, [setAuth]);

  const logout = useCallback(() => {
    // Best-effort server-side revocation; the local session is cleared either
    // way so a network failure cannot strand the user in a logged-in shell.
    const { token: access, refreshToken: rt } = useAuthStore.getState();
    if (access) void authApi.logout(rt, access).catch(() => undefined);
    clearAuth();
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await authApi.profile();
      updateUser(profile);
    } catch {
      // silently fail — the axios layer already handles an expired session
    }
  }, [token, updateUser]);

  // A persisted session missing either half is unusable; drop it so the login
  // screen appears instead of a shell that 401s on its first request.
  useEffect(() => {
    if ((token && !user) || (user && !token)) clearAuth();
  }, [token, user, clearAuth]);

  // Re-read the profile once per session start. Permissions and enabled modules
  // are resolved server-side and can have changed since the token was minted.
  useEffect(() => {
    if (token && user) void refreshUser();
    // Keyed on the user id, not the user object: `updateUser` replaces the
    // object on every profile read, and depending on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user, token, isAuthenticated, isSuperAdmin,
        activeCompany: activeCompany ?? (user?.companyId
          ? { id: user.companyId, name: user.name, slug: '' }
          : null),
        activeCompanyId,
        setActiveCompany,
        hasPermission, login, logout, refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export type { ActiveCompany, AuthUser };
