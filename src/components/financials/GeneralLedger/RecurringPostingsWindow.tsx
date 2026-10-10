import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, ListChecks, Plus, Trash2, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  accountsApi,
  recurringPostingsApi,
  type RecurringPosting,
  type RecurringPostingPayload,
} from '../../../api/financials.api';
import { ClassicWindow, CrudToolbar, StatusNote, ListPlaceholder, ToolBtn, type WindowState } from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  onFocus?: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
}

type Frequency = RecurringPosting['frequency'];

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SEMIANNUALLY', label: 'Semi-annually' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'ONE_TIME', label: 'One time' },
];
const frequencyLabel = (f: Frequency) => FREQUENCIES.find((x) => x.value === f)?.label ?? f;

interface DraftLine {
  key: string;
  accountId: string;
  description: string;
  debit: string;
  credit: string;
}

const blankLine = (): DraftLine => ({
  key: Math.random().toString(36).slice(2),
  accountId: '', description: '', debit: '', credit: '',
});

const today = () => new Date().toISOString().slice(0, 10);
const day = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');

const emptyForm = {
  code: '', description: '', isActive: true,
  frequency: 'MONTHLY' as Frequency,
  nextExecution: today(),
  hasValidUntil: false, validUntil: '',
  maxExecutions: '',
};

const num = (s: string | number) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n: number) => Math.round(n * 100) / 100;
const money = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const amountOf = (r: RecurringPosting) => r.lines.reduce((s, l) => s + num(l.debit), 0);
const isDue = (r: RecurringPosting) => r.isActive && day(r.nextExecution) <= today();
const errText = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

interface RunResult { code: string; instance: number; ok: boolean; text: string }

/**
 * Financials → Recurring Postings. A recurring posting is a fixed, balanced set
 * of journal lines with a schedule (rent, insurance, accruals). Nothing posts
 * by itself: postings that are due show in the Confirmation List, where the
 * user executes them. Each execution posts one journal entry — dated at the
 * scheduled date unless changed — and moves the schedule on, in one backend
 * call. A posting that has posted entries can only be deactivated.
 */
