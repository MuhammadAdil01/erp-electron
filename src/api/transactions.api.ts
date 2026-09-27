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
/**
 * Post and Cancel write the journal entry, the loan/advance recovery rows and
 * the run in one transaction — a handful of round trips to the hosted
 * database, more with many employees. The shared 15s default is too short for
 * that, so they get the same long budget as the bulk calls.
 */
const POSTING = { timeout: 120_000 };

export const PAYROLL_RUN_TYPES = ['Regular', 'Supplementary', 'Off-cycle', 'Bonus'] as const;
export type PayrollRunType = (typeof PAYROLL_RUN_TYPES)[number];

/** Statuses written only by Post / Cancel (and, from Phase 2, salary payments). */
export type PayrollRunStatus = 'Open' | 'Posted' | 'Partially Paid' | 'Paid' | 'Cancelled';

export interface PayrollRunLine {
  id?: string;
  employeeId: string;
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
  /** Salary advance recovered this run — its own column and its own JE credit. */
  advanceDeduction?: string | number | null;
  taxableGross?: string | number | null;
  taxDeduction?: string | number | null;
  adjustmentAdditions?: string | number | null;
  adjustmentDeductions?: string | number | null;
  /**
   * The Monthly Adjustment deduction types behind adjustmentDeductions, set by
   * Generate. Server-owned: while it is set, "Other Ded." is read-only and the
   * server keeps it equal to the split's sum. Never sent back on save.
   */
  adjustmentDeductionSplit?: Record<string, number> | null;
  totalEarnings?: string | number | null;
  totalDeductions?: string | number | null;
  netPay?: string | number | null;
  employee?: { id: string; name: string; employeeNumber?: string | null; departmentId?: string | null; positionId?: string | null };
}
export interface PayrollRun extends Auditable {
  /** Legacy free text from before Employee Category; read-only history. */
  employeeType?: string | null;
  employeeCategoryId?: string | null;
  runType?: PayrollRunType;
  payPeriodId?: string | null;
  payMonth?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  jeNo?: string | null;
  documentDate: string;
  status?: PayrollRunStatus | null;
  cancellationJeNo?: string | null;
  journalEntryId?: string | null;
  remarks?: string | null;
  payPeriod?: { id: string; code: string; name: string; workingDays?: number | null; fromDate?: string; toDate?: string } | null;
  employeeCategory?: { id: string; code: string; name: string } | null;
  journalEntry?: { id: string; number: string; status: string; currency?: string } | null;
  _count?: { lines: number };
}
/**
 * What the window may send. Status, JE No, Cancellation JE No and the journal
 * link are not here: the backend refuses them (400), because only Post and
 * Cancel may set them.
 */
export interface PayrollRunPayload {
  employeeCategoryId?: string | null;
  runType?: PayrollRunType;
  payPeriodId?: string;
  payMonth?: string;
  fromDate?: string;
  toDate?: string;
  documentDate?: string;
  remarks?: string;
}

/** Generate's answer: the new grid, plus anyone left out because another active Regular run already pays them. */
export interface PayrollGenerateResult {
  lines: PayrollRunLine[];
  skipped: { employeeId: string; name: string; run: string; reason?: string }[];
  /** Left out because they have no grade, or their grade has no pay-scale stage. */
  noPayScale?: { employeeId: string; name: string; reason: string }[];
  /** E.g. an attendance sheet for the period that is still Open (QA D30) and so was not used. */
  warnings?: string[];
}

const payrollRunsBase = createCrudApi<PayrollRun, PayrollRunPayload>(`${BASE}/payroll-runs`);
export const payrollRunsApi = {
  ...payrollRunsBase,
  getLines: (id: string) => api.get<PayrollRunLine[]>(`${BASE}/payroll-runs/${id}/lines`).then((r) => r.data),
  replaceLines: (id: string, rows: PayrollRunLine[]) =>
    api.put<PayrollRunLine[]>(`${BASE}/payroll-runs/${id}/lines`, { rows }, BULK).then((r) => r.data),
  generate: (id: string) =>
    api.post<PayrollGenerateResult>(`${BASE}/payroll-runs/${id}/generate`, {}, BULK).then((r) => r.data),
  /** Books the run to the G/L — salary expense, payables, tax, loan and advance recovery. */
  post: (id: string) => api.post<PayrollRun>(`${BASE}/payroll-runs/${id}/post`, {}, POSTING).then((r) => r.data),
  /** Reverses a posted run's journal entry (and its recoveries) and flips it to Cancelled. */
  cancel: (id: string, reason?: string) =>
    api.post<PayrollRun>(`${BASE}/payroll-runs/${id}/cancel`, { reason }, POSTING).then((r) => r.data),
  /** The date Cancel Posting would reverse on (PDF §33), for the confirm dialog. */
  cancelPreview: (id: string) =>
    api.get<PayrollCancelPreview>(`${BASE}/payroll-runs/${id}/cancel-preview`).then((r) => r.data),
};

export interface PayrollCancelPreview {
  journalEntryNo: string;
  originalDate: string;
  originalPeriod: string | null;
  reversalDate: string;
  reversalPeriod: string;
  /** True when the original period is closed and the reversal moves to a later one. */
  shifted: boolean;
}

/** Labels for the deduction types in adjustmentDeductionSplit (payroll-calculation.ts). */
export const DEDUCTION_TYPE_LABELS: Record<string, string> = {
  messDeduction: 'Mess', carInsLaptopDed: 'Car ins./laptop', carInsLaptopDed2: 'Car ins./laptop 2',
  generalDeduction: 'General', generalDeduction2: 'General 2', deduction11: 'Deduction 11', deduction12: 'Deduction 12',
  deduction13: 'Deduction 13', deduction14: 'Deduction 14', deduction15: 'Deduction 15',
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
  /** Legacy free text from before Employee Category; read-only history. */
  employeeType?: string | null;
  employeeCategoryId?: string | null;
  employeeCategory?: { id: string; code: string; name: string } | null;
  payPeriodId?: string | null;
  documentDate: string;
  status?: string | null;
  remarks?: string | null;
  payPeriod?: { id: string; code: string; name: string } | null;
  _count?: { lines: number };
}
export interface PayrollAdjustmentPayload {
  /** null = the document applies to every employee. */
  employeeCategoryId?: string | null;
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
