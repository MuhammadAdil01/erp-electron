import api from '../lib/axios';
import { createCrudApi, type Auditable, type Ref } from './crud';

const BASE = '/hr/payroll-masters';

// ─── EMPLOYEE CATEGORY MASTER ─────────────────────────────────────────────────
export interface EmployeeCategory extends Auditable {
  code: string;
  name: string;
  remarks?: string | null;
  isActive: boolean;
  _count?: { employees: number };
}
export interface EmployeeCategoryPayload {
  code: string;
  name: string;
  remarks?: string;
  isActive?: boolean;
}
export const employeeCategoriesApi =
  createCrudApi<EmployeeCategory, EmployeeCategoryPayload>(`${BASE}/employee-categories`);

// ─── GRADE MASTER + PAY SCALE ──────────────────────────────────────────────────
export interface Grade extends Auditable {
  code: string;
  description: string;
  overtimeRatePerHour?: string | number | null;
  remarks?: string | null;
  isActive: boolean;
  _count?: { employees: number; payScale: number };
}
export interface GradePayload {
  code: string;
  description: string;
  overtimeRatePerHour?: number;
  remarks?: string;
  isActive?: boolean;
}
export interface GradePayScaleStage {
  id?: string;
  stage: number;
  basicPay?: string | number | null;
  hra?: string | number | null;
  utilityAllowance?: string | number | null;
  medicalAllowance?: string | number | null;
  conveyanceAllowance?: string | number | null;
  adhoc2017?: string | number | null;
  adhoc2018?: string | number | null;
}

const gradesBase = createCrudApi<Grade, GradePayload>(`${BASE}/grades`);
export const gradesApi = {
  ...gradesBase,
  getPayScale: (gradeId: string) =>
    api.get<GradePayScaleStage[]>(`${BASE}/grades/${gradeId}/pay-scale`).then((r) => r.data),
  replacePayScale: (gradeId: string, rows: GradePayScaleStage[]) =>
    api.put<GradePayScaleStage[]>(`${BASE}/grades/${gradeId}/pay-scale`, { rows }).then((r) => r.data),
};

// ─── LOAN MASTER ───────────────────────────────────────────────────────────────
export interface LoanType extends Auditable {
  code: string;
  description: string;
  loanType: string;
  maxAmount?: string | number | null;
  rateOfInterest?: string | number | null;
  minRepaymentAmount?: string | number | null;
  maxInstallments?: number | null;
  remarks?: string | null;
  isActive: boolean;
}
export interface LoanTypePayload {
  code: string;
  description: string;
  loanType?: string;
  maxAmount?: number;
  rateOfInterest?: number;
  minRepaymentAmount?: number;
  maxInstallments?: number;
  remarks?: string;
  isActive?: boolean;
}
export const loanTypesApi = createCrudApi<LoanType, LoanTypePayload>(`${BASE}/loan-types`);

// ─── PAY PERIOD MASTER ─────────────────────────────────────────────────────────
export interface PayPeriod extends Auditable {
  code: string;
  name: string;
  status?: string | null;
  fromDate: string;
  toDate: string;
  payMonth?: string | null;
  workingDays?: number | null;
  saturdays?: number | null;
  holidays?: number | null;
  maxNormalOtHoursMonth?: string | number | null;
  maxWorkingHoursMonth?: string | number | null;
  remarks?: string | null;
  isActive: boolean;
}
export interface PayPeriodPayload {
  code: string;
  name: string;
  status?: string;
  fromDate: string;
  toDate: string;
  payMonth?: string;
  workingDays?: number;
  saturdays?: number;
  holidays?: number;
  maxNormalOtHoursMonth?: number;
  maxWorkingHoursMonth?: number;
  remarks?: string;
  isActive?: boolean;
}
export const payPeriodsApi = createCrudApi<PayPeriod, PayPeriodPayload>(`${BASE}/pay-periods`);

// ─── TAX FORMULA CALCULATION ───────────────────────────────────────────────────
export interface TaxSlab {
  id?: string;
  ordering?: number;
  lowerAmount: string | number;
  higherAmount?: string | number | null;
  percentage: string | number;
}
export interface TaxFormula extends Auditable {
  code: string;
  employeeCategoryId?: string | null;
  employeeCategory?: Ref | null;
  periodYear?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
  startYear?: number | null;
  noOfMonths?: number | null;
  documentDate: string;
  remarks?: string | null;
  isActive: boolean;
  slabs?: TaxSlab[];
}
export interface TaxFormulaPayload {
  code: string;
  employeeCategoryId?: string;
  periodYear?: number;
  fromDate?: string;
  toDate?: string;
  startYear?: number;
  noOfMonths?: number;
  documentDate?: string;
  remarks?: string;
  isActive?: boolean;
}

const taxFormulasBase = createCrudApi<TaxFormula, TaxFormulaPayload>(`${BASE}/tax-formulas`);
export const taxFormulasApi = {
  ...taxFormulasBase,
  replaceSlabs: (id: string, rows: TaxSlab[]) =>
    api.put<TaxSlab[]>(`${BASE}/tax-formulas/${id}/slabs`, { rows }).then((r) => r.data),
};
