import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Ban, Calculator, ExternalLink, Plus, Send, Trash2, Wand2 } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { useAuth } from '../../../context/AuthContext';
import { firstError, useLookup } from '../../../hooks/useLookup';
import { confirmDiscardUnsaved, useUnsavedChangesGuard } from '../../../lib/unsavedChanges';
import {
  DEDUCTION_TYPE_LABELS,
  payrollRunsApi,
  PAYROLL_RUN_TYPES,
  type PayrollRun,
  type PayrollRunPayload,
  type PayrollRunLine,
  type PayrollRunType,
} from '../../../api/transactions.api';
import {
  employeeCategoriesApi,
  payPeriodsApi,
  type EmployeeCategory,
  type PayPeriod,
} from '../../../api/payroll-masters.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';
import { EmployeePicker } from '../../ui/EmployeePicker';
import { asNum, payrollRowTotals } from './payrollRowTotals';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
  /** Opens Financials → Journal Entry on this entry (JE No link). */
  onOpenJournalEntry?: (journalEntryId: string) => void;
}

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');
const today = () => new Date().toISOString().slice(0, 10);
/**
 * The grid reads left to right as a payslip: attendance, then what was earned,
 * then what was taken off, then the net. `group` drives the tinted header bands
 * so a deduction can never be mistaken for an earning at a glance.
 *
 * `computed` columns are produced by Generate from leave, the loan schedule,
 * the tax formula and the monthly adjustment document. They stay read-only —
 * typing over a net pay would silently disagree with its own components.
 */
type ColGroup = 'days' | 'earnings' | 'deductions' | 'net';
interface NumCol {
  key: keyof PayrollRunLine;
  label: string;
  group: ColGroup;
  computed?: boolean;
}

const numCols: NumCol[] = [
  { key: 'totalDaysWorking', label: 'Total Days Working', group: 'days' },
  { key: 'totalDaysWorked', label: 'Days Worked', group: 'days' },
  { key: 'payLeaves', label: 'Paid Leave Days', group: 'days' },
  { key: 'unpaidLeaveDays', label: 'Unpaid Leave Days', group: 'days', computed: true },
  { key: 'lopDays', label: 'LOP Days', group: 'days' },
  { key: 'paidDays', label: 'Paid Days', group: 'days' },

  { key: 'basic', label: 'Basic', group: 'earnings' },
  { key: 'hra', label: 'HRA', group: 'earnings' },
  { key: 'conveyance', label: 'Conveyance', group: 'earnings' },
  { key: 'entertainment', label: 'Entertainment', group: 'earnings' },
  { key: 'education', label: 'Education', group: 'earnings' },
  { key: 'bigCity', label: 'Big City', group: 'earnings' },
  { key: 'adjustmentAdditions', label: 'Additions', group: 'earnings' },
  { key: 'perDayRate', label: 'Rate / Day', group: 'earnings', computed: true },
  { key: 'grossPay', label: 'Gross Pay', group: 'earnings', computed: true },
  { key: 'totalEarnings', label: 'Total Earnings', group: 'earnings', computed: true },

  // LOP, Loan, Advance, Income Tax, Other — each deduction on its own column,
  // because each credits a different account when the run is posted.
  { key: 'lopDeduction', label: 'Leave / LOP Ded.', group: 'deductions' },
  { key: 'loanDeduction', label: 'Loan Ded.', group: 'deductions' },
  { key: 'advanceDeduction', label: 'Advance Ded.', group: 'deductions' },
  { key: 'taxDeduction', label: 'Income Tax', group: 'deductions' },
  { key: 'adjustmentDeductions', label: 'Other Ded.', group: 'deductions' },
  { key: 'taxableGross', label: 'Taxable Gross', group: 'deductions', computed: true },
  { key: 'totalDeductions', label: 'Total Deductions', group: 'deductions', computed: true },

  { key: 'netPay', label: 'Net Pay', group: 'net', computed: true },
];

const aggregateKeys = new Set<keyof PayrollRunLine>(['grossPay', 'totalEarnings', 'totalDeductions', 'netPay']);

