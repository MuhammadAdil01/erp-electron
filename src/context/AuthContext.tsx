import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useAuthStore, type AuthUser } from '../store/authStore';
import { authApi } from '../api/auth.api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, setAuth, clearAuth, updateUser } = useAuthStore();

  const isAuthenticated = !!token && !!user;
  const isSuperAdmin = user?.role === 'super_admin';

  const login = useCallback(async (email: string, password: string) => {
    const { access_token, user: authUser } = await authApi.login({ email, password });
    setAuth(authUser, access_token);
  }, [setAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await authApi.profile();
      updateUser(profile);
    } catch {
      // silently fail — token may still be valid
    }
  }, [token, updateUser]);

  // Clear stale state on mount if token exists but user is missing
  useEffect(() => {
    if (token && !user) clearAuth();
  }, [token, user, clearAuth]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isSuperAdmin, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export type { AuthUser };
