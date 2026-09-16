import api from '../lib/axios';
import { createCrudApi, type Auditable, type Ref } from './crud';

const BASE = '/hr/transactions';

/**
 * Generating or replacing a whole company's worth of employee lines is a
 * multi-second job — several hundred rows, computed and written in one
 * transaction. The default 15s timeout on the shared axios instance aborted it
 * as "timeout exceeded" the moment a company had a real headcount, so these
 * calls get their own budget. Ordinary CRUD keeps the short timeout, which is
 * what makes a genuinely dead backend fail fast.
 */
const BULK = { timeout: 120_000 };

// ─── MONTHLY ATTENDANCE SHEET ───────────────────────────────────────────────────
export interface AttendanceSheetLine {
  id?: string;
  employeeId: string;
  idNo?: string | null;
  totalDays?: string | number | null;
  workingDays?: string | number | null;
  presentDays?: string | number | null;
  lopDays?: string | number | null;
  payableLeaves?: string | number | null;
  otHours?: string | number | null;
  shortTimeHours?: string | number | null;
  normalOtHours?: string | number | null;
  sunday?: string | number | null;
  misBioMaterDays?: string | number | null;
  compOffDays?: string | number | null;
  annualLeave?: string | number | null;
  halfDayLeave?: string | number | null;
  employee?: { id: string; name: string; employeeNumber?: string | null; departmentId?: string | null; positionId?: string | null };
}
export interface AttendanceSheet extends Auditable {
  branchId?: string | null;
  payPeriodId?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  payPeriodMonth?: string | null;
  docType?: string | null;
  status?: string | null;
  year?: number | null;
  remarks?: string | null;
  branch?: Ref | null;
  payPeriod?: { id: string; code: string; name: string } | null;
  _count?: { lines: number };
}
export interface AttendanceSheetPayload {
  branchId?: string;
  payPeriodId?: string;
  fromDate?: string;
  toDate?: string;
  payPeriodMonth?: string;
  docType?: string;
  status?: string;
  year?: number;
  remarks?: string;
}

const attendanceSheetsBase = createCrudApi<AttendanceSheet, AttendanceSheetPayload>(`${BASE}/attendance-sheets`);
export const attendanceSheetsApi = {
  ...attendanceSheetsBase,
  getLines: (id: string) => api.get<AttendanceSheetLine[]>(`${BASE}/attendance-sheets/${id}/lines`).then((r) => r.data),
  replaceLines: (id: string, rows: AttendanceSheetLine[]) =>
    api.put<AttendanceSheetLine[]>(`${BASE}/attendance-sheets/${id}/lines`, { rows }, BULK).then((r) => r.data),
  generate: (id: string) =>
    api.post<AttendanceSheetLine[]>(`${BASE}/attendance-sheets/${id}/generate`, {}, BULK).then((r) => r.data),
};

// ─── PAYROLL PROCESS (PayrollRun) ───────────────────────────────────────────────
export interface PayrollRunLine {
  id?: string;
  employeeId: string;
  employeeType?: string | null;
  totalDaysWorking?: string | number | null;
  lopDays?: string | number | null;
  totalDaysWorked?: string | number | null;
  paidDays?: string | number | null;
  payLeaves?: string | number | null;
  basic?: string | number | null;
  entertainment?: string | number | null;
  eligibleBasic?: string | number | null;
  conveyance?: string | number | null;
  education?: string | number | null;
  eligibleConveyance?: string | number | null;
  hra?: string | number | null;
  bigCity?: string | number | null;
  eligibleHra?: string | number | null;
  // Computed by Generate — earnings, each deduction source, and the net.
  grossPay?: string | number | null;
  perDayRate?: string | number | null;
  paidLeaveDays?: string | number | null;
  unpaidLeaveDays?: string | number | null;
  lopDeduction?: string | number | null;
  loanDeduction?: string | number | null;
  taxableGross?: string | number | null;
  taxDeduction?: string | number | null;
  adjustmentAdditions?: string | number | null;
  adjustmentDeductions?: string | number | null;
  totalEarnings?: string | number | null;
  totalDeductions?: string | number | null;
  netPay?: string | number | null;
  employee?: { id: string; name: string; employeeNumber?: string | null; departmentId?: string | null; positionId?: string | null };
}
export interface PayrollRun extends Auditable {
  employeeType?: string | null;
  payPeriodId?: string | null;
  payMonth?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  jeNo?: string | null;
  documentDate: string;
  status?: string | null;
  cancellationJeNo?: string | null;
  remarks?: string | null;
  payPeriod?: { id: string; code: string; name: string } | null;
  _count?: { lines: number };
}
export interface PayrollRunPayload {
  employeeType?: string;
  payPeriodId?: string;
  payMonth?: string;
  fromDate?: string;
  toDate?: string;
  jeNo?: string;
  documentDate?: string;
  status?: string;
  cancellationJeNo?: string;
  remarks?: string;
}

