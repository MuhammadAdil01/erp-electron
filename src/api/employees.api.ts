import api from '../lib/axios';
import type { CrudApi, Ref } from './crud';

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RETIRED' | 'SUSPENDED';

export interface Employee {
  id: string;
  companyId: string;
  userId?: string | null;
  employeeNumber?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  departmentId?: string | null;
  branchId?: string | null;
  positionId?: string | null;
  managerId?: string | null;
  position?: string | null;
  status: EmployeeStatus;
  salary?: string | number | null;
  hireDate?: string | null;
  terminationDate?: string | null;
  isActive: boolean;
  customFields?: Record<string, unknown> | null;

  // Employee Current Information (Employee Details tab)
  fatherName?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  originalDateOfBirth?: string | null;
  nationality?: string | null;
  mobilePhone2?: string | null;
  dateOfJoining?: string | null;
  insurancePolicyNo?: string | null;
  pfNo?: string | null;
  esiNo?: string | null;
  otherInfo?: string | null;
  fuelLiters?: string | number | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  city?: string | null;
  pinCode?: string | null;
  state?: string | null;
  sectionType?: string | null;
  locationProjectSite?: string | null;
  employeeCategoryId?: string | null;
  gradeId?: string | null;
  currentShiftId?: string | null;

  department?: Ref | null;
  branch?: Ref | null;
  positionRef?: { id: string; title: string } | null;
  manager?: Ref | null;
  employeeCategory?: Ref | null;
  grade?: { id: string; code: string; description: string } | null;
  currentShift?: { id: string; code: string; name: string } | null;
}

export interface EmployeePayload {
  name: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
  departmentId?: string;
  branchId?: string;
  positionId?: string;
  managerId?: string;
  position?: string;
  status?: EmployeeStatus;
  salary?: number;
  hireDate?: string;
  customFields?: Record<string, unknown>;
  fatherName?: string;
  gender?: string;
  dateOfBirth?: string;
  originalDateOfBirth?: string;
  nationality?: string;
  mobilePhone2?: string;
  dateOfJoining?: string;
  insurancePolicyNo?: string;
  pfNo?: string;
  esiNo?: string;
  otherInfo?: string;
  fuelLiters?: number;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  pinCode?: string;
  state?: string;
  sectionType?: string;
  locationProjectSite?: string;
  employeeCategoryId?: string;
  gradeId?: string;
  currentShiftId?: string;
}

export interface EmployeeListParams {
  branchId?: string;
  departmentId?: string;
  managerId?: string;
  status?: EmployeeStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}

export const employeesApi = {
  getAll: (params?: EmployeeListParams) =>
    api.get<{ total: number; page: number; pageSize: number; items: Employee[] }>('/employees', { params })
      .then((r) => r.data),

  getOne: (id: string) => api.get<Employee>(`/employees/${id}`).then((r) => r.data),

  create: (payload: EmployeePayload) => api.post<Employee>('/employees', payload).then((r) => r.data),

  update: (id: string, payload: Partial<EmployeePayload>) =>
    api.put<Employee>(`/employees/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete<{ message: string }>(`/employees/${id}`).then((r) => r.data),
};

/**
 * `CrudApi`-shaped adapter over `employeesApi`, for `useCrudResource` — the
 * real endpoint returns `{ total, page, pageSize, items }`, not a bare array,
 * so this unwraps `items` (capped at a generous page size; Employee Current
 * Information isn't expected to page through thousands of rows in one window).
 */
export const employeesCrudApi: CrudApi<Employee, EmployeePayload> = {
  path: '/employees',
  getAll: async () => (await employeesApi.getAll({ pageSize: 200 })).items,
  count: async () => (await employeesApi.getAll({ pageSize: 1 })).total,
  getOne: employeesApi.getOne,
  create: employeesApi.create,
  update: employeesApi.update,
  remove: (id) => employeesApi.remove(id).then((r) => ({ id, message: r.message })),
};
