import api from '../lib/axios';

export interface SystemModule {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export const systemModulesApi = {
  getAll: () =>
    api.get<SystemModule[]>('/system-modules').then((r) => r.data),
  
  getCompanyModules: (companyId: string) =>
    api.get<SystemModule[]>(`/system-modules/company/${companyId}`).then((r) => r.data),
};
