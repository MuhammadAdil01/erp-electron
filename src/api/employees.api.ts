import api from '../lib/axios';

export interface Employee {
  id: number;
  name: string;
  email: string;
  departmentId?: number;
  position?: string;
  salary?: number;
  hireDate?: string;
}

export interface CreateEmployeePayload extends Omit<Employee, 'id'> {}
export interface UpdateEmployeePayload extends Partial<Omit<Employee, 'id'>> {}

export const employeesApi = {
  getAll: () =>
    api.get<Employee[]>('/employees').then((r) => r.data),

  getOne: (id: number) =>
    api.get<Employee>(`/employees/${id}`).then((r) => r.data),

  create: (payload: CreateEmployeePayload) =>
    api.post<Employee>('/employees', payload).then((r) => r.data),

  update: (id: number, payload: UpdateEmployeePayload) =>
    api.patch<Employee>(`/employees/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete<{ message: string }>(`/employees/${id}`).then((r) => r.data),
};
