import React, { useEffect, useState } from 'react';
import { Calculator, Plus, Trash2, Wand2 } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  payrollRunsApi,
  type PayrollRun,
  type PayrollRunPayload,
  type PayrollRunLine,
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
const numCols: { key: keyof PayrollRunLine; label: string }[] = [
  { key: 'totalDaysWorking', label: 'Total Days Working' },
  { key: 'lopDays', label: 'LOP Days' },
  { key: 'totalDaysWorked', label: 'Days Worked' },
  { key: 'paidDays', label: 'Paid Days' },
  { key: 'payLeaves', label: 'Pay Leaves' },
  { key: 'basic', label: 'Basic' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'eligibleBasic', label: 'Eligible Basic' },
  { key: 'conveyance', label: 'Conveyance' },
  { key: 'education', label: 'Education' },
  { key: 'eligibleConveyance', label: 'Eligible Conveyance' },
  { key: 'hra', label: 'HRA' },
  { key: 'bigCity', label: 'Big City' },
  { key: 'eligibleHra', label: 'Eligible HRA' },
];

const emptyForm = {
  employeeType: '',
  payPeriodId: '',
  payMonth: '',
  fromDate: '',
  toDate: '',
  jeNo: '',
  documentDate: today(),
  status: 'Open',
  cancellationJeNo: '',
  remarks: '',
};

