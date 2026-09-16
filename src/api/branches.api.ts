import api from '../lib/axios';

export interface Branch {
  id: string;
  name: string;
  code?: string | null;
  address?: string | null;
  isActive: boolean;
}

export const branchesApi = {
  getAll: () => api.get<Branch[]>('/branches').then((r) => r.data),
  getOne: (id: string) => api.get<Branch>(`/branches/${id}`).then((r) => r.data),
};
