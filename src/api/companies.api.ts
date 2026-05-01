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

export interface Company {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  companyModules: CompanyModule[];
  _count: { users: number };
}

export const companiesApi = {
  getOne: (id: string) =>
    api.get<Company>(`/companies/${id}`).then((r) => r.data),

  toggleModule: (companyId: string, moduleId: string, isEnabled: boolean) =>
    api.patch<CompanyModule>(`/companies/${companyId}/modules/${moduleId}/toggle`, { isEnabled }).then((r) => r.data),
};

export const systemModulesApi = {
  getAll: () =>
    api.get<SystemModule[]>('/system-modules').then((r) => r.data),
};
