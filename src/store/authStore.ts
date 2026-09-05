import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  companyId: string | null;
  roleType: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
  departmentId: string | null;
  isSuperAdmin: boolean;
  /** "resource.action:SCOPE" e.g. "administration.view:ALL" */
  permissions: string[];
  /** slugs of modules enabled for this user's company */
  enabledModuleSlugs: string[];
}

/** The tenant a platform operator is currently administering. */
export interface ActiveCompany {
  id: string;
  name: string;
  slug: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  companySlug: string | null;  // remembered for next login
  /**
   * Chosen in the Choose Company window and sent as `X-Company-Id`.
   *
   * Only meaningful for a platform super admin, whose token carries no company:
   * without it every Administration window queries a null tenant. A company
   * user's own tenant always comes from their token, and this is ignored.
   */
  activeCompany: ActiveCompany | null;
  activeCompanyId: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  setAuth: (user: AuthUser, token: string, refreshToken: string, companySlug?: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setActiveCompany: (company: ActiveCompany | null) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      companySlug: null,
      activeCompany: null,
      activeCompanyId: null,
      get isAuthenticated() { return !!get().token && !!get().user; },
      get isSuperAdmin() { return get().user?.isSuperAdmin ?? false; },

      setAuth: (user, token, refreshToken, companySlug) =>
        set({
          user,
          token,
          refreshToken,
          companySlug: companySlug ?? get().companySlug,
          // A company user's tenant is their own and needs no choosing, so it
          // is seeded here; a platform operator starts with none until Choose
          // Company records one.
          activeCompany: user.companyId
            ? { id: user.companyId, name: user.name, slug: companySlug ?? '' }
            : null,
          activeCompanyId: user.companyId ?? null,
        }),

      // Written by the axios refresh latch. Keeps `user` as-is: a token refresh
      // renews the session, it does not re-identify the caller.
      setTokens: (token, refreshToken) => set({ token, refreshToken }),

      setActiveCompany: (company) =>
        set({ activeCompany: company, activeCompanyId: company?.id ?? null }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          activeCompany: null,
          activeCompanyId: null,
        }),

      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),

      /**
       * Permissions arrive from the JWT as "key:SCOPE". Callers ask for the bare
       * key ("administration.view"), so the scope suffix is stripped before
       * comparing — matching on the full string would never hit.
       */
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.isSuperAdmin) return true;
        const wanted = permission.split(':')[0];
        return (user.permissions ?? []).some((p) => p.split(':')[0] === wanted || p.split(':')[0] === '*');
      },
    }),
    {
      name: 'erp-auth',
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        refreshToken: s.refreshToken,
        companySlug: s.companySlug,
        // Persisted so a platform operator does not have to re-pick the tenant
        // every time the app restarts.
        activeCompany: s.activeCompany,
        activeCompanyId: s.activeCompanyId,
      }),
    }
  )
);
