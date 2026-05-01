import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useAuthStore, type AuthUser } from '../store/authStore';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string, companySlug?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, setAuth, clearAuth, updateUser, hasPermission } = useAuthStore();

  const isAuthenticated = !!token && !!user;
  const isSuperAdmin = user?.isSuperAdmin ?? false;

  const login = useCallback(async (email: string, password: string, companySlug?: string) => {
    const { access_token, user: authUser } = await authApi.login({ email, password, companySlug });
    setAuth(authUser, access_token, companySlug);
  }, [setAuth]);

  const logout = useCallback(() => clearAuth(), [clearAuth]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await authApi.profile();
      updateUser(profile);
    } catch {
      // silently fail
    }
  }, [token, updateUser]);

  useEffect(() => {
    if (token && !user) clearAuth();
  }, [token, user, clearAuth]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isSuperAdmin, hasPermission, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export type { AuthUser };
