import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  companyId: string | null;
  isSuperAdmin: boolean;
  permissions: string[];  // "moduleSlug:ACTION" e.g. "hr:VIEW"
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  companySlug: string | null;  // remembered for next login
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  setAuth: (user: AuthUser, token: string, companySlug?: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      companySlug: null,
      get isAuthenticated() { return !!get().token && !!get().user; },
      get isSuperAdmin() { return get().user?.isSuperAdmin ?? false; },

      setAuth: (user, token, companySlug) =>
        set({ user, token, companySlug: companySlug ?? get().companySlug }),

      clearAuth: () => set({ user: null, token: null }),

      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.isSuperAdmin || user.permissions.includes('*:*')) return true;
        return user.permissions.includes(permission);
      },
    }),
    {
      name: 'erp-auth',
      partialize: (s) => ({ user: s.user, token: s.token, companySlug: s.companySlug }),
    }
  )
);
