import React, { useEffect, useState } from 'react';
import { Banknote, Plus, Trash2 } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  employeeLoansApi,
  type EmployeeLoan,
  type EmployeeLoanPayload,
  type LoanInstallment,
} from '../../../api/transactions.api';
import { loanTypesApi, payPeriodsApi, type LoanType, type PayPeriod } from '../../../api/payroll-masters.api';
import { employeesApi, type Employee } from '../../../api/employees.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');
const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  code: '',
  employeeId: '',
  loanTypeId: '',
  loanAmount: '',
  sanctionedAmount: '',
  documentDate: today(),
  status: 'Open',
  effectivePayPeriodId: '',
  effectiveDate: '',
  noOfInstallments: '',
  amountPerMonth: '',
  approved: false,
  remarks: '',
  isActive: true,
};

export const LoanApplicationWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [installments, setInstallments] = useState<LoanInstallment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [savingInstallments, setSavingInstallments] = useState(false);

  const crud = useCrudResource<EmployeeLoan, EmployeeLoanPayload>(
    'loan-applications',
    employeeLoansApi,
    { label: (l) => l.code },
  );

  useEffect(() => {
    if (!show) return;
    employeesApi.getAll({ pageSize: 200 }).then((r) => setEmployees(r.items)).catch(() => setEmployees([]));
    loanTypesApi.getAll({ isActive: true }).then(setLoanTypes).catch(() => setLoanTypes([]));
    payPeriodsApi.getAll({ isActive: true }).then(setPayPeriods).catch(() => setPayPeriods([]));
  }, [show]);

  useEffect(() => {
    if (crud.mode === 'new') {
      setForm(emptyForm);
      setInstallments([]);
    } else if (crud.mode === 'edit' && crud.selected) {
      const s = crud.selected;
      setForm({
        code: s.code,
        employeeId: s.employeeId,
        loanTypeId: s.loanTypeId,
        loanAmount: String(s.loanAmount),
        sanctionedAmount: s.sanctionedAmount != null ? String(s.sanctionedAmount) : '',
        documentDate: toDateInput(s.documentDate) || today(),
        status: s.status ?? 'Open',
        effectivePayPeriodId: s.effectivePayPeriodId ?? '',
        effectiveDate: toDateInput(s.effectiveDate),
        noOfInstallments: s.noOfInstallments != null ? String(s.noOfInstallments) : '',
        amountPerMonth: s.amountPerMonth != null ? String(s.amountPerMonth) : '',
        approved: s.approved,
        remarks: s.remarks ?? '',
        isActive: s.isActive,
      });
      setInstallments(s.installments ?? []);
    }
  }, [crud.mode, crud.selected]);

  const addRow = () => setInstallments((r) => [...r, { month: '', year: undefined, dueDate: '', amount: 0, status: 'Pending' }]);
  const removeRow = (idx: number) => setInstallments((r) => r.filter((_, i) => i !== idx));
  const updateRow = (idx: number, patch: Partial<LoanInstallment>) =>
    setInstallments((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const saveInstallmentsFor = async (loanId: string) => {
    setSavingInstallments(true);
    try {
      const saved = await employeeLoansApi.replaceInstallments(loanId, installments);
      setInstallments(saved);
    } catch (e) {
      crud.setError(e instanceof Error ? e.message : 'Failed to save the installment schedule.');
    } finally {
      setSavingInstallments(false);
    }
  };

  // Once a loan is created/updated (mode flips back to 'view'), flush any
  // manual installment edits — including down to zero rows.
  const prevModeRef = React.useRef(crud.mode);
  useEffect(() => {
    if (prevModeRef.current !== 'view' && crud.mode === 'view' && crud.selected) {
      void saveInstallmentsFor(crud.selected.id);
    }
    prevModeRef.current = crud.mode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    if (!form.code.trim() || !form.employeeId || !form.loanTypeId || !form.loanAmount) {
      crud.setError('Doc No, Employee, Loan Type and Loan Amount are required.');
      return;
    }
    crud.save({
      code: form.code.trim(),
      employeeId: form.employeeId,
      loanTypeId: form.loanTypeId,
      loanAmount: Number(form.loanAmount),
      sanctionedAmount: form.sanctionedAmount === '' ? undefined : Number(form.sanctionedAmount),
      documentDate: form.documentDate || undefined,
      status: form.status,
      effectivePayPeriodId: form.effectivePayPeriodId || undefined,
      effectiveDate: form.effectiveDate || undefined,
      noOfInstallments: form.noOfInstallments === '' ? undefined : Number(form.noOfInstallments),
      amountPerMonth: form.amountPerMonth === '' ? undefined : Number(form.amountPerMonth),
      approved: form.approved,
      remarks: form.remarks.trim() || undefined,
      isActive: form.isActive,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const selectedEmployee = employees.find((e) => e.id === form.employeeId);

  return (
    <ClassicWindow
      title="Loan Application"
      icon={<Banknote className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={900}
      minHeight={600}
      toolbar={
        <>
          <CrudToolbar
            onNew={crud.openNew}
            onEdit={() => crud.selected && crud.openEdit(crud.selected)}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!crud.selected}
            canDelete={!!crud.selected}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy || savingInstallments}
          />
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>{crud.rows.length} loan application{crud.rows.length === 1 ? '' : 's'}</span>
          <span>Loan Application</span>
        </>
      }
    >
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0 flex flex-col">
          <table className="w-full border-collapse text-[10.5px] shrink-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Doc No</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Employee</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Loan Type</th>
                <th className="text-right py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Amount</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Approved</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Status</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((l, i) => (
                <tr
                  key={l.id}
                  onClick={() => crud.select(l)}
                  onDoubleClick={() => crud.openEdit(l)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === l.id
                      ? 'bg-[#ffed99]'
                      : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{l.code}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{l.employee?.name ?? '—'}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{l.loanType?.code ?? '—'}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] text-right">{Number(l.loanAmount).toFixed(2)}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{l.approved ? 'Yes' : 'No'}</td>
                  <td className="py-1 px-2">{l.status ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No loan applications yet. Click New to add one."
          />

          {crud.selected && !isForm && (
            <div className="p-2 flex-1 flex flex-col min-h-0">
              <div className="text-[10.5px] font-bold text-[#333] mb-1">Installment Schedule — {crud.selected.code}</div>
              <div className="flex-1 border border-[#d4d0c8] overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#f0f0f0]">
                    <tr className="border-b border-[#d4d0c8]">
                      <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 py-1">#</th>
                      <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 py-1">Month</th>
                      <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 py-1">Year</th>
                      <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 py-1">Due Date</th>
                      <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 py-1">Amount</th>
                      <th className="text-[10px] font-bold text-left px-1 py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(crud.selected.installments ?? []).map((s, i) => (
                      <tr key={s.id ?? i} className="border-b border-gray-200 h-6">
                        <td className="border-r border-gray-200 px-1 text-[10.5px]">{i + 1}</td>
                        <td className="border-r border-gray-200 px-1 text-[10.5px]">{s.month ?? '—'}</td>
                        <td className="border-r border-gray-200 px-1 text-[10.5px]">{s.year ?? '—'}</td>
                        <td className="border-r border-gray-200 px-1 text-[10.5px]">{toDateInput(s.dueDate) || '—'}</td>
                        <td className="border-r border-gray-200 px-1 text-[10.5px]">{Number(s.amount).toFixed(2)}</td>
                        <td className="px-1 text-[10.5px]">{s.status ?? '—'}</td>
                      </tr>
                    ))}
                    {!(crud.selected.installments ?? []).length && (
                      <tr><td colSpan={6} className="text-center text-[10.5px] text-gray-400 py-2">No installments. Click Edit to add or set No. Of Installments + Effective Date.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="w-[360px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new'
              ? 'New Loan Application'
              : crud.mode === 'edit'
                ? `Edit — ${crud.selected?.code}`
                : 'Details'}
          </div>

          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">
              Select a loan application, or click New.
            </div>
          )}

          {!isForm && crud.selected && (
            <>
              <FieldRow label="Doc No">{crud.selected.code}</FieldRow>
              <FieldRow label="Employee">{crud.selected.employee?.name ?? '—'}</FieldRow>
              <FieldRow label="Loan Type">{crud.selected.loanType?.description ?? '—'}</FieldRow>
              <FieldRow label="Loan Amount">{Number(crud.selected.loanAmount).toFixed(2)}</FieldRow>
              <FieldRow label="Sanctioned">{crud.selected.sanctionedAmount != null ? Number(crud.selected.sanctionedAmount).toFixed(2) : '—'}</FieldRow>
              <FieldRow label="Doc Date">{toDateInput(crud.selected.documentDate)}</FieldRow>
              <FieldRow label="Status">{crud.selected.status ?? '—'}</FieldRow>
              <FieldRow label="Effective Date">{toDateInput(crud.selected.effectiveDate) || '—'}</FieldRow>
              <FieldRow label="No. Of Installments">{crud.selected.noOfInstallments ?? '—'}</FieldRow>
              <FieldRow label="Amount / Month">{crud.selected.amountPerMonth != null ? Number(crud.selected.amountPerMonth).toFixed(2) : '—'}</FieldRow>
              <FieldRow label="Approved">{crud.selected.approved ? 'Yes' : 'No'}</FieldRow>
              {crud.selected.remarks && (
                <div className="mt-2 text-[10px] text-gray-600 whitespace-pre-wrap">{crud.selected.remarks}</div>
              )}
              <div className="mt-3">
                <YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn>
              </div>
            </>
          )}

          {isForm && (
            <>
              <FieldRow label="Doc No" required>
                <ClassicInput value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full" autoFocus />
              </FieldRow>
              <FieldRow label="Employee" required>
                <ClassicSel value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} className="w-full">
                  <option value="">—</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.employeeNumber ? `${e.employeeNumber} — ` : ''}{e.name}</option>)}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Designation">{selectedEmployee?.position || '—'}</FieldRow>
              <FieldRow label="Loan Type" required>
                <ClassicSel value={form.loanTypeId} onChange={(e) => setForm((f) => ({ ...f, loanTypeId: e.target.value }))} className="w-full">
                  <option value="">—</option>
                  {loanTypes.map((t) => <option key={t.id} value={t.id}>{t.code} — {t.description}</option>)}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Loan Amount" required>
                <ClassicInput type="number" step="0.01" min="0" value={form.loanAmount} onChange={(e) => setForm((f) => ({ ...f, loanAmount: e.target.value }))} className="w-full" />
              </FieldRow>
              <FieldRow label="Sanctioned Amount">
                <ClassicInput type="number" step="0.01" min="0" value={form.sanctionedAmount} onChange={(e) => setForm((f) => ({ ...f, sanctionedAmount: e.target.value }))} className="w-full" />
              </FieldRow>
              <FieldRow label="Status">
                <ClassicSel value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full">
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Cancelled">Cancelled</option>
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Effective Pay Period">
                <ClassicSel value={form.effectivePayPeriodId} onChange={(e) => setForm((f) => ({ ...f, effectivePayPeriodId: e.target.value }))} className="w-full">
                  <option value="">—</option>
                  {payPeriods.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Effective Date">
                <ClassicInput type="date" value={form.effectiveDate} onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))} className="w-full" />
              </FieldRow>
              <FieldRow label="No. Of Installments">
                <ClassicInput type="number" step="1" min="1" value={form.noOfInstallments} onChange={(e) => setForm((f) => ({ ...f, noOfInstallments: e.target.value }))} className="w-full" />
              </FieldRow>
              <FieldRow label="Amount / Month">
                <ClassicInput
                  type="number" step="0.01" min="0"
                  placeholder={form.loanAmount && form.noOfInstallments ? (Number(form.loanAmount) / Number(form.noOfInstallments)).toFixed(2) : undefined}
                  value={form.amountPerMonth}
                  onChange={(e) => setForm((f) => ({ ...f, amountPerMonth: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Approved">
                <input type="checkbox" checked={form.approved} onChange={(e) => setForm((f) => ({ ...f, approved: e.target.checked }))} />
              </FieldRow>
              <div className="text-[10px] text-gray-500 italic mb-2">
                Setting No. Of Installments + Effective Date auto-generates the monthly schedule below on Save
                (leave Amount/Month blank to split the loan amount evenly).
              </div>

              <div className="mt-2 mb-1 flex items-center justify-between">
                <div className="text-[10.5px] font-bold text-[#333]">Installment Schedule</div>
                <button onClick={addRow} className="text-[10px] flex items-center gap-1 text-blue-700 hover:underline">
                  <Plus className="w-3 h-3" /> Add Row
                </button>
              </div>
              <div className="border border-[#d4d0c8] max-h-[160px] overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#f0f0f0] sticky top-0">
                    <tr className="border-b border-[#d4d0c8]">
                      <th className="border-r border-[#d4d0c8] text-[9.5px] font-bold text-left px-1">Month</th>
                      <th className="border-r border-[#d4d0c8] text-[9.5px] font-bold text-left px-1">Year</th>
                      <th className="border-r border-[#d4d0c8] text-[9.5px] font-bold text-left px-1">Amount</th>
                      <th className="border-r border-[#d4d0c8] text-[9.5px] font-bold text-left px-1">Status</th>
                      <th className="w-5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.map((s, idx) => (
                      <tr key={idx} className="border-b border-gray-200 h-6">
                        <td className="border-r border-gray-200 px-1">
                          <input value={s.month ?? ''} onChange={(e) => updateRow(idx, { month: e.target.value })} className="w-full h-[18px] text-[10px] outline-none border-none" />
                        </td>
                        <td className="border-r border-gray-200 px-1">
                          <input type="number" value={s.year ?? ''} onChange={(e) => updateRow(idx, { year: e.target.value === '' ? undefined : Number(e.target.value) })} className="w-full h-[18px] text-[10px] outline-none border-none" />
                        </td>
                        <td className="border-r border-gray-200 px-1">
                          <input type="number" step="0.01" value={String(s.amount ?? '')} onChange={(e) => updateRow(idx, { amount: Number(e.target.value) })} className="w-full h-[18px] text-[10px] outline-none border-none" />
                        </td>
                        <td className="border-r border-gray-200 px-1">
                          <select value={s.status ?? 'Pending'} onChange={(e) => updateRow(idx, { status: e.target.value })} className="w-full h-[18px] text-[10px] outline-none border-none bg-transparent">
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>
                        <td className="text-center">
                          <button onClick={() => removeRow(idx)}><Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" /></button>
                        </td>
                      </tr>
                    ))}
                    {!installments.length && (
                      <tr><td colSpan={5} className="text-center text-[10px] text-gray-400 py-2">No rows yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mb-1 mt-2">
                <div className="text-[10.5px] text-[#333] mb-1">Remarks</div>
                <textarea value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} className="w-full h-12 border border-[#d4d0c8] p-1 text-[10.5px] outline-none focus:border-orange-400 bg-white resize-none" />
              </div>
              <div className="flex gap-2 mt-3">
                <YellowBtn onClick={handleSave} disabled={crud.isBusy || savingInstallments}>
                  {crud.isBusy || savingInstallments ? 'Saving…' : 'Save'}
                </YellowBtn>
                <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
              </div>
            </>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
