/**
 * Gross / Total Earnings / Total Deductions / Net Pay for one Payroll Process
 * row, live from the row's own editable cells.
 *
 * This must stay identical to `rowTotals` in the backend's
 * `payroll-calculation.ts`, which recomputes the same four figures on save and
 * is what actually gets posted. The backend spec
 * `payroll-row-totals.parity.spec.ts` imports this file and feeds both
 * implementations the same rows, so the two cannot drift apart silently.
 *
 * Deliberately dependency-free (no React, no app imports) so that spec can
 * load it.
 */
export interface PayrollRowCells {
  basic?: unknown;
  hra?: unknown;
  conveyance?: unknown;
  entertainment?: unknown;
  education?: unknown;
  bigCity?: unknown;
  utilityAllowance?: unknown;
  medicalAllowance?: unknown;
  adhoc2017?: unknown;
  adhoc2018?: unknown;
  adjustmentAdditions?: unknown;
  lopDeduction?: unknown;
  loanDeduction?: unknown;
  advanceDeduction?: unknown;
  taxDeduction?: unknown;
  adjustmentDeductions?: unknown;
}

export interface PayrollRowTotals {
  grossPay: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
}

export const asNum = (v: unknown): number => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Same rounding as the backend's `money`: toFixed(2), not Math.round(x*100)/100. */
const money = (n: number): number => (Number.isFinite(n) ? Number(n.toFixed(2)) : 0);

export function payrollRowTotals(row: PayrollRowCells): PayrollRowTotals {
  const grossPay = money(
    asNum(row.basic) + asNum(row.hra) + asNum(row.conveyance) +
    asNum(row.entertainment) + asNum(row.education) + asNum(row.bigCity) +
    asNum(row.utilityAllowance) + asNum(row.medicalAllowance) + asNum(row.adhoc2017) + asNum(row.adhoc2018),
  );
  const totalEarnings = money(grossPay + asNum(row.adjustmentAdditions));
  const totalDeductions = money(
    asNum(row.lopDeduction) + asNum(row.loanDeduction) + asNum(row.advanceDeduction) +
    asNum(row.taxDeduction) + asNum(row.adjustmentDeductions),
  );
  return {
    grossPay,
    totalEarnings,
    totalDeductions,
    netPay: money(totalEarnings - totalDeductions),
  };
}