export const PayrollProcessWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [lines, setLines] = useState<PayrollRunLine[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [generating, setGenerating] = useState(false);
  const [savingLines, setSavingLines] = useState(false);

  const crud = useCrudResource<PayrollRun, PayrollRunPayload>(
    'payroll-runs',
    payrollRunsApi,
    { label: (r) => r.jeNo || r.id },
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
        payMonth: s.payMonth ?? '',
        fromDate: toDateInput(s.fromDate),
        toDate: toDateInput(s.toDate),
        jeNo: s.jeNo ?? '',
        documentDate: toDateInput(s.documentDate) || today(),
        status: s.status ?? 'Open',
        cancellationJeNo: s.cancellationJeNo ?? '',
        remarks: s.remarks ?? '',
      });
      payrollRunsApi.getLines(s.id).then(setLines).catch(() => setLines([]));
    }
  }, [crud.mode, crud.selected]);

  const applyPayPeriod = (id: string) => {
    const p = payPeriods.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      payPeriodId: id,
      fromDate: p ? toDateInput(p.fromDate) : f.fromDate,
      toDate: p ? toDateInput(p.toDate) : f.toDate,
      payMonth: p?.payMonth ?? f.payMonth,
    }));
  };

  const handleSave = () => {
    crud.save({
      employeeType: form.employeeType.trim() || undefined,
      payPeriodId: form.payPeriodId || undefined,
      payMonth: form.payMonth.trim() || undefined,
      fromDate: form.fromDate || undefined,
      toDate: form.toDate || undefined,
      jeNo: form.jeNo.trim() || undefined,
      documentDate: form.documentDate || undefined,
      status: form.status,
      cancellationJeNo: form.cancellationJeNo.trim() || undefined,
      remarks: form.remarks.trim() || undefined,
    });
  };

  const handleGenerate = async () => {
    if (!crud.selected) return;
    setGenerating(true);
    crud.setError('');
    try {
      const generated = await payrollRunsApi.generate(crud.selected.id);
      setLines(generated);
    } catch (e) {
      crud.setError(e instanceof Error ? e.message : 'Failed to generate lines.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveLines = async () => {
    if (!crud.selected) return;
    setSavingLines(true);
    crud.setError('');
    try {
      const saved = await payrollRunsApi.replaceLines(crud.selected.id, lines);
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

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const hasHeader = !!crud.selected;

  return (
    <ClassicWindow
      title="Payroll Process"
      icon={<Calculator className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={1050}
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
            isBusy={crud.isBusy || generating || savingLines}
          />
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={<><span>{crud.rows.length} payroll run{crud.rows.length === 1 ? '' : 's'}</span><span>Payroll Process</span></>}
    >
      <div className="flex flex-1 min-h-0">
        <div className="w-[240px] shrink-0 bg-white overflow-auto custom-scrollbar border-r border-[#d4d0c8]">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">JE No / Period</th>
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
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{s.jeNo || s.payPeriod?.name || toDateInput(s.documentDate)}</td>
                  <td className="py-1 px-2">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder noCompany={crud.noCompany} isLoading={crud.isLoading} isEmpty={!crud.isLoading && crud.rows.length === 0} emptyText="No payroll runs yet. Click New to add one." />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select a payroll run, or click New.</div>
          )}

          {(isForm || crud.selected) && (
            <>
              <div className="p-2 border-b border-[#d4d0c8] shrink-0">
                <div className="grid grid-cols-4 gap-x-4 gap-y-1.5">
                  <FieldRow label="Employee Type" labelWidth="100px">
                    <ClassicInput value={form.employeeType} onChange={(e) => setForm((f) => ({ ...f, employeeType: e.target.value }))} className="w-full" disabled={!isForm} placeholder="All" />
                  </FieldRow>
                  <FieldRow label="Pay Period" labelWidth="100px">
                    <ClassicSel value={form.payPeriodId} onChange={(e) => applyPayPeriod(e.target.value)} className="w-full" disabled={!isForm}>
                      <option value="">—</option>
                      {payPeriods.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                    </ClassicSel>
                  </FieldRow>
                  <FieldRow label="From Date" labelWidth="100px">
                    <ClassicInput type="date" value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} className="w-full" disabled={!isForm} />
                  </FieldRow>
                  <FieldRow label="To Date" labelWidth="100px">
                    <ClassicInput type="date" value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} className="w-full" disabled={!isForm} />
                  </FieldRow>
                  <FieldRow label="JE No" labelWidth="100px">
                    <ClassicInput value={form.jeNo} onChange={(e) => setForm((f) => ({ ...f, jeNo: e.target.value }))} className="w-full" disabled={!isForm} />
                  </FieldRow>
                  <FieldRow label="Document Date" labelWidth="100px">
                    <ClassicInput type="date" value={form.documentDate} onChange={(e) => setForm((f) => ({ ...f, documentDate: e.target.value }))} className="w-full" disabled={!isForm} />
                  </FieldRow>
                  <FieldRow label="Status" labelWidth="100px">
                    <ClassicSel value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full" disabled={!isForm}>
                      <option value="Open">Open</option>
                      <option value="Posted">Posted</option>
                      <option value="Cancelled">Cancelled</option>
                    </ClassicSel>
                  </FieldRow>
                  <FieldRow label="Cancellation JE No" labelWidth="100px">
                    <ClassicInput value={form.cancellationJeNo} onChange={(e) => setForm((f) => ({ ...f, cancellationJeNo: e.target.value }))} className="w-full" disabled={!isForm} />
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
                    <div className="flex gap-2">
                      <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-1 px-3 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white rounded-[1px] hover:bg-[#ffed99] disabled:opacity-40">
                        <Wand2 className="w-3 h-3" /> {generating ? 'Generating…' : 'Generate From Grade + Attendance'}
                      </button>
                      <button onClick={addRow} className="flex items-center gap-1 px-3 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white rounded-[1px] hover:bg-[#ffed99]">
                        <Plus className="w-3 h-3" /> Add Row
                      </button>
                    </div>
                    <YellowBtn onClick={handleSaveLines} disabled={savingLines}>{savingLines ? 'Saving…' : 'Save Grid'}</YellowBtn>
                  </div>
                  <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full border-collapse text-[10px]">
                      <thead className="sticky top-0 z-10 bg-[#f0f0f0]">
                        <tr className="border-b border-gray-400">
                          <th className="border-r border-gray-300 px-1 py-1 text-left min-w-[160px]">Employee</th>
                          {numCols.map((c) => <th key={c.key} className="border-r border-gray-300 px-1 py-1 text-left min-w-[100px]">{c.label}</th>)}
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
                            <td className="text-center">
                              <button onClick={() => removeRow(idx)}><Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" /></button>
                            </td>
                          </tr>
                        ))}
                        {!lines.length && (
                          <tr><td colSpan={numCols.length + 2} className="text-center text-gray-400 py-4">No rows yet. Click "Generate From Grade + Attendance" or "Add Row".</td></tr>
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