const payrollRunsBase = createCrudApi<PayrollRun, PayrollRunPayload>(`${BASE}/payroll-runs`);
export const payrollRunsApi = {
  ...payrollRunsBase,
  getLines: (id: string) => api.get<PayrollRunLine[]>(`${BASE}/payroll-runs/${id}/lines`).then((r) => r.data),
  replaceLines: (id: string, rows: PayrollRunLine[]) =>
    api.put<PayrollRunLine[]>(`${BASE}/payroll-runs/${id}/lines`, { rows }, BULK).then((r) => r.data),
  generate: (id: string) =>
    api.post<PayrollRunLine[]>(`${BASE}/payroll-runs/${id}/generate`, {}, BULK).then((r) => r.data),
};

// ─── PAYROLL MONTHLY ADJUSTMENTS ───────────────────────────────────────────────
export interface PayrollAdjustmentLine {
  id?: string;
  employeeId: string;
  idNo?: string | null;
  arrears?: string | number | null;
  generalDeduction?: string | number | null;
  carAllowance?: string | number | null;
  carInsLaptopDed?: string | number | null;
  taDa?: string | number | null;
  dowryAllowance?: string | number | null;
  taxableAddition?: string | number | null;
  fuel?: string | number | null;
  messDeduction?: string | number | null;
  generalDeduction2?: string | number | null;
  carInsLaptopDed2?: string | number | null;
  loanDeduction?: string | number | null;
  deduction11?: string | number | null;
  deduction12?: string | number | null;
  deduction13?: string | number | null;
  deduction14?: string | number | null;
  deduction15?: string | number | null;
  amount?: string | number | null;
  remarks?: string | null;
  employee?: { id: string; name: string; employeeNumber?: string | null };
}
export interface PayrollAdjustment extends Auditable {
  employeeType?: string | null;
  payPeriodId?: string | null;
  documentDate: string;
  status?: string | null;
  remarks?: string | null;
  payPeriod?: { id: string; code: string; name: string } | null;
  _count?: { lines: number };
}
export interface PayrollAdjustmentPayload {
  employeeType?: string;
  payPeriodId?: string;
  documentDate?: string;
  status?: string;
  remarks?: string;
}

const payrollAdjustmentsBase = createCrudApi<PayrollAdjustment, PayrollAdjustmentPayload>(`${BASE}/payroll-adjustments`);
export const payrollAdjustmentsApi = {
  ...payrollAdjustmentsBase,
  getLines: (id: string) => api.get<PayrollAdjustmentLine[]>(`${BASE}/payroll-adjustments/${id}/lines`).then((r) => r.data),
  replaceLines: (id: string, rows: PayrollAdjustmentLine[]) =>
    api.put<PayrollAdjustmentLine[]>(`${BASE}/payroll-adjustments/${id}/lines`, { rows }, BULK).then((r) => r.data),
};

// ─── LOAN APPLICATION (EmployeeLoan) ───────────────────────────────────────────
export interface LoanInstallment {
  id?: string;
  month?: string | null;
  year?: number | null;
  dueDate?: string | null;
  amount: string | number;
  status?: string | null;
}
export interface EmployeeLoan extends Auditable {
  code: string;
  employeeId: string;
  loanTypeId: string;
  loanAmount: string | number;
  sanctionedAmount?: string | number | null;
  documentDate: string;
  status?: string | null;
  effectivePayPeriodId?: string | null;
  effectiveDate?: string | null;
  noOfInstallments?: number | null;
  amountPerMonth?: string | number | null;
  approved: boolean;
  remarks?: string | null;
  isActive: boolean;
  employee?: { id: string; name: string; employeeNumber?: string | null };
  loanType?: { id: string; code: string; description: string };
  installments?: LoanInstallment[];
}
export interface EmployeeLoanPayload {
  code: string;
  employeeId: string;
  loanTypeId: string;
  loanAmount: number;
  sanctionedAmount?: number;
  documentDate?: string;
  status?: string;
  effectivePayPeriodId?: string;
  effectiveDate?: string;
  noOfInstallments?: number;
  amountPerMonth?: number;
  approved?: boolean;
  remarks?: string;
  isActive?: boolean;
}

const employeeLoansBase = createCrudApi<EmployeeLoan, EmployeeLoanPayload>(`${BASE}/loan-applications`);
export const employeeLoansApi = {
  ...employeeLoansBase,
  getInstallments: (id: string) => api.get<LoanInstallment[]>(`${BASE}/loan-applications/${id}/installments`).then((r) => r.data),
  replaceInstallments: (id: string, rows: LoanInstallment[]) =>
    api.put<LoanInstallment[]>(`${BASE}/loan-applications/${id}/installments`, { rows }, BULK).then((r) => r.data),
};
