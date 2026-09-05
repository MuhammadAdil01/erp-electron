import api from '../lib/axios';

export interface SystemModule {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface CompanyModule {
  id: string;
  companyId: string;
  moduleId: string;
  isEnabled: boolean;
  module: SystemModule;
}

// Full company detail (returned by GET /companies/:id)
export interface Company {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  companyModules: CompanyModule[];
  _count: { users: number };
}

// Lightweight company item (returned by GET /companies list)
export interface CompanyListItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count: { users: number; companyModules: number };
}

/**
 * A row in the Choose Company grid.
 *
 * `databaseName` / `localization` are the server's mapping of this platform's
 * fields onto the columns the window has always shown, so the window does not
 * invent them.
 */
export interface AvailableCompany {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  country: string | null;
  currency: string | null;
  locale: string | null;
  timezone: string | null;
  industry: string | null;
  fiscalYearStart: number | null;
  createdAt: string;
  databaseName: string;
  localization: string;
  moduleCount: number;
  _count: { users: number; branches: number };
}

export interface OnboardCompanyPayload {
  name: string;
  slug: string;
  industry?: string;
  country?: string;
  currency?: string;
  locale?: string;
  timezone?: string;
  fiscalYearStart?: number;
  planKey: string;
  billingInterval?: 'MONTHLY' | 'YEARLY';
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
}

export const companiesApi = {
  getAll: () =>
    api.get<CompanyListItem[]>('/companies').then((r) => r.data),

  /**
   * Companies the signed-in caller may act inside. Unlike `getAll`, this also
   * answers for a company user — they simply get their own single row, which is
   * what lets Choose Company work for everyone rather than super admins only.
   */
  available: () =>
    api.get<AvailableCompany[]>('/companies/available').then((r) => r.data),

  getOne: (id: string) =>
    api.get<Company>(`/companies/${id}`).then((r) => r.data),

  /** The "New" button — creates a company with its subscription and first admin. */
  onboard: (payload: OnboardCompanyPayload) =>
    api.post<{ company: Company; adminPassword?: string }>('/companies/onboard', payload)
      .then((r) => r.data),

  toggleModule: (companyId: string, moduleId: string, isEnabled: boolean) =>
    api.patch<CompanyModule>(`/companies/${companyId}/modules/${moduleId}/toggle`, { isEnabled }).then((r) => r.data),
};

export const systemModulesApi = {
  getAll: () =>
    api.get<SystemModule[]>('/system-modules').then((r) => r.data),
};