export const RecurringPostingsWindow: React.FC<Props> = ({
  show = true, onClose, onFocus, windowState, setWindowState, onUpdateState,
}) => {
  const { hasPermission, activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const can = {
    create: hasPermission('financials.recurring_posting.create'),
    update: hasPermission('financials.recurring_posting.update'),
    remove: hasPermission('financials.recurring_posting.delete'),
    // Executing posts to the ledger, so it also needs journal posting rights.
    execute: hasPermission('financials.recurring_posting.update') && hasPermission('finance.journal.post'),
  };
  const crud = useCrudResource<RecurringPosting, RecurringPostingPayload>(
    'recurring-postings', recurringPostingsApi, { label: (r) => r.code },
  );

  const [form, setForm] = useState(emptyForm);
  const [lines, setLines] = useState<DraftLine[]>([blankLine(), blankLine()]);
  const [note, setNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts-postable', activeCompanyId],
    queryFn: () => accountsApi.getAll({ take: 2000, isActive: true, isTitle: false }),
    enabled: !!activeCompanyId && show,
  });
  // Recurring lines carry no business partner, so control accounts (A/R, A/P)
  // could never post from here; the backend refuses them too.
  const pickable = useMemo(() => accounts.filter((a) => !a.isControl), [accounts]);

  const dueQuery = useQuery({
    queryKey: ['recurring-postings', 'due', activeCompanyId],
    queryFn: () => recurringPostingsApi.due(),
    enabled: !!activeCompanyId && show,
  });
  const due = dueQuery.data ?? [];

  const selected = crud.selected;
  const historyQuery = useQuery({
    queryKey: ['recurring-postings', 'entries', selected?.id],
    queryFn: () => recurringPostingsApi.entries(selected!.id),
    enabled: !!selected && crud.mode === 'view' && show,
  });

  useEffect(() => {
    if (crud.mode === 'new') {
      setForm({ ...emptyForm, nextExecution: today() });
      setLines([blankLine(), blankLine()]);
    } else if (crud.mode === 'edit' && crud.selected) {
      const r = crud.selected;
      setForm({
        code: r.code, description: r.description, isActive: r.isActive,
        frequency: r.frequency,
        nextExecution: day(r.nextExecution),
        hasValidUntil: !!r.validUntil, validUntil: day(r.validUntil),
        maxExecutions: r.maxExecutions ? String(r.maxExecutions) : '',
      });
      setLines(r.lines.map((l) => ({
        key: Math.random().toString(36).slice(2),
        accountId: l.accountId,
        description: l.description ?? '',
        debit: num(l.debit) ? String(num(l.debit)) : '',
        credit: num(l.credit) ? String(num(l.credit)) : '',
      })));
    }
  }, [crud.mode, crud.selected]);

  useEffect(() => { if (crud.mode !== 'view') setNote(''); }, [crud.mode]);

  const totals = useMemo(() => {
    const debit = round2(lines.reduce((s, l) => s + num(l.debit), 0));
    const credit = round2(lines.reduce((s, l) => s + num(l.credit), 0));
    return { debit, credit, balanced: debit === credit && debit > 0 };
  }, [lines]);

  const setLine = (key: string, patch: Partial<DraftLine>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  /** Refreshes everything an execution, skip or save can change. */
  const refreshAll = () => {
    void qc.invalidateQueries({ queryKey: ['recurring-postings'] });
    void qc.invalidateQueries({ queryKey: ['journal-entries'] });
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.description.trim()) {
      crud.setError('A recurring posting needs a code and a description.');
      return;
    }
    if (!form.nextExecution) { crud.setError('Enter the Next Execution date.'); return; }
    if (form.hasValidUntil && !form.validUntil) { crud.setError('Enter the Valid Until date, or untick it.'); return; }
    if (form.hasValidUntil && form.validUntil < form.nextExecution) {
      crud.setError('Valid Until cannot be before Next Execution.'); return;
    }
    const max = form.maxExecutions.trim() ? Number(form.maxExecutions) : null;
    if (max !== null && !(Number.isInteger(max) && max >= 1)) {
      crud.setError('Max Executions must be a whole number of 1 or more, or left empty.'); return;
    }
    const filled = lines.filter((l) => l.accountId || num(l.debit) || num(l.credit));
    if (filled.length < 2) { crud.setError('A recurring posting needs at least two lines.'); return; }
    for (const [i, l] of filled.entries()) {
      if (!l.accountId) { crud.setError(`Line ${i + 1}: choose a G/L account.`); return; }
      if (num(l.debit) > 0 && num(l.credit) > 0) {
        crud.setError(`Line ${i + 1}: enter either a debit or a credit, not both.`); return;
      }
      if (!(num(l.debit) > 0) && !(num(l.credit) > 0)) {
        crud.setError(`Line ${i + 1}: enter a debit or a credit above 0.`); return;
      }
    }
    if (!totals.balanced) {
      crud.setError(`Debits (${money(totals.debit)}) must equal credits (${money(totals.credit)}).`);
      return;
    }
    crud.save({
      code: form.code.trim(),
      description: form.description.trim(),
      frequency: form.frequency,
      nextExecution: form.nextExecution,
      validUntil: form.hasValidUntil ? form.validUntil : null,
      maxExecutions: max,
      isActive: form.isActive,
      lines: filled.map((l, i) => ({
        accountId: l.accountId,
        description: l.description.trim() || undefined,
        debit: round2(num(l.debit)),
        credit: round2(num(l.credit)),
        ordering: i,
      })),
    });
    void qc.invalidateQueries({ queryKey: ['recurring-postings', 'due'] });
  };

  // Deactivating is how a used posting is retired — the backend refuses to
  // delete one that has posted entries. Only the flag is sent.
  const toggleActive = (r: RecurringPosting) => {
    setNote('');
    recurringPostingsApi.update(r.id, { isActive: !r.isActive })
      .then((row) => {
        refreshAll();
        crud.select(row);
        setNote(`${row.code} ${row.isActive ? 'activated' : 'deactivated'}.`);
      })
      .catch((e) => crud.setError(errText(e, 'Could not change the recurring posting.')));
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Recurring Postings"
      icon={<CalendarClock className="w-3.5 h-3.5 text-gray-600" />}
      accent="#e8a01c"
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={900}
      minHeight={560}
      toolbar={
        <>
          <CrudToolbar
            onNew={can.create ? crud.openNew : () => crud.setError('You do not have permission to add recurring postings (financials.recurring_posting.create).')}
            onEdit={() => selected && crud.openEdit(selected)}
            onDelete={() => crud.remove()}
            onRefresh={() => { void crud.refetch(); void dueQuery.refetch(); }}
            canEdit={!!selected && can.update}
            canDelete={!!selected && can.remove}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <ToolBtn onClick={() => setShowConfirm(true)} title="Confirmation of Recurring Transactions">
            <ListChecks className="w-3 h-3" /> Confirmation List
            {due.length > 0 && (
              <span className="ml-1 px-1 rounded-[2px] bg-[#e8a01c] text-white text-[9px] font-bold">{due.length}</span>
            )}
          </ToolBtn>
          <StatusNote error={crud.error} status={crud.status || note} />
        </>
      }
      footer={
        <>
          <span>{crud.rows.length} recurring posting{crud.rows.length === 1 ? '' : 's'} · {due.length} due</span>
          <span>Recurring Postings</span>
        </>
      }
    >
      <div className="relative flex flex-1 min-h-0">
        {/* Posting list */}
        <div className="w-[250px] shrink-0 border-r border-[#d4d0c8] bg-white overflow-auto custom-scrollbar">
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No recurring postings yet. Click New."
          />
          {crud.rows.map((r) => (
            <div
              key={r.id}
              onClick={() => crud.select(r)}
              onDoubleClick={() => can.update && crud.openEdit(r)}
              className={cn(
                'px-2 py-1.5 border-b border-[#f0f0f0] cursor-default',
                selected?.id === r.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/60',
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10.5px] font-medium">{r.code}</span>
                {!r.isActive && <span className="text-[8.5px] px-1 rounded-[1px] bg-gray-100 text-gray-500">INACTIVE</span>}
                {isDue(r) && <span className="text-[8.5px] px-1 rounded-[1px] bg-[#fde68a] text-[#92400e] font-bold">DUE</span>}
              </div>
              <div className="text-[9.5px] text-gray-600 truncate">{r.description}</div>
              <div className="text-[9.5px] text-gray-400">
                {frequencyLabel(r.frequency)} · {r.isActive ? `next ${day(r.nextExecution)}` : 'finished'} · {money(amountOf(r))}
              </div>
            </div>
          ))}
        </div>

        {/* Viewer / editor */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#f0f0f0]">
          {!isForm && !selected && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400">
              Select a recurring posting, or click New to create one.
            </div>
          )}

          {!isForm && selected && (
            <div className="flex-1 overflow-auto p-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[13px] font-bold font-mono">{selected.code}</span>
                <span className="text-[11px]">{selected.description}</span>
                <span className={cn('text-[9px] px-1.5 py-0.5 rounded-[1px]', selected.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>
                  {selected.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
                {isDue(selected) && <span className="text-[9px] px-1.5 py-0.5 rounded-[1px] bg-[#fde68a] text-[#92400e] font-bold">DUE</span>}
              </div>

              <div className="grid grid-cols-3 gap-x-6 gap-y-0.5 text-[10.5px] mb-2 bg-white border border-[#ccc] p-2">
                <div><span className="text-gray-500">Frequency:</span> {frequencyLabel(selected.frequency)}</div>
                <div><span className="text-gray-500">Next Execution:</span> {selected.isActive ? day(selected.nextExecution) : '—'}</div>
                <div><span className="text-gray-500">Valid Until:</span> {day(selected.validUntil) || 'no end date'}</div>
                <div><span className="text-gray-500">Instances run:</span> {selected.executionCount}{selected.maxExecutions ? ` of ${selected.maxExecutions}` : ''}</div>
                <div><span className="text-gray-500">Last executed:</span> {day(selected.lastExecutedAt) || 'never'}</div>
                <div><span className="text-gray-500">Amount:</span> <span className="font-mono">{money(amountOf(selected))}</span></div>
              </div>

              <LinesTable posting={selected} />

              <div className="flex gap-2 mt-3">
                {can.update && <YellowBtn onClick={() => crud.openEdit(selected)}>Edit</YellowBtn>}
                {can.update && (
                  <GreyBtn onClick={() => toggleActive(selected)} disabled={crud.isBusy}>
                    {selected.isActive ? 'Deactivate' : 'Activate'}
                  </GreyBtn>
                )}
                {isDue(selected) && can.execute && (
                  <GreyBtn onClick={() => setShowConfirm(true)}>Execute from Confirmation List…</GreyBtn>
                )}
              </div>

              {/* What this posting has put in the ledger. */}
              <div className="mt-4 border-t border-[#ccc] pt-2">
                <div className="text-[11px] font-bold text-[#333] mb-1">Posted journal entries</div>
                {historyQuery.isLoading && <div className="text-[10px] text-gray-500">Loading…</div>}
                {historyQuery.data && historyQuery.data.length === 0 && (
                  <div className="text-[10px] text-gray-500">Nothing posted yet.</div>
                )}
                {historyQuery.data && historyQuery.data.length > 0 && (
                  <table className="w-full border-collapse text-[10.5px] bg-white border border-[#ccc]">
                    <thead>
                      <tr className="bg-[#e4e4e4] border-b border-[#ccc]">
                        <th className="text-left p-1 border-r border-[#ccc]">Entry</th>
                        <th className="text-left p-1 border-r border-[#ccc]">Posting Date</th>
                        <th className="text-left p-1 border-r border-[#ccc]">Reference</th>
                        <th className="text-right p-1 border-r border-[#ccc]">Amount</th>
                        <th className="text-left p-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyQuery.data.map((e, i) => (
                        <tr key={e.id} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                          <td className="p-1 border-r border-[#eee] font-mono">{e.number}</td>
                          <td className="p-1 border-r border-[#eee]">{day(e.date)}</td>
                          <td className="p-1 border-r border-[#eee]">{e.reference ?? ''}</td>
                          <td className="p-1 border-r border-[#eee] text-right font-mono">{money(num(e.totalDebit))}</td>
                          <td className="p-1">{e.status}{e.reversal ? ` (by ${e.reversal.number})` : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="text-[9.5px] text-gray-500 mt-1">
                  To correct a posted instance, reverse its entry in Journal Entry.
                </div>
              </div>
            </div>
          )}

          {isForm && (
            <>
              <div className="p-2 shrink-0 border-b border-[#ccc] bg-white">
                <div className="text-[11px] font-bold text-[#333] mb-1">
                  {crud.mode === 'new' ? 'New Recurring Posting' : `Edit — ${selected?.code}`}
                  {crud.mode === 'edit' && selected && (
                    <span className="font-normal text-gray-500"> · {selected.executionCount} instance(s) already run; changes apply to future runs</span>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_2fr] gap-x-4">
                  <FieldRow label="Code" labelWidth="100px" required>
                    <ClassicInput value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full bg-[#ffed99]" autoFocus />
                  </FieldRow>
                  <FieldRow label="Description" labelWidth="80px" required>
                    <ClassicInput value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full" />
                  </FieldRow>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-white min-h-0">
                <table className="w-full border-collapse text-[10.5px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#e4e4e4] border-b border-[#ccc]">
                      <th className="w-7 p-1 border-r border-[#ccc]">#</th>
                      <th className="text-left p-1 border-r border-[#ccc] w-[260px]">G/L Account</th>
                      <th className="text-left p-1 border-r border-[#ccc]">Details</th>
                      <th className="text-right p-1 border-r border-[#ccc] w-[110px]">Debit</th>
                      <th className="text-right p-1 border-r border-[#ccc] w-[110px]">Credit</th>
                      <th className="w-7 p-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={l.key} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                        <td className="text-center text-gray-400 border-r border-[#eee]">{i + 1}</td>
                        <td className="border-r border-[#eee] p-0.5">
                          <ClassicSel value={l.accountId} onChange={(e) => setLine(l.key, { accountId: e.target.value })} className="w-full">
                            <option value="">— select account —</option>
                            {pickable.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                          </ClassicSel>
                        </td>
                        <td className="border-r border-[#eee] p-0.5">
                          <ClassicInput value={l.description} onChange={(e) => setLine(l.key, { description: e.target.value })} className="w-full" />
                        </td>
                        <td className="border-r border-[#eee] p-0.5">
                          <ClassicInput
                            type="number" step="0.01" min="0"
                            value={l.debit}
                            // A line is a debit or a credit; typing one side clears the other.
                            onChange={(e) => setLine(l.key, { debit: e.target.value, credit: '' })}
                            className="w-full text-right font-mono"
                          />
                        </td>
                        <td className="border-r border-[#eee] p-0.5">
                          <ClassicInput
                            type="number" step="0.01" min="0"
                            value={l.credit}
                            onChange={(e) => setLine(l.key, { credit: e.target.value, debit: '' })}
                            className="w-full text-right font-mono"
                          />
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => setLines((p) => p.filter((x) => x.key !== l.key))}
                            disabled={lines.length <= 2}
                            className="text-gray-400 hover:text-red-600 disabled:opacity-30"
                            title={lines.length <= 2 ? 'A posting needs at least a debit and a credit line' : 'Remove line'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="sticky bottom-0">
                    <tr className="bg-[#f0f0f0] border-t border-[#ccc] font-bold">
                      <td colSpan={3} className="p-1 text-right">Total</td>
                      <td className="p-1 text-right font-mono">{money(totals.debit)}</td>
                      <td className="p-1 text-right font-mono">{money(totals.credit)}</td>
                      <td />
                    </tr>
                    <tr className={cn('border-t', totals.balanced ? 'bg-green-50' : 'bg-red-50')}>
                      <td colSpan={3} className="p-1 text-right text-[10px]">To Balance</td>
                      <td colSpan={3} className="p-1 text-[10px]">
                        {totals.balanced
                          ? <span className="text-green-800">Balanced</span>
                          : <span className="text-red-700 font-mono">{money(Math.abs(totals.debit - totals.credit))} {totals.debit > totals.credit ? 'more credit needed' : totals.credit > totals.debit ? 'more debit needed' : '— enter amounts'}</span>}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div className="p-2">
                  <ToolBtn onClick={() => setLines((p) => [...p, blankLine()])}>
                    <Plus className="w-3 h-3" /> Add line
                  </ToolBtn>
                </div>
              </div>

              {/* Schedule */}
              <div className="p-2 shrink-0 border-t border-[#ccc] bg-[#f0f0f0] grid grid-cols-2 gap-x-6">
                <FieldRow label="Frequency" labelWidth="100px" required>
                  <ClassicSel value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as Frequency }))} className="w-40">
                    {FREQUENCIES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                  </ClassicSel>
                </FieldRow>
                <FieldRow label="Valid Until" labelWidth="100px">
                  <input type="checkbox" checked={form.hasValidUntil} onChange={(e) => setForm((f) => ({ ...f, hasValidUntil: e.target.checked }))} />
                  <ClassicInput
                    type="date" value={form.validUntil} disabled={!form.hasValidUntil}
                    onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                    className="w-36 ml-2"
                  />
                </FieldRow>
                <FieldRow label="Next Execution" labelWidth="100px" required>
                  <ClassicInput type="date" value={form.nextExecution} onChange={(e) => setForm((f) => ({ ...f, nextExecution: e.target.value }))} className="w-40" />
                </FieldRow>
                <FieldRow label="Max Executions" labelWidth="100px">
                  <ClassicInput
                    type="number" min="1" step="1" placeholder="no limit"
                    value={form.maxExecutions}
                    onChange={(e) => setForm((f) => ({ ...f, maxExecutions: e.target.value }))}
                    className="w-24"
                  />
                </FieldRow>
                <FieldRow label="Active" labelWidth="100px">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                </FieldRow>
              </div>

              <div className="h-10 px-3 bg-[#f0f0f0] border-t border-[#ccc] flex items-center gap-2 shrink-0">
                <YellowBtn onClick={handleSave} disabled={crud.isBusy}>
                  {crud.isBusy ? 'Saving…' : crud.mode === 'new' ? 'Add' : 'Update'}
                </YellowBtn>
                <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
              </div>
            </>
          )}
        </div>

        {showConfirm && (
          <ConfirmationList
            due={due}
            isLoading={dueQuery.isLoading}
            canExecute={can.execute}
            onClose={() => setShowConfirm(false)}
            onChanged={() => {
              refreshAll();
              // Keep the viewer in step with the schedule that just moved on.
              if (selected) {
                recurringPostingsApi.getOne(selected.id).then(crud.select).catch(() => undefined);
              }
            }}
          />
        )}
      </div>
    </ClassicWindow>
  );
};

const LinesTable: React.FC<{ posting: RecurringPosting }> = ({ posting }) => (
  <table className="w-full border-collapse text-[10.5px] bg-white border border-[#ccc]">
    <thead>
      <tr className="bg-[#e4e4e4] border-b border-[#ccc]">
        <th className="text-left p-1 border-r border-[#ccc]">G/L Account</th>
        <th className="text-left p-1 border-r border-[#ccc]">Details</th>
        <th className="text-right p-1 border-r border-[#ccc] w-[110px]">Debit</th>
        <th className="text-right p-1 w-[110px]">Credit</th>
      </tr>
    </thead>
    <tbody>
      {posting.lines.map((l, i) => (
        <tr key={l.id ?? i} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
          <td className="p-1 border-r border-[#eee] font-mono">{l.account ? `${l.account.code} ${l.account.name}` : '—'}</td>
          <td className="p-1 border-r border-[#eee]">{l.description ?? ''}</td>
          <td className="p-1 border-r border-[#eee] text-right font-mono">{num(l.debit) ? money(num(l.debit)) : ''}</td>
          <td className="p-1 text-right font-mono">{num(l.credit) ? money(num(l.credit)) : ''}</td>
        </tr>
      ))}
      <tr className="bg-[#f0f0f0] font-bold border-t border-[#ccc]">
        <td className="p-1" colSpan={2}>Total</td>
        <td className="p-1 text-right font-mono">{money(amountOf(posting))}</td>
        <td className="p-1 text-right font-mono">{money(posting.lines.reduce((s, l) => s + num(l.credit), 0))}</td>
      </tr>
    </tbody>
  </table>
);

/**
 * "Confirmation of Recurring Transactions": every active posting whose next
 * execution is today or earlier. Ticked rows are executed one by one; each is
 * its own all-or-nothing backend call, so one failure (say, a closed period)
 * leaves the others posted and is reported against its row. A posting that is
 * several runs behind comes back with its next instance until it is caught up.
 */
const ConfirmationList: React.FC<{
  due: RecurringPosting[];
  isLoading: boolean;
  canExecute: boolean;
  onClose: () => void;
  onChanged: () => void;
}> = ({ due, isLoading, canExecute, onClose, onChanged }) => {
  // Keyed by posting + instance, so a caught-up row starts fresh.
  const rowKey = (r: RecurringPosting) => `${r.id}:${r.executionCount}`;
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const [dates, setDates] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<RunResult[]>([]);

  const chosen = due.filter((r) => ticked[rowKey(r)]);
  const allTicked = due.length > 0 && chosen.length === due.length;

  const run = async (mode: 'execute' | 'skip') => {
    if (!chosen.length) return;
    if (mode === 'skip' && !window.confirm(
      `Skip the next instance of ${chosen.length} posting(s)? Nothing is posted; the schedule moves on and the skipped instance counts toward Max Executions.`,
    )) return;
    setBusy(true);
    const log: RunResult[] = [];
    for (const r of chosen) {
      const instance = r.executionCount + 1;
      try {
        if (mode === 'execute') {
          const res = await recurringPostingsApi.execute(r.id, dates[rowKey(r)] || day(r.nextExecution));
          log.push({ code: r.code, instance, ok: true, text: `posted as ${res.journalEntry.number} on ${day(res.journalEntry.date)}` });
        } else {
          await recurringPostingsApi.advance(r.id);
          log.push({ code: r.code, instance, ok: true, text: 'skipped' });
        }
      } catch (e) {
        log.push({ code: r.code, instance, ok: false, text: errText(e, 'failed') });
      }
    }
    setResults(log);
    setTicked({});
    setBusy(false);
    onChanged();
  };

  return (
    <div className="absolute inset-0 z-20 bg-black/20 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-[#f0f0f0] border border-[#999] shadow-lg w-full max-w-[860px] max-h-full flex flex-col">
        <div className="h-7 bg-gradient-to-b from-[#fdfdfd] to-[#dcdcdc] border-b border-[#999] flex items-center justify-between px-2 shrink-0">
          <span className="text-[12px] font-bold text-[#444]">Confirmation of Recurring Transactions</span>
          <button onClick={onClose} className="w-6 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-1 bg-[#e8a01c] shrink-0" />

        <div className="flex-1 overflow-auto bg-white m-2 border border-[#ccc] min-h-[140px]">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0">
              <tr className="bg-[#e4e4e4] border-b border-[#ccc]">
                <th className="w-7 p-1 border-r border-[#ccc]">
                  <input
                    type="checkbox" checked={allTicked} disabled={!due.length || busy}
                    onChange={(e) => setTicked(e.target.checked ? Object.fromEntries(due.map((r) => [rowKey(r), true])) : {})}
                  />
                </th>
                <th className="text-left p-1 border-r border-[#ccc]">Code</th>
                <th className="text-left p-1 border-r border-[#ccc]">Description</th>
                <th className="text-right p-1 border-r border-[#ccc]">Instance</th>
                <th className="text-left p-1 border-r border-[#ccc]">Due Date</th>
                <th className="text-left p-1 border-r border-[#ccc]">Posting Date</th>
                <th className="text-right p-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="p-2 text-center text-gray-500">Loading…</td></tr>}
              {!isLoading && due.length === 0 && (
                <tr><td colSpan={7} className="p-3 text-center text-gray-500">Nothing is due. Every recurring posting is up to date.</td></tr>
              )}
              {due.map((r, i) => {
                const k = rowKey(r);
                return (
                  <tr key={k} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                    <td className="text-center border-r border-[#eee]">
                      <input type="checkbox" checked={!!ticked[k]} disabled={busy} onChange={(e) => setTicked((t) => ({ ...t, [k]: e.target.checked }))} />
                    </td>
                    <td className="p-1 border-r border-[#eee] font-mono">{r.code}</td>
                    <td className="p-1 border-r border-[#eee]">{r.description}</td>
                    <td className="p-1 border-r border-[#eee] text-right">
                      #{r.executionCount + 1}{r.maxExecutions ? ` of ${r.maxExecutions}` : ''}
                    </td>
                    <td className="p-1 border-r border-[#eee]">{day(r.nextExecution)}</td>
                    <td className="p-0.5 border-r border-[#eee]">
                      <ClassicInput
                        type="date" disabled={busy}
                        value={dates[k] ?? day(r.nextExecution)}
                        onChange={(e) => setDates((d) => ({ ...d, [k]: e.target.value }))}
                        className="w-32"
                      />
                    </td>
                    <td className="p-1 text-right font-mono">{money(amountOf(r))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {results.length > 0 && (
          <div className="mx-2 mb-2 border border-[#ccc] bg-white p-1.5 text-[10.5px] max-h-28 overflow-auto">
            {results.map((r, i) => (
              <div key={i} className={r.ok ? 'text-green-800' : 'text-red-700'}>
                {r.code} #{r.instance}: {r.text}
              </div>
            ))}
          </div>
        )}

        <div className="h-10 px-3 border-t border-[#ccc] flex items-center gap-2 shrink-0">
          <YellowBtn onClick={() => void run('execute')} disabled={!canExecute || busy || !chosen.length}>
            {busy ? 'Working…' : `Execute${chosen.length ? ` (${chosen.length})` : ''}`}
          </YellowBtn>
          <GreyBtn onClick={() => void run('skip')} disabled={!canExecute || busy || !chosen.length}>Skip</GreyBtn>
          <GreyBtn onClick={onClose} disabled={busy}>Close</GreyBtn>
          <span className="text-[10px] text-gray-500 ml-2">
            {canExecute
              ? 'Each ticked posting is posted as a journal entry on its posting date, and its schedule moves on.'
              : 'Executing needs financials.recurring_posting.update and finance.journal.post.'}
          </span>
        </div>
      </div>
    </div>
  );
};
