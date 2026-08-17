import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Trash2, Undo2, Search } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  journalEntriesApi,
  accountsApi,
  postingPeriodsApi,
  type JournalEntry,
  type JournalStatus,
} from '../../../api/financials.api';
import { businessPartnersApi } from '../../../api/crm.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

interface DraftLine {
  key: string;
  accountId: string;
  bpId: string;
  description: string;
  debit: string;
  credit: string;
}

const blankLine = (): DraftLine => ({
  key: Math.random().toString(36).slice(2),
  accountId: '', bpId: '', description: '', debit: '', credit: '',
});

const today = () => new Date().toISOString().slice(0, 10);

const num = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

const money = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_STYLE: Record<JournalStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  POSTED: 'bg-green-100 text-green-800',
  REVERSED: 'bg-amber-100 text-amber-800',
};

export const JournalEntryWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const companyId = user?.companyId ?? null;

  const [mode, setMode] = useState<'browse' | 'new'>('browse');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState<'' | JournalStatus>('');

  const [header, setHeader] = useState({
    date: today(), docDate: today(), dueDate: '',
    description: '', reference: '', ref1: '', ref2: '', ref3: '',
    isAdjustment: false,
  });
  const [lines, setLines] = useState<DraftLine[]>([blankLine(), blankLine()]);

  const listKey = ['journal-entries', companyId, filterStatus];

  const { data: entries = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: listKey,
    queryFn: () => journalEntriesApi.getAll(filterStatus ? { status: filterStatus } : {}),
    enabled: !!companyId,
  });

  // Only postable accounts are offered — Title accounts would be rejected server
  // side, so they never appear in the picker.
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts-postable', companyId],
    queryFn: () => accountsApi.getAll({ take: 2000, isActive: true, isTitle: false }),
    enabled: !!companyId,
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['bp-lookup', companyId],
    queryFn: () => businessPartnersApi.lookup({ take: 500 }),
    enabled: !!companyId,
  });

  const { data: detail } = useQuery({
    queryKey: ['journal-entry', selectedId],
    queryFn: () => journalEntriesApi.getOne(selectedId as string),
    enabled: !!selectedId && mode === 'browse',
  });

  const accountById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  // Period status drives whether the Add button is even offered for this date.
  const { data: period, error: periodError } = useQuery({
    queryKey: ['period-resolve', companyId, header.date],
    queryFn: () => postingPeriodsApi.resolve(header.date, 'general'),
    enabled: !!companyId && mode === 'new' && !!header.date,
    retry: false,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['journal-entries'] });
    void qc.invalidateQueries({ queryKey: ['account-balances'] });
  };

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that entry.');
    setStatus('');
  };

  const createMut = useMutation({
    mutationFn: (post: boolean) =>
      journalEntriesApi.create({
        date: header.date,
        docDate: header.docDate || undefined,
        dueDate: header.dueDate || undefined,
        description: header.description || undefined,
        reference: header.reference || undefined,
        ref1: header.ref1 || undefined,
        ref2: header.ref2 || undefined,
        ref3: header.ref3 || undefined,
        isAdjustment: header.isAdjustment,
        post,
        lines: lines
          .filter((l) => l.accountId && (num(l.debit) > 0 || num(l.credit) > 0))
          .map((l, i) => ({
            accountId: l.accountId,
            bpId: l.bpId || undefined,
            description: l.description || undefined,
            debit: num(l.debit),
            credit: num(l.credit),
            ordering: i,
          })),
      }),
    onSuccess: (entry) => {
      invalidate();
      setSelectedId(entry.id);
      setMode('browse');
      setError('');
      setStatus(`Entry ${entry.number} ${entry.status === 'POSTED' ? 'posted' : 'saved as draft'}.`);
      resetForm();
    },
    onError: onErr,
  });

  const postMut = useMutation({
    mutationFn: (id: string) => journalEntriesApi.post(id),
    onSuccess: (e) => {
      invalidate();
      void qc.invalidateQueries({ queryKey: ['journal-entry', e.id] });
      setError(''); setStatus(`Entry ${e.number} posted.`);
    },
    onError: onErr,
  });

  const reverseMut = useMutation({
    mutationFn: (id: string) => journalEntriesApi.reverse(id),
    onSuccess: (e) => {
      invalidate();
      setSelectedId(e.id);
      setError(''); setStatus(`Reversal ${e.number} posted.`);
    },
    onError: onErr,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => journalEntriesApi.remove(id),
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
      setError(''); setStatus('Draft deleted.');
    },
    onError: onErr,
  });

  const isBusy =
    createMut.isPending || postMut.isPending || reverseMut.isPending || deleteMut.isPending;

  const resetForm = () => {
    setHeader({
      date: today(), docDate: today(), dueDate: '',
      description: '', reference: '', ref1: '', ref2: '', ref3: '',
      isAdjustment: false,
    });
    setLines([blankLine(), blankLine()]);
  };

  useEffect(() => {
    if (mode === 'new') { setError(''); setStatus(''); }
  }, [mode]);

  // Totals are recomputed on every keystroke so the balance indicator is the
  // same check the backend will apply on save.
  const totals = useMemo(() => {
    const debit = lines.reduce((s, l) => s + num(l.debit), 0);
    const credit = lines.reduce((s, l) => s + num(l.credit), 0);
    return { debit, credit, diff: debit - credit, balanced: Math.abs(debit - credit) < 0.005 };
  }, [lines]);

  const filled = lines.filter((l) => l.accountId && (num(l.debit) > 0 || num(l.credit) > 0));
  const canPost = totals.balanced && totals.debit > 0 && filled.length >= 2;

  const setLine = (key: string, patch: Partial<DraftLine>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const validateBeforeSave = (): boolean => {
    if (filled.length < 2) {
      setError('A journal entry needs at least two lines with an account and an amount.');
      return false;
    }
    for (const [i, l] of filled.entries()) {
      if (num(l.debit) > 0 && num(l.credit) > 0) {
        setError(`Line ${i + 1}: put an amount in either debit or credit, not both.`);
        return false;
      }
      const acc = accountById.get(l.accountId);
      if (acc?.isControl && !l.bpId) {
        setError(`Line ${i + 1}: ${acc.code} is a control account and needs a business partner.`);
        return false;
      }
    }
    return true;
  };

  const save = (post: boolean) => {
    setError('');
    if (!validateBeforeSave()) return;
    if (post && !totals.balanced) {
      setError(
        `Out of balance by ${money(Math.abs(totals.diff))}. Debits and credits must match before posting.`,
      );
      return;
    }
    createMut.mutate(post);
  };

  const selected = detail ?? null;

  return (
    <ClassicWindow
      title="Journal Entry"
      icon={<BookOpen className="w-3.5 h-3.5 text-gray-600" />}
      accent="#e8a01c"
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={980}
      minHeight={560}
      toolbar={
        <>
          <ToolBtn onClick={() => { setMode('new'); setSelectedId(null); resetForm(); }} disabled={isBusy}>
            <Plus className="w-3 h-3" /> New
          </ToolBtn>
          <ToolBtn
            onClick={() => selected && postMut.mutate(selected.id)}
            disabled={!selected || selected.status !== 'DRAFT' || isBusy}
          >
            Post
          </ToolBtn>
          <ToolBtn
            onClick={() => {
              if (!selected) return;
              if (!window.confirm(
                `Reverse ${selected.number}? This posts a mirror entry; the original stays in the ledger.`,
              )) return;
              reverseMut.mutate(selected.id);
            }}
            disabled={!selected || selected.status !== 'POSTED' || isBusy}
          >
            <Undo2 className="w-3 h-3" /> Reverse
          </ToolBtn>
          <ToolBtn
            danger
            onClick={() => {
              if (!selected) return;
              if (!window.confirm(`Delete draft ${selected.number}?`)) return;
              deleteMut.mutate(selected.id);
            }}
            disabled={!selected || selected.status !== 'DRAFT' || isBusy}
          >
            <Trash2 className="w-3 h-3" /> Delete
          </ToolBtn>
          <ClassicSel
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as '' | JournalStatus)}
            className="ml-2 w-28"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="POSTED">Posted</option>
            <option value="REVERSED">Reversed</option>
          </ClassicSel>
          <ToolBtn onClick={() => refetch()} title="Refresh">
            <Search className={cn('w-3 h-3', isFetching && 'animate-pulse')} />
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>{entries.length} entr{entries.length === 1 ? 'y' : 'ies'}</span>
          <span>Journal Entry</span>
        </>
      }
    >
      <div className="flex flex-1 min-h-0">
        {/* Entry list */}
        <div className="w-[240px] shrink-0 border-r border-[#d4d0c8] bg-white overflow-auto custom-scrollbar">
          <ListPlaceholder
            noCompany={!companyId}
            isLoading={isLoading}
            isEmpty={!isLoading && entries.length === 0}
            emptyText="No journal entries yet. Click New."
          />
          {entries.map((e) => (
            <div
              key={e.id}
              onClick={() => { setSelectedId(e.id); setMode('browse'); }}
              className={cn(
                'px-2 py-1.5 border-b border-[#f0f0f0] cursor-default',
                selectedId === e.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/60',
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10.5px] font-medium">{e.number}</span>
                <span className={cn('text-[8.5px] px-1 rounded-[1px]', STATUS_STYLE[e.status])}>
                  {e.status}
                </span>
              </div>
              <div className="text-[9.5px] text-gray-500">
                {new Date(e.date).toLocaleDateString()} · {money(Number(e.totalDebit))}
              </div>
              {e.description && (
                <div className="text-[9.5px] text-gray-600 truncate">{e.description}</div>
              )}
            </div>
          ))}
        </div>

        {/* Editor / viewer */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#f0f0f0]">
          {mode === 'browse' && !selected && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400">
              Select an entry, or click New to create one.
            </div>
          )}

          {mode === 'browse' && selected && (
            <div className="flex-1 overflow-auto p-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[13px] font-bold">{selected.number}</span>
                <span className={cn('text-[9px] px-1.5 py-0.5 rounded-[1px]', STATUS_STYLE[selected.status])}>
                  {selected.status}
                </span>
                {selected.reversalOf && (
                  <span className="text-[9.5px] text-amber-700">
                    reversal of {selected.reversalOf.number}
                  </span>
                )}
                {selected.reversal && (
                  <span className="text-[9.5px] text-amber-700">
                    reversed by {selected.reversal.number}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-[10.5px] mb-3">
                <div><span className="text-gray-500">Posting Date</span><div>{new Date(selected.date).toLocaleDateString()}</div></div>
                <div><span className="text-gray-500">Period</span><div>{selected.period?.name ?? '—'}</div></div>
                <div><span className="text-gray-500">Currency</span><div>{selected.currency}</div></div>
                <div><span className="text-gray-500">Source</span><div>{selected.source ?? 'manual'}</div></div>
                <div className="col-span-2"><span className="text-gray-500">Remarks</span><div>{selected.description ?? '—'}</div></div>
                <div className="col-span-2"><span className="text-gray-500">Reference</span><div>{selected.reference ?? '—'}</div></div>
              </div>

              <table className="w-full border-collapse text-[10.5px] bg-white border border-[#ccc]">
                <thead>
                  <tr className="bg-[#e4e4e4] border-b border-[#ccc]">
                    <th className="text-left p-1 border-r border-[#ccc]">G/L Account</th>
                    <th className="text-left p-1 border-r border-[#ccc]">Business Partner</th>
                    <th className="text-left p-1 border-r border-[#ccc]">Details</th>
                    <th className="text-right p-1 border-r border-[#ccc]">Debit</th>
                    <th className="text-right p-1">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.lines.map((l, i) => (
                    <tr key={l.id ?? i} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                      <td className="p-1 border-r border-[#eee] font-mono">
                        {l.account ? `${l.account.code} ${l.account.name}` : '—'}
                      </td>
                      <td className="p-1 border-r border-[#eee]">{l.bp?.cardName ?? ''}</td>
                      <td className="p-1 border-r border-[#eee]">{l.description ?? ''}</td>
                      <td className="p-1 border-r border-[#eee] text-right font-mono">
                        {Number(l.debit) ? money(Number(l.debit)) : ''}
                      </td>
                      <td className="p-1 text-right font-mono">
                        {Number(l.credit) ? money(Number(l.credit)) : ''}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#f0f0f0] font-bold border-t border-[#ccc]">
                    <td className="p-1" colSpan={3}>Totals</td>
                    <td className="p-1 text-right font-mono">{money(Number(selected.totalDebit))}</td>
                    <td className="p-1 text-right font-mono">{money(Number(selected.totalCredit))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {mode === 'new' && (
            <>
              <div className="p-2 space-y-1 shrink-0 border-b border-[#ccc]">
                <div className="flex items-center gap-3 flex-wrap text-[11px]">
                  <label className="flex items-center gap-1">
                    <span className="text-[#333]">Posting Date</span>
                    <ClassicInput
                      type="date"
                      value={header.date}
                      onChange={(e) => setHeader((h) => ({ ...h, date: e.target.value }))}
                      className="w-32"
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="text-[#333]">Doc. Date</span>
                    <ClassicInput
                      type="date"
                      value={header.docDate}
                      onChange={(e) => setHeader((h) => ({ ...h, docDate: e.target.value }))}
                      className="w-32"
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="text-[#333]">Due Date</span>
                    <ClassicInput
                      type="date"
                      value={header.dueDate}
                      onChange={(e) => setHeader((h) => ({ ...h, dueDate: e.target.value }))}
                      className="w-32"
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={header.isAdjustment}
                      onChange={(e) => setHeader((h) => ({ ...h, isAdjustment: e.target.checked }))}
                    />
                    <span className="text-[#333]">Adj. Trans.</span>
                  </label>
                  {/* Surfaced here so a closed period is obvious before typing lines. */}
                  {period && (
                    <span className="text-[10px] text-green-700">
                      Period {period.name} · {period.generalStatus}
                    </span>
                  )}
                  {periodError && (
                    <span className="text-[10px] text-red-700">
                      {periodError instanceof Error ? periodError.message : 'No open period for this date'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap text-[11px]">
                  <label className="flex items-center gap-1 flex-1 min-w-[240px]">
                    <span className="text-[#333]">Remarks</span>
                    <ClassicInput
                      value={header.description}
                      onChange={(e) => setHeader((h) => ({ ...h, description: e.target.value }))}
                      className="flex-1"
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="text-[#333]">Ref.</span>
                    <ClassicInput
                      value={header.reference}
                      onChange={(e) => setHeader((h) => ({ ...h, reference: e.target.value }))}
                      className="w-28"
                    />
                  </label>
                </div>
              </div>

              {/* Lines grid */}
              <div className="flex-1 overflow-auto bg-white min-h-0">
                <table className="w-full border-collapse text-[10.5px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#e4e4e4] border-b border-[#ccc]">
                      <th className="w-7 p-1 border-r border-[#ccc]">#</th>
                      <th className="text-left p-1 border-r border-[#ccc] w-[230px]">G/L Account</th>
                      <th className="text-left p-1 border-r border-[#ccc] w-[160px]">Business Partner</th>
                      <th className="text-left p-1 border-r border-[#ccc]">Details</th>
                      <th className="text-right p-1 border-r border-[#ccc] w-[110px]">Debit</th>
                      <th className="text-right p-1 border-r border-[#ccc] w-[110px]">Credit</th>
                      <th className="w-7 p-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => {
                      const acc = accountById.get(l.accountId);
                      const needsBp = !!acc?.isControl && !l.bpId;
                      return (
                        <tr key={l.key} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                          <td className="text-center text-gray-400 border-r border-[#eee]">{i + 1}</td>
                          <td className="border-r border-[#eee] p-0.5">
                            <ClassicSel
                              value={l.accountId}
                              onChange={(e) => setLine(l.key, { accountId: e.target.value })}
                              className="w-full"
                            >
                              <option value="">— select account —</option>
                              {accounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                              ))}
                            </ClassicSel>
                          </td>
                          <td className="border-r border-[#eee] p-0.5">
                            <ClassicSel
                              value={l.bpId}
                              onChange={(e) => setLine(l.key, { bpId: e.target.value })}
                              className={cn('w-full', needsBp && 'border-red-500 bg-red-50')}
                              title={needsBp ? 'This control account requires a business partner' : undefined}
                            >
                              <option value="">—</option>
                              {partners.map((p) => (
                                <option key={p.id} value={p.id}>{p.cardCode} — {p.cardName}</option>
                              ))}
                            </ClassicSel>
                          </td>
                          <td className="border-r border-[#eee] p-0.5">
                            <ClassicInput
                              value={l.description}
                              onChange={(e) => setLine(l.key, { description: e.target.value })}
                              className="w-full"
                            />
                          </td>
                          <td className="border-r border-[#eee] p-0.5">
                            <ClassicInput
                              type="number" step="0.01" min="0"
                              value={l.debit}
                              // Debit and credit are mutually exclusive per line;
                              // typing in one clears the other rather than letting
                              // the server reject the row later.
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
                              title={lines.length <= 2 ? 'An entry needs at least two lines' : 'Remove line'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="sticky bottom-0">
                    <tr className="bg-[#f0f0f0] border-t border-[#ccc] font-bold">
                      <td colSpan={4} className="p-1 text-right">Totals</td>
                      <td className="p-1 text-right font-mono">{money(totals.debit)}</td>
                      <td className="p-1 text-right font-mono">{money(totals.credit)}</td>
                      <td />
                    </tr>
                    <tr className={cn('border-t', totals.balanced ? 'bg-green-50' : 'bg-red-50')}>
                      <td colSpan={7} className="p-1 text-center text-[10px]">
                        {totals.balanced
                          ? <span className="text-green-800">Balanced</span>
                          : <span className="text-red-700">
                              Out of balance by {money(Math.abs(totals.diff))} — debits and credits must match before posting
                            </span>}
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

              <div className="h-10 px-3 bg-[#f0f0f0] border-t border-[#ccc] flex items-center gap-2 shrink-0">
                <button
                  onClick={() => save(true)}
                  disabled={!canPost || isBusy}
                  className="px-4 py-0.5 text-[11px] font-bold border border-gray-600 rounded-[1px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={canPost ? 'Post to the ledger' : 'Entry must balance and have at least two lines'}
                >
                  {createMut.isPending ? 'Posting…' : 'Add & Post'}
                </button>
                <button
                  onClick={() => save(false)}
                  disabled={isBusy}
                  className="px-4 py-0.5 text-[11px] border border-gray-500 rounded-[1px] bg-[#e1e1e1] hover:bg-gray-100 disabled:opacity-40"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => { setMode('browse'); resetForm(); }}
                  className="px-4 py-0.5 text-[11px] border border-gray-500 rounded-[1px] bg-[#e1e1e1] hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