/** Tooltip for a document-sourced "Other Ded." cell: the types behind it. */
const splitTitle = (split: Record<string, number>) =>
  'From the Monthly Adjustment document — change it there, then Generate:\n' +
  Object.entries(split).map(([k, v]) => `${DEDUCTION_TYPE_LABELS[k] ?? k}: ${v}`).join('\n');

/** Only the fields PayrollRunLineRowDto declares — id/employee/aggregates are never sent back. */
function toSaveableRow(row: PayrollRunLine) {
  const { employeeId, totalDaysWorking, lopDays, totalDaysWorked, paidDays, payLeaves,
    basic, entertainment, eligibleBasic, conveyance, education, eligibleConveyance, hra, bigCity, eligibleHra,
    perDayRate, paidLeaveDays, unpaidLeaveDays, lopDeduction, loanDeduction, advanceDeduction, taxableGross,
    taxDeduction, adjustmentAdditions, adjustmentDeductions } = row;
  const numOrUndef = (v: unknown) => (v === '' || v === null || v === undefined ? undefined : Number(v));
  const raw = { totalDaysWorking, lopDays, totalDaysWorked, paidDays, payLeaves,
    basic, entertainment, eligibleBasic, conveyance, education, eligibleConveyance, hra, bigCity, eligibleHra,
    perDayRate, paidLeaveDays, unpaidLeaveDays, lopDeduction, loanDeduction, advanceDeduction, taxableGross,
    taxDeduction, adjustmentAdditions, adjustmentDeductions };
  return {
    employeeId,
    ...Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, numOrUndef(v)])),
  } as PayrollRunLine;
}

const groupHeaderTone: Record<ColGroup, string> = {
  days: 'bg-[#f0f0f0] text-[#444]',
  earnings: 'bg-[#e7f1e7] text-[#1f5130]',
  deductions: 'bg-[#fbeceb] text-[#8a2b22]',
  net: 'bg-[#fff4cc] text-[#6b4d00]',
};
const groupCellTone: Record<ColGroup, string> = {
  days: '',
  earnings: 'bg-[#fafcfa]',
  deductions: 'bg-[#fffafa]',
  net: 'bg-[#fffdf3] font-bold',
};

const groupLabels: Record<ColGroup, string> = {
  days: 'Attendance',
  earnings: 'Earnings',
  deductions: 'Deductions',
  net: 'Net',
};

/** Contiguous runs of `numCols` sharing a group, for the banded header row. */
const groupSpans = numCols.reduce<{ group: ColGroup; label: string; span: number }[]>((acc, c) => {
  const last = acc[acc.length - 1];
  if (last && last.group === c.group) last.span += 1;
  else acc.push({ group: c.group, label: groupLabels[c.group], span: 1 });
  return acc;
}, []);

/** Day counts are per-employee facts; summing them down the column is noise. */
const moneyCols = new Set<keyof PayrollRunLine>(
  numCols.filter((c) => c.group !== 'days' && c.key !== 'perDayRate').map((c) => c.key),
);

