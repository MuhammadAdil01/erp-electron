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

export const companiesApi = {
  getAll: () =>
    api.get<CompanyListItem[]>('/companies').then((r) => r.data),

  getOne: (id: string) =>
    api.get<Company>(`/companies/${id}`).then((r) => r.data),

  toggleModule: (companyId: string, moduleId: string, isEnabled: boolean) =>
    api.patch<CompanyModule>(`/companies/${companyId}/modules/${moduleId}/toggle`, { isEnabled }).then((r) => r.data),
};

export const systemModulesApi = {
  getAll: () =>
    api.get<SystemModule[]>('/system-modules').then((r) => r.data),
};
