import React, { useEffect, useState } from 'react';
import { FileEdit, Plus, Trash2 } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  payrollAdjustmentsApi,
  type PayrollAdjustment,
  type PayrollAdjustmentPayload,
  type PayrollAdjustmentLine,
} from '../../../api/transactions.api';
import { payPeriodsApi, type PayPeriod } from '../../../api/payroll-masters.api';
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
const numCols: { key: keyof PayrollAdjustmentLine; label: string }[] = [
  { key: 'arrears', label: 'Arrears' },
  { key: 'generalDeduction', label: 'General Deduction' },
  { key: 'carAllowance', label: 'Car Allce' },
  { key: 'carInsLaptopDed', label: 'Car Ins/Laptop Ded' },
  { key: 'taDa', label: 'TA/DA' },
  { key: 'dowryAllowance', label: 'Dowry Allowance' },
  { key: 'taxableAddition', label: 'Taxable Addition' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'messDeduction', label: 'Mess Deduction' },
  { key: 'generalDeduction2', label: 'General Ded 2' },
  { key: 'carInsLaptopDed2', label: 'Car Ins/Laptop Ded 2' },
  { key: 'loanDeduction', label: 'Loan/Deduction' },
  { key: 'deduction11', label: 'Deduction11' },
  { key: 'deduction12', label: 'Deduction12' },
  { key: 'deduction13', label: 'Deduction13' },
  { key: 'deduction14', label: 'Deduction14' },
  { key: 'deduction15', label: 'Deduction15' },
  { key: 'amount', label: 'Amount' },
];

const emptyForm = {
  employeeType: '',
  payPeriodId: '',
  documentDate: today(),
  status: 'Open',
  remarks: '',
};

export const PayrollMonthlyAdjustmentsWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [lines, setLines] = useState<PayrollAdjustmentLine[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [savingLines, setSavingLines] = useState(false);

  const crud = useCrudResource<PayrollAdjustment, PayrollAdjustmentPayload>(
    'payroll-adjustments',
    payrollAdjustmentsApi,
    { label: (a) => a.id },
  );

  useEffect(() => {
    if (!show) return;
    payPeriodsApi.getAll({ isActive: true }).then(setPayPeriods).catch(() => setPayPeriods([]));
    employeesApi.getAll({ pageSize: 200 }).then((r) => setEmployees(r.items)).catch(() => setEmployees([]));
  }, [show]);

  useEffect(() => {
    if (crud.mode === 'new') {
      setForm(emptyForm);
      setLines([]);
    } else if (crud.selected) {
      const s = crud.selected;
      setForm({
        employeeType: s.employeeType ?? '',
        payPeriodId: s.payPeriodId ?? '',
        documentDate: toDateInput(s.documentDate) || today(),
        status: s.status ?? 'Open',
        remarks: s.remarks ?? '',
      });
      payrollAdjustmentsApi.getLines(s.id).then(setLines).catch(() => setLines([]));
    }
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    crud.save({
      employeeType: form.employeeType.trim() || undefined,
      payPeriodId: form.payPeriodId || undefined,
      documentDate: form.documentDate || undefined,
      status: form.status,
      remarks: form.remarks.trim() || undefined,
    });
  };

  const handleSaveLines = async () => {
    if (!crud.selected) return;
    setSavingLines(true);
    crud.setError('');
    try {
      const saved = await payrollAdjustmentsApi.replaceLines(crud.selected.id, lines);
      setLines(saved);
    } catch (e) {
      crud.setError(e instanceof Error ? e.message : 'Failed to save the grid.');
    } finally {
      setSavingLines(false);
    }
  };

  const addRow = () => setLines((r) => [...r, { employeeId: '' }]);
  const removeRow = (idx: number) => setLines((r) => r.filter((_, i) => i !== idx));
  const updateCell = (idx: number, key: string, value: string) =>
    setLines((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value === '' ? '' : Number(value) } : row)));
  const updateRemarks = (idx: number, value: string) =>
    setLines((r) => r.map((row, i) => (i === idx ? { ...row, remarks: value } : row)));

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const hasHeader = !!crud.selected;

  return (
    <ClassicWindow
      title="Payroll Monthly Adjustments"
      icon={<FileEdit className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={1100}
      minHeight={640}
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
            isBusy={crud.isBusy || savingLines}
          />
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={<><span>{crud.rows.length} adjustment doc{crud.rows.length === 1 ? '' : 's'}</span><span>Payroll Monthly Adjustments</span></>}
    >
      <div className="flex flex-1 min-h-0">
        <div className="w-[220px] shrink-0 bg-white overflow-auto custom-scrollbar border-r border-[#d4d0c8]">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Doc Date</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Status</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={() => crud.select(s)}
                  onDoubleClick={() => crud.openEdit(s)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === s.id ? 'bg-[#ffed99]' : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{s.payPeriod?.name || toDateInput(s.documentDate)}</td>
                  <td className="py-1 px-2">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder noCompany={crud.noCompany} isLoading={crud.isLoading} isEmpty={!crud.isLoading && crud.rows.length === 0} emptyText="No adjustment docs yet. Click New to add one." />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select an adjustment doc, or click New.</div>
          )}

          {(isForm || crud.selected) && (
            <>
              <div className="p-2 border-b border-[#d4d0c8] shrink-0">
                <div className="grid grid-cols-4 gap-x-4 gap-y-1.5">
                  <FieldRow label="Employee Type" labelWidth="100px">
                    <ClassicInput value={form.employeeType} onChange={(e) => setForm((f) => ({ ...f, employeeType: e.target.value }))} className="w-full" disabled={!isForm} placeholder="All" />
                  </FieldRow>
                  <FieldRow label="Pay Period" labelWidth="100px">
                    <ClassicSel value={form.payPeriodId} onChange={(e) => setForm((f) => ({ ...f, payPeriodId: e.target.value }))} className="w-full" disabled={!isForm}>
                      <option value="">—</option>
                      {payPeriods.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                    </ClassicSel>
                  </FieldRow>
                  <FieldRow label="Document Date" labelWidth="100px">
                    <ClassicInput type="date" value={form.documentDate} onChange={(e) => setForm((f) => ({ ...f, documentDate: e.target.value }))} className="w-full" disabled={!isForm} />
                  </FieldRow>
                  <FieldRow label="Status" labelWidth="100px">
                    <ClassicSel value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full" disabled={!isForm}>
                      <option value="Open">Open</option>
                      <option value="Posted">Posted</option>
                    </ClassicSel>
                  </FieldRow>
                </div>
                {isForm && (
                  <div className="flex gap-2 mt-2">
                    <YellowBtn onClick={handleSave} disabled={crud.isBusy}>{crud.isBusy ? 'Saving…' : crud.mode === 'new' ? 'Add' : 'Save'}</YellowBtn>
                    <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
                  </div>
                )}
              </div>

              {hasHeader && (
                <>
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#d4d0c8] shrink-0 bg-[#f7f7f7]">
                    <button onClick={addRow} className="flex items-center gap-1 px-3 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white rounded-[1px] hover:bg-[#ffed99]">
                      <Plus className="w-3 h-3" /> Add Row
                    </button>
                    <YellowBtn onClick={handleSaveLines} disabled={savingLines}>{savingLines ? 'Saving…' : 'Save Grid'}</YellowBtn>
                  </div>
                  <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full border-collapse text-[9.5px]">
                      <thead className="sticky top-0 z-10 bg-[#f0f0f0]">
                        <tr className="border-b border-gray-400">
                          <th className="border-r border-gray-300 px-1 py-1 text-left min-w-[160px]">Employee</th>
                          {numCols.map((c) => <th key={c.key} className="border-r border-gray-300 px-1 py-1 text-left min-w-[85px]">{c.label}</th>)}
                          <th className="border-r border-gray-300 px-1 py-1 text-left min-w-[120px]">Remarks</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {lines.map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-100 h-6">
                            <td className="border-r border-gray-100 px-1">
                              {row.employee
                                ? <span>{row.employee.employeeNumber ? `${row.employee.employeeNumber} — ` : ''}{row.employee.name}</span>
                                : (
                                  <select value={row.employeeId} onChange={(e) => setLines((r) => r.map((rr, i) => (i === idx ? { ...rr, employeeId: e.target.value } : rr)))} className="w-full h-[18px] text-[10px] outline-none border-none">
                                    <option value="">Select…</option>
                                    {employees.map((e) => <option key={e.id} value={e.id}>{e.employeeNumber ? `${e.employeeNumber} — ` : ''}{e.name}</option>)}
                                  </select>
                                )}
                            </td>
                            {numCols.map((c) => (
                              <td key={c.key} className="border-r border-gray-100 px-1">
                                <input
                                  type="number" step="0.01"
                                  value={row[c.key] === null || row[c.key] === undefined ? '' : String(row[c.key])}
                                  onChange={(e) => updateCell(idx, c.key as string, e.target.value)}
                                  className="w-full h-[18px] text-[10px] outline-none border-none"
                                />
                              </td>
                            ))}
                            <td className="border-r border-gray-100 px-1">
                              <input value={row.remarks ?? ''} onChange={(e) => updateRemarks(idx, e.target.value)} className="w-full h-[18px] text-[10px] outline-none border-none" />
                            </td>
                            <td className="text-center">
                              <button onClick={() => removeRow(idx)}><Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" /></button>
                            </td>
                          </tr>
                        ))}
                        {!lines.length && (
                          <tr><td colSpan={numCols.length + 3} className="text-center text-gray-400 py-4">No rows yet. Click "Add Row".</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