const fmt = (v: unknown) =>
  v === null || v === undefined || v === '' ? '—' : Number(v).toLocaleString(undefined, {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

const emptyForm = {
  employeeCategoryId: '',
  runType: 'Regular' as PayrollRunType,
  payPeriodId: '',
  payMonth: '',
  fromDate: '',
  toDate: '',
  documentDate: today(),
  remarks: '',
};

const statusTone = (s?: string | null) =>
  s === 'Posted' || s === 'Paid' ? 'bg-[#e7f1e7] text-[#1f5130] border-[#bcdcbc]'
    : s === 'Partially Paid' ? 'bg-[#fff4cc] text-[#6b4d00] border-[#e8d48a]'
      : s === 'Cancelled' ? 'bg-[#fbeceb] text-[#8a2b22] border-[#f0c9c6]'
        : 'bg-[#f0f0f0] text-[#444] border-[#d4d0c8]';

export const PayrollProcessWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus, onOpenJournalEntry,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [formDirty, setFormDirty] = useState(false);
  const [lines, setLines] = useState<PayrollRunLine[]>([]);
  const [linesDirty, setLinesDirty] = useState(false);
  const [linesError, setLinesError] = useState('');
  const [note, setNote] = useState('');
  const [generating, setGenerating] = useState(false);
  const [savingLines, setSavingLines] = useState(false);
  const [posting, setPosting] = useState(false);

  // What this user may do here. The server enforces every one of these; the
  // window only stops offering buttons that would be refused — HR prepares
  // (create/update), Finance posts (finance.journal.post), and a Finance user
  // with only hr.payroll.view sees the run read-only.
  const { hasPermission } = useAuth();
  const can = {
    create: hasPermission('hr.payroll.create'),
    update: hasPermission('hr.payroll.update'),
    remove: hasPermission('hr.payroll.delete'),
    post: hasPermission('finance.journal.post'),
  };
  const noPerm = (key: string) => `You do not have the ${key} permission.`;

  const crud = useCrudResource<PayrollRun, PayrollRunPayload>(
    'payroll-runs',
    payrollRunsApi,
    { label: (r) => r.jeNo || r.payMonth || r.payPeriod?.name || r.id },
  );

  const periods = useLookup<PayPeriod>('Pay Periods', () => payPeriodsApi.getAll({ isActive: true }), { enabled: show });
  const categories = useLookup<EmployeeCategory>('Employee Categories', () => employeeCategoriesApi.getAll({ isActive: true }), { enabled: show });

  // Answers to requests fired from this window are dropped if, by the time
  // they arrive, the user has moved to another run or another company.
  const scope = useRef({ companyId: crud.companyId, runId: crud.selected?.id ?? null });
  scope.current = { companyId: crud.companyId, runId: crud.selected?.id ?? null };
  const stillCurrent = (companyId: string | null, runId: string | null) =>
    scope.current.companyId === companyId && scope.current.runId === runId;

  const dirty = (crud.mode !== 'view' && formDirty) || linesDirty;
  useUnsavedChangesGuard('Payroll Process', show && dirty);

  const setField = <K extends keyof typeof emptyForm>(k: K, v: (typeof emptyForm)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFormDirty(true);
  };

  // A refreshed copy of the same run (after Post / Cancel) keeps the
  // confirmation on screen; moving to another run or mode clears it.
  const shownRun = useRef<string | null>(null);
  useEffect(() => {
    const key = `${crud.mode}:${crud.selected?.id ?? ''}`;
    if (shownRun.current !== key) {
      setNote('');
      setLinesError('');
    }
    shownRun.current = key;
    if (crud.mode === 'new') {
      setForm(emptyForm);
      setLines([]);
      setFormDirty(false);
      setLinesDirty(false);
    } else if (crud.selected) {
      const s = crud.selected;
      setForm({
        employeeCategoryId: s.employeeCategoryId ?? '',
        runType: s.runType ?? 'Regular',
        payPeriodId: s.payPeriodId ?? '',
        payMonth: s.payMonth ?? '',
        fromDate: toDateInput(s.fromDate),
        toDate: toDateInput(s.toDate),
        documentDate: toDateInput(s.documentDate) || today(),
        remarks: s.remarks ?? '',
      });
      setFormDirty(false);
      if (crud.mode === 'view') {
        const cid = crud.companyId;
        const rid = s.id;
        setLinesDirty(false);
        payrollRunsApi.getLines(s.id)
          .then((ls) => { if (stillCurrent(cid, rid)) setLines(ls); })
          .catch((e) => {
            if (!stillCurrent(cid, rid)) return;
            setLines([]);
            setLinesError(`Could not load this run's lines: ${e instanceof Error ? e.message : String(e)}`);
          });
      }
    } else {
      setLines([]);
      setLinesDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.mode, crud.selected]);

  const selectedPeriod = useMemo(
    () => periods.items.find((p) => p.id === form.payPeriodId) ?? null,
    [periods.items, form.payPeriodId],
  );

  const applyPayPeriod = (id: string) => {
    const p = periods.items.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      payPeriodId: id,
      fromDate: p ? toDateInput(p.fromDate) : f.fromDate,
      toDate: p ? toDateInput(p.toDate) : f.toDate,
      payMonth: p?.payMonth ?? f.payMonth,
      documentDate: p ? toDateInput(p.toDate) : f.documentDate,
    }));
    setFormDirty(true);
  };

  // Status, JE No and Cancellation JE No are system-managed by Post/Cancel —
  // the backend refuses them on a save (400), so they are never sent.
  const handleSave = () => {
    if (form.runType === 'Regular' && !form.payPeriodId) {
      crud.setError('A Regular payroll run needs a Pay Period. Choose one, or pick another run type.');
      return;
    }
    crud.save({
      employeeCategoryId: form.employeeCategoryId || null,
      runType: form.runType,
      payPeriodId: form.payPeriodId || undefined,
      payMonth: form.payMonth.trim() || undefined,
      fromDate: form.fromDate || undefined,
      toDate: form.toDate || undefined,
      documentDate: form.documentDate || undefined,
      remarks: form.remarks.trim() || undefined,
    });
  };

  /** Runs one request for the selected run; ignores its answer if the user moved on. */
  const act = async <T,>(
    busy: (b: boolean) => void,
    fn: (runId: string) => Promise<T>,
    done: (result: T) => void,
    fallback: string,
  ) => {
    if (!crud.selected) return;
    const cid = crud.companyId;
    const rid = crud.selected.id;
    busy(true);
    crud.setError('');
    setNote('');
    try {
      const result = await fn(rid);
      if (stillCurrent(cid, rid)) done(result);
    } catch (e) {
      if (stillCurrent(cid, rid)) crud.setError(e instanceof Error ? e.message : fallback);
    } finally {
      busy(false);
    }
  };

  const handlePost = () => {
    if (linesDirty) {
      crud.setError('Save the grid before posting — the posting uses the saved lines.');
      return;
    }
    void act(setPosting, (id) => payrollRunsApi.post(id), (updated) => {
      crud.select(updated);
      crud.refetch();
      setNote(`Posted as ${updated.jeNo}.`);
    }, 'Failed to post this payroll run.');
  };

  const handleCancelPosting = () => {
    // Ask the server which date the reversal will carry before asking the user
    // (PDF §33): a closed original period moves it to the next open one.
    void act(setPosting, (id) => payrollRunsApi.cancelPreview(id), (preview) => {
      const day = (d: string) => new Date(d).toISOString().slice(0, 10);
      const when = preview.shifted
        ? `Its period ${preview.originalPeriod ?? ''} is closed, so the reversal will post on ${day(preview.reversalDate)} (period ${preview.reversalPeriod}).`
        : `The reversal will post on ${day(preview.reversalDate)}, the original date (period ${preview.reversalPeriod}).`;
      if (!window.confirm(`Cancel this posted payroll run?\n\nThis reverses ${preview.journalEntryNo} and puts recovered loan/advance installments back to unpaid.\n${when}`)) return;
      runCancel();
    }, 'Could not work out the reversal date for this run.');
  };

  const runCancel = () => {
    void act(setPosting, (id) => payrollRunsApi.cancel(id), (updated) => {
      crud.select(updated);
      crud.refetch();
      setNote(`Cancelled; reversal ${updated.cancellationJeNo}.`);
    }, 'Failed to cancel this payroll run.');
  };

  const handleGenerate = () => {
    if (linesDirty && !window.confirm('Generate replaces the grid. Discard your unsaved grid changes?')) return;
    void act(setGenerating, (id) => payrollRunsApi.generate(id), (res) => {
      setLines(res.lines);
      setLinesDirty(false);
      const skipped = res.skipped ?? [];
      const unscaled = res.noPayScale ?? [];
      setNote(
        `Generated ${res.lines.length} row${res.lines.length === 1 ? '' : 's'}.` +
          (skipped.length
            ? ` Left out ${skipped.length} already in another Regular run for this period: ` +
              skipped.slice(0, 4).map((s) => `${s.name} (${s.run})`).join(', ') + (skipped.length > 4 ? '…' : '')
            : ''),
      );
      // Not an error, but not something to skim past either: these people get
      // no row until their grade has a pay scale (or someone adds one by hand).
      if (unscaled.length) {
        crud.setError(
          `${unscaled.length} employee${unscaled.length === 1 ? '' : 's'} left out — ` +
            unscaled.slice(0, 4).map((u) => `${u.name}: ${u.reason}`).join('; ') + (unscaled.length > 4 ? '…' : '') +
            '. Set the pay scale under HR Payroll → Masters → Grade Pay Scale.',
        );
      }
    }, 'Failed to generate lines.');
  };

  const handleSaveLines = () => {
    if (lines.some((l) => !l.employeeId)) {
      crud.setError('Choose an employee on every row (or remove the empty rows) before saving.');
      return;
    }
    void act(setSavingLines, (id) => payrollRunsApi.replaceLines(id, lines.map(toSaveableRow)), (saved) => {
      setLines(saved);
      setLinesDirty(false);
      setNote('Grid saved.');
    }, 'Failed to save the grid.');
  };

  const addRow = () => { setLines((r) => [...r, { employeeId: '' }]); setLinesDirty(true); };
  const removeRow = (idx: number) => { setLines((r) => r.filter((_, i) => i !== idx)); setLinesDirty(true); };
  const updateCell = (idx: number, key: string, value: string) => {
    setLines((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value === '' ? '' : Number(value) } : row)));
    setLinesDirty(true);
  };

  /** Guarded navigation: selecting another run or starting a new one discards pending edits. */
  const guard = (action: string, fn: () => void) => () => {
    if (dirty && !window.confirm(`Payroll Process has unsaved changes. ${action} will discard them. Continue?`)) return;
    setLinesDirty(false);
    setFormDirty(false);
    fn();
  };
  const handleClose = () => {
    if (dirty && !confirmDiscardUnsaved('Closing Payroll Process')) return;
    setLinesDirty(false);
    setFormDirty(false);
    onClose();
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const hasHeader = !!crud.selected;
  const runStatus = crud.selected?.status ?? 'Open';
  // Anything but Open is locked: its figures are (or were) in the ledger. The
  // backend enforces the same rule; this just stops the user trying.
  const isLocked = hasHeader && runStatus !== 'Open';
  const workingDays = selectedPeriod?.workingDays ?? crud.selected?.payPeriod?.workingDays ?? null;
  const onGrid = useMemo(() => lines.map((l) => l.employeeId).filter(Boolean), [lines]);
  const lookupError = firstError(periods.error, categories.error);

  return (
    <ClassicWindow
      title="Payroll Process"
      icon={<Calculator className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={handleClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={1050}
      minHeight={640}
      toolbar={
        <>
          <CrudToolbar
            onNew={guard('Starting a new run', () => (can.create ? crud.openNew() : crud.setError(noPerm('hr.payroll.create'))))}
            onEdit={() => crud.selected && crud.openEdit(crud.selected)}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!crud.selected && !isLocked && can.update}
            canDelete={!!crud.selected && !isLocked && can.remove}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy || generating || savingLines || posting}
          />
          {!can.update && !can.create && (
            <span className="text-[10px] text-gray-500 ml-2 italic">Read-only: you can view payroll runs{can.post ? ' and post or cancel them' : ''}.</span>
          )}
          <StatusNote error={crud.error || linesError || lookupError} status={note || crud.status} />
        </>
      }
      footer={<><span>{crud.rows.length} payroll run{crud.rows.length === 1 ? '' : 's'}</span><span>{dirty ? 'Unsaved changes' : 'Payroll Process'}</span></>}
    >
      <div className="flex flex-1 min-h-0">
        <div className="w-[260px] shrink-0 bg-white overflow-auto custom-scrollbar border-r border-[#d4d0c8]">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">JE No / Period</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Type</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Status</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={crud.selected?.id === s.id ? undefined : guard('Opening another run', () => crud.select(s))}
                  onDoubleClick={() => (s.status ?? 'Open') === 'Open' && can.update && crud.openEdit(s)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === s.id ? 'bg-[#ffed99]' : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{s.jeNo || s.payPeriod?.name || s.payMonth || toDateInput(s.documentDate)}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{s.runType ?? 'Regular'}</td>
                  <td className="py-1 px-2">{s.status ?? 'Open'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder noCompany={crud.noCompany} isLoading={crud.isLoading} isEmpty={!crud.isLoading && crud.rows.length === 0 && !crud.error} emptyText="No payroll runs yet. Click New to add one." />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select a payroll run, or click New.</div>
          )}

          {(isForm || crud.selected) && (
            <>
              <div className="p-2 border-b border-[#d4d0c8] shrink-0">
                <div className="grid grid-cols-4 gap-x-4 gap-y-1.5">
                  <FieldRow label="Employee Category" labelWidth="110px">
                    <ClassicSel value={form.employeeCategoryId} onChange={(e) => setField('employeeCategoryId', e.target.value)} className="w-full" disabled={!isForm}>
                      <option value="">All employees</option>
                      {categories.items.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                    </ClassicSel>
                  </FieldRow>
                  <FieldRow label="Run Type" labelWidth="100px">
                    <ClassicSel value={form.runType} onChange={(e) => setField('runType', e.target.value as PayrollRunType)} className="w-full" disabled={!isForm}>
                      {PAYROLL_RUN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </ClassicSel>
                  </FieldRow>
                  <FieldRow label="Pay Period" labelWidth="100px" required={form.runType === 'Regular'}>
                    <ClassicSel value={form.payPeriodId} onChange={(e) => applyPayPeriod(e.target.value)} className="w-full" disabled={!isForm}>
                      <option value="">—</option>
                      {periods.items.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                    </ClassicSel>
                  </FieldRow>
                  <FieldRow label="Working Days" labelWidth="100px">
                    <ClassicInput value={workingDays != null ? String(workingDays) : '—'} className="w-full" disabled readOnly title="From the pay period — the divisor for the per-day rate" />
                  </FieldRow>

                  <FieldRow label="Pay Month" labelWidth="110px">
                    <ClassicInput value={form.payMonth} onChange={(e) => setField('payMonth', e.target.value)} className="w-full" disabled={!isForm} placeholder="e.g. January 2026" />
                  </FieldRow>
                  <FieldRow label="From Date" labelWidth="100px">
                    <ClassicInput type="date" value={form.fromDate} onChange={(e) => setField('fromDate', e.target.value)} className="w-full" disabled={!isForm} />
                  </FieldRow>
                  <FieldRow label="To Date" labelWidth="100px">
                    <ClassicInput type="date" value={form.toDate} onChange={(e) => setField('toDate', e.target.value)} className="w-full" disabled={!isForm} />
                  </FieldRow>
                  <FieldRow label="Document Date" labelWidth="100px">
                    <ClassicInput type="date" value={form.documentDate} onChange={(e) => setField('documentDate', e.target.value)} className="w-full" disabled={!isForm} title="The posting date of the payroll journal entry" />
                  </FieldRow>

                  {/* JE No, Status and Cancellation JE No are written by Post/Cancel
                      (PayrollRunsService.post/cancel) — never hand-editable. */}
                  <FieldRow label="JE No" labelWidth="110px">
                    {crud.selected?.journalEntryId && crud.selected.jeNo ? (
                      <button
                        type="button"
                        onClick={() => onOpenJournalEntry?.(crud.selected!.journalEntryId!)}
                        className="flex items-center gap-1 text-[10.5px] text-blue-700 hover:underline"
                        title="Open this journal entry"
                      >
                        {crud.selected.jeNo} <ExternalLink className="w-3 h-3" />
                        {crud.selected.journalEntry?.currency && <span className="text-gray-500 no-underline">({crud.selected.journalEntry.currency})</span>}
                      </button>
                    ) : (
                      <ClassicInput value={crud.selected?.jeNo || '—'} className="w-full" disabled readOnly />
                    )}
                  </FieldRow>
                  <FieldRow label="Status" labelWidth="100px">
                    <span className={cn('inline-block px-2 py-0.5 text-[10px] font-bold rounded-[1px] border', statusTone(isForm && crud.mode === 'new' ? 'Open' : runStatus))}>
                      {isForm && crud.mode === 'new' ? 'Open' : runStatus}
                    </span>
                  </FieldRow>
                  <FieldRow label="Cancellation JE No" labelWidth="100px">
                    <ClassicInput value={crud.selected?.cancellationJeNo || '—'} className="w-full" disabled readOnly />
                  </FieldRow>
                  <FieldRow label="Lines" labelWidth="100px">
                    <ClassicInput value={String(lines.length)} className="w-full" disabled readOnly />
                  </FieldRow>

                  <div className="col-span-4">
                    <FieldRow label="Remarks" labelWidth="110px">
                      <ClassicInput value={form.remarks} onChange={(e) => setField('remarks', e.target.value)} className="w-full" disabled={!isForm} />
                    </FieldRow>
                  </div>
                  {!form.employeeCategoryId && crud.selected?.employeeType && !isForm && (
                    <div className="col-span-4 text-[10px] text-gray-500 italic">
                      Created before Employee Category existed — recorded Employee Type: "{crud.selected.employeeType}" (treated as All employees).
                    </div>
                  )}
                </div>
                {isForm && (
                  <div className="flex gap-2 mt-2">
                    <YellowBtn onClick={handleSave} disabled={crud.isBusy}>{crud.isBusy ? 'Saving…' : crud.mode === 'new' ? 'Add' : 'Save'}</YellowBtn>
                    <GreyBtn onClick={() => { setFormDirty(false); crud.cancel(); }}>Cancel</GreyBtn>
                  </div>
                )}
                {!isForm && crud.selected && (
                  <div className="flex gap-2 mt-2 items-center">
                    {runStatus === 'Open' && (
                      <button
                        onClick={handlePost}
                        disabled={posting || !lines.length || !can.post}
                        title={!can.post ? `${noPerm('finance.journal.post')} Ask Finance to post this run.` : !lines.length ? 'Generate or add rows before posting' : undefined}
                        className="flex items-center gap-1 px-3 py-0.5 text-[10.5px] border border-[#8ab88a] bg-[#e7f1e7] text-[#1f5130] rounded-[1px] hover:bg-[#d7ead7] disabled:opacity-40"
                      >
                        <Send className="w-3 h-3" /> {posting ? 'Posting…' : 'Post to G/L'}
                      </button>
                    )}
                    {runStatus === 'Posted' && (
                      <button
                        onClick={handleCancelPosting}
                        disabled={posting || !can.post}
                        title={!can.post ? noPerm('finance.journal.post') : undefined}
                        className="flex items-center gap-1 px-3 py-0.5 text-[10.5px] border border-[#e0a9a3] bg-[#fbeceb] text-[#8a2b22] rounded-[1px] hover:bg-[#f6dcda] disabled:opacity-40"
                      >
                        <Ban className="w-3 h-3" /> {posting ? 'Cancelling…' : 'Cancel Posting'}
                      </button>
                    )}
                    {!can.post && (runStatus === 'Open' || runStatus === 'Posted') && (
                      <span className="text-[10px] text-[#8a2b22]">
                        Posting to the G/L needs the Finance permission finance.journal.post — ask Finance to {runStatus === 'Open' ? 'post' : 'cancel'} this run.
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] text-gray-500 italic">
                        {runStatus === 'Cancelled' ? 'Cancelled runs are kept as history and cannot be changed.' : 'Posted runs are read-only. Cancel Posting reverses the journal entry.'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {hasHeader && !isForm && (
                <>
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#d4d0c8] shrink-0 bg-[#f7f7f7]">
                    <div className="flex gap-2">
                      <button onClick={handleGenerate} disabled={generating || isLocked || !can.update} title={!can.update ? noPerm('hr.payroll.update') : undefined} className="flex items-center gap-1 px-3 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white rounded-[1px] hover:bg-[#ffed99] disabled:opacity-40">
                        <Wand2 className="w-3 h-3" /> {generating ? 'Generating…' : 'Generate From Grade + Attendance'}
                      </button>
                      <button onClick={addRow} disabled={isLocked || !can.update} className="flex items-center gap-1 px-3 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white rounded-[1px] hover:bg-[#ffed99] disabled:opacity-40">
                        <Plus className="w-3 h-3" /> Add Row
                      </button>
                    </div>
                    <YellowBtn onClick={handleSaveLines} disabled={savingLines || isLocked || !linesDirty || !can.update}>{savingLines ? 'Saving…' : 'Save Grid'}</YellowBtn>
                  </div>
                  <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full border-collapse text-[10px]">
                      <thead className="sticky top-0 z-10 bg-[#f0f0f0]">
                        <tr className="border-b border-gray-300">
                          <th className="border-r border-gray-300 px-1 py-0.5 text-left bg-[#f0f0f0]"></th>
                          {groupSpans.map((g) => (
                            <th
                              key={g.group}
                              colSpan={g.span}
                              className={cn('border-r border-gray-400 px-1 py-0.5 text-center font-bold uppercase tracking-wide text-[9px]', groupHeaderTone[g.group])}
                            >
                              {g.label}
                            </th>
                          ))}
                          <th className="w-8 bg-[#f0f0f0]"></th>
                        </tr>
                        <tr className="border-b border-gray-400">
                          <th className="border-r border-gray-300 px-1 py-1 text-left min-w-[190px] bg-[#f0f0f0]">Employee</th>
                          {numCols.map((c) => (
                            <th
                              key={c.key}
                              title={c.computed ? 'Computed by Generate — read-only' : undefined}
                              className={cn('border-r border-gray-300 px-1 py-1 text-left min-w-[100px]', groupHeaderTone[c.group])}
                            >
                              {c.label}
                            </th>
                          ))}
                          <th className="w-8 bg-[#f0f0f0]"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {lines.map((row, idx) => {
                          const totals = payrollRowTotals(row);
                          return (
                          <tr key={row.id ?? `new-${idx}`} className="border-b border-gray-100 h-6">
                            <td className="border-r border-gray-100 px-1">
                              {row.employee
                                ? <span>{row.employee.employeeNumber ? `${row.employee.employeeNumber} — ` : ''}{row.employee.name}</span>
                                : (
                                  <EmployeePicker
                                    compact
                                    disabled={isLocked}
                                    value={row.employeeId}
                                    exclude={onGrid}
                                    onChange={(id) => {
                                      setLines((r) => r.map((rr, i) => (i === idx ? { ...rr, employeeId: id } : rr)));
                                      setLinesDirty(true);
                                    }}
                                  />
                                )}
                            </td>
                            {numCols.map((c) => {
                              // "Other Ded." from a Monthly Adjustment document is the sum of
                              // typed deductions, each posting to its own account: edit the
                              // document and Generate again, not the total here.
                              const fromDocument = c.key === 'adjustmentDeductions' && !!row.adjustmentDeductionSplit;
                              return (
                              <td
                                key={c.key}
                                className={cn('border-r border-gray-100 px-1', groupCellTone[c.group])}
                                title={fromDocument ? splitTitle(row.adjustmentDeductionSplit!) : undefined}
                              >
                                {c.computed || fromDocument || isLocked || !can.update ? (
                                  <div className="h-[18px] leading-[18px] text-right tabular-nums text-[10px] text-[#333]">
                                    {fmt(aggregateKeys.has(c.key) ? totals[c.key as keyof typeof totals] : row[c.key])}
                                  </div>
                                ) : (
                                  <input
                                    type="number" step="0.01"
                                    value={row[c.key] === null || row[c.key] === undefined ? '' : String(row[c.key])}
                                    onChange={(e) => updateCell(idx, c.key as string, e.target.value)}
                                    className="w-full h-[18px] text-[10px] text-right tabular-nums outline-none border-none bg-transparent"
                                  />
                                )}
                              </td>
                              );
                            })}
                            <td className="text-center">
                              {!isLocked && (
                                <button onClick={() => removeRow(idx)}><Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" /></button>
                              )}
                            </td>
                          </tr>
                          );
                        })}
                        {!lines.length && (
                          <tr><td colSpan={numCols.length + 2} className="text-center text-gray-400 py-4">No rows yet. Click "Generate From Grade + Attendance" or "Add Row".</td></tr>
                        )}
                      </tbody>
                      {!!lines.length && (
                        <tfoot className="sticky bottom-0">
                          <tr className="bg-[#f0f0f0] border-t-2 border-gray-400 font-bold">
                            <td className="border-r border-gray-300 px-1 py-1">Total — {lines.length} employee{lines.length === 1 ? '' : 's'}</td>
                            {numCols.map((c) => (
                              <td key={c.key} className={cn('border-r border-gray-300 px-1 py-1 text-right tabular-nums', groupCellTone[c.group])}>
                                {moneyCols.has(c.key)
                                  ? fmt(lines.reduce((sum, r) => sum + (aggregateKeys.has(c.key) ? payrollRowTotals(r)[c.key as keyof ReturnType<typeof payrollRowTotals>] : asNum(r[c.key])), 0))
                                  : ''}
                              </td>
                            ))}
                            <td />
                          </tr>
                        </tfoot>
                      )}
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
