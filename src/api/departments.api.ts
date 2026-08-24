import api from '../lib/axios';

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface CreateDepartmentPayload extends Omit<Department, 'id'> {}
export interface UpdateDepartmentPayload extends Partial<Omit<Department, 'id'>> {}

export const departmentsApi = {
  // A platform operator names the company; a company user omits it and the
  // backend uses their own.
  getAll: (companyId?: string) =>
    api.get<Department[]>('/departments', { params: companyId ? { companyId } : undefined })
      .then((r) => r.data),

  getOne: (id: string) =>
    api.get<Department>(`/departments/${id}`).then((r) => r.data),

  create: (payload: CreateDepartmentPayload) =>
    api.post<Department>('/departments', payload).then((r) => r.data),

  update: (id: string, payload: UpdateDepartmentPayload) =>
    api.patch<Department>(`/departments/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete<{ message: string }>(`/departments/${id}`).then((r) => r.data),
};
