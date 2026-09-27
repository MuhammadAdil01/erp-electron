import api from '../lib/axios';

/**
 * Where an employee's pay goes (hr/employees/:id/payment-details). Separate
 * permissions from the employee record: hr.employee_bank.view reads the
 * account no. and IBAN in full; hr.employee_bank.update changes them and is
 * answered masked (last 4 digits).
 */
export interface EmployeePaymentDetails {
  employeeId: string;
  paymentMethod: { id: string; code: string; description: string; paymentMeans: string | null } | null;
  bank: { id: string; code: string; name: string } | null;
  accountTitle: string | null;
  accountNo: string | null;
  iban: string | null;
  /** When the destination last changed; Pay Salaries warns on a recent change. */
  bankDetailsChangedAt: string | null;
  updatedAt: string | null;
}

export interface PaymentDetailsPayload {
  paymentMethodId: string | null;
  bankId: string | null;
  accountTitle: string | null;
  accountNo: string | null;
  iban: string | null;
}

export interface PaymentDetailOptions {
  methods: { id: string; code: string; description: string; paymentMeans: string | null }[];
  banks: { id: string; code: string; name: string }[];
}

export interface PaymentDetailChange {
  id: string;
  field: 'paymentMethod' | 'bank' | 'accountTitle' | 'accountNo' | 'iban';
  oldValue: string | null;
  newValue: string | null;
  changedById: string | null;
  changedAt: string;
}

const path = (employeeId: string) => `/hr/employees/${employeeId}/payment-details`;

export const paymentDetailsApi = {
  get: (employeeId: string) => api.get<EmployeePaymentDetails>(path(employeeId)).then((r) => r.data),
  history: (employeeId: string) => api.get<PaymentDetailChange[]>(`${path(employeeId)}/history`).then((r) => r.data),
  /** Choices for the form (hr.employee_bank.update); no Financials access needed. */
  options: (employeeId: string) => api.get<PaymentDetailOptions>(`${path(employeeId)}/options`).then((r) => r.data),
  put: (employeeId: string, payload: PaymentDetailsPayload) =>
    api.put<EmployeePaymentDetails>(path(employeeId), payload).then((r) => r.data),
};
