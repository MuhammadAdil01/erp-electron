import api from '../lib/axios';

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface CreateDepartmentPayload extends Omit<Department, 'id'> {}
export interface UpdateDepartmentPayload extends Partial<Omit<Department, 'id'>> {}

export const departmentsApi = {
  getAll: () =>
    api.get<Department[]>('/departments').then((r) => r.data),

  getOne: (id: number) =>
    api.get<Department>(`/departments/${id}`).then((r) => r.data),

  create: (payload: CreateDepartmentPayload) =>
    api.post<Department>('/departments', payload).then((r) => r.data),

  update: (id: number, payload: UpdateDepartmentPayload) =>
    api.patch<Department>(`/departments/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete<{ message: string }>(`/departments/${id}`).then((r) => r.data),
};
