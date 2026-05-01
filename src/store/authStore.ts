import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'user';
  modules: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      get isAuthenticated() { return !!get().token && !!get().user; },
      get isSuperAdmin() { return get().user?.role === 'super_admin'; },

      setAuth: (user, token) => set({ user, token }),

      clearAuth: () => set({ user: null, token: null }),

      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
    }),
    {
      name: 'erp-auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
