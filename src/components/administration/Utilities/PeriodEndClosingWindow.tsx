import React, { useMemo, useState } from 'react';
import { CalendarCheck, History, Play, RefreshCw, Search } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  utilitiesApi,
  type PeriodEndClosingPreview,
  type PeriodEndClosingRun,
} from '../../../api/administration.api';
import { accountsApi, postingPeriodsApi } from '../../../api/financials.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
  /**
   * Opens the shared account-picker window. Accepted so the workspace can keep
   * passing it; the account selects below are populated directly, so the window
   * no longer needs a second screen to choose an account.
   */
  onOpenSelectionAccounts?: () => void;
}

const money = (v: string | number) =>
  Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Period-End Closing.
 *
 * Two steps on purpose. The preview is a read that posts nothing, so the
 * operator can see every account the closing touches and the net result before
 * committing. Execute recomputes that preview server-side and posts from the
 * fresh numbers — the client's copy is display only, because the ledger can move
 * between looking and clicking.
 */
export const PeriodEndClosingWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [fromPeriodId, setFromPeriodId] = useState('');
  const [toPeriodId, setToPeriodId] = useState('');
  const [retainedEarningsAccountId, setRetainedEarningsAccountId] = useState('');
  const [closingAccountId, setClosingAccountId] = useState('');
  const [usePrimaryClosingAccount, setUsePrimaryClosingAccount] = useState(true);
  const [postingDate, setPostingDate] = useState('');
  const [preview, setPreview] = useState<PeriodEndClosingPreview | null>(null);
  const [pane, setPane] = useState<'criteria' | 'history'>('criteria');
  const [openRun, setOpenRun] = useState<PeriodEndClosingRun | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const periodsQuery = useQuery({
    queryKey: ['posting-periods', companyId],
    queryFn: () => postingPeriodsApi.getAll({ take: 500 }),
    enabled: !!companyId,
  });

  const accountsQuery = useQuery({
    queryKey: ['accounts', companyId],
    queryFn: () => accountsApi.getAll({ take: 1000 }),
    enabled: !!companyId,
  });

  const runsQuery = useQuery({
    queryKey: ['period-end-closing-runs', companyId],
    queryFn: () => utilitiesApi.closingRuns(50),
    enabled: !!companyId && pane === 'history',
  });

  const periods = periodsQuery.data ?? [];
  const equityAccounts = useMemo(
    () => (accountsQuery.data ?? []).filter((a) => !a.isTitle),
    [accountsQuery.data],
  );

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that request.');
    setStatus('');
  };

  const payload = () => ({
    fromPeriodId,
    toPeriodId,
    retainedEarningsAccountId,
    closingAccountId: closingAccountId || undefined,
    usePrimaryClosingAccount,
    postingDate: postingDate || undefined,
  });

  const validate = () => {
    if (!fromPeriodId || !toPeriodId) { setError('Pick both a from and a to period.'); return false; }
    if (!retainedEarningsAccountId) { setError('Pick the retained earnings account.'); return false; }
    return true;
  };

  const previewMut = useMutation({
    mutationFn: () => utilitiesApi.previewClosing(payload()),
    onSuccess: (data) => {
      setPreview(data);
      setError('');
      setStatus(
        data.willPost
          ? `Preview ready — ${data.lines.length} account(s), net ${money(data.netResult)}.`
          : 'Nothing to close in that range.',
      );
    },
    onError: onErr,
  });

  const executeMut = useMutation({
    mutationFn: () => utilitiesApi.executeClosing(payload()),
    onSuccess: (run) => {
      void qc.invalidateQueries({ queryKey: ['period-end-closing-runs'] });
      void qc.invalidateQueries({ queryKey: ['journal-entries'] });
      void qc.invalidateQueries({ queryKey: ['accounts'] });
      setPreview(null);
      setError('');
      setStatus(`Closing posted. Journal entry ${run.journalEntryId ?? ''} created.`);
    },
    onError: onErr,
  });

  const isBusy = previewMut.isPending || executeMut.isPending;

  const handleExecute = () => {
    if (!validate()) return;
    if (!preview?.willPost) {
      setError('Run Expanded (preview) first and check what will post.');
      return;
    }
    const from = periods.find((p) => p.id === fromPeriodId);
    const to = periods.find((p) => p.id === toPeriodId);
    if (!window.confirm(
      `Post the period-end closing for ${from?.name} → ${to?.name}?\n\n` +
      `${preview.lines.length} profit-and-loss account(s) will be taken to nil and ` +
      `${money(preview.netResult)} carried to ${preview.retainedEarnings.code}.\n\n` +
      'This posts a real journal entry. Reversing it afterwards is a separate posting.',
    )) return;
    setError('');
    executeMut.mutate();
  };

  return (
    <ClassicWindow
      title="Period-End Closing"
      icon={<CalendarCheck className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={900}
      minHeight={580}
      toolbar={
        <>
          <ToolBtn onClick={() => setPane('criteria')} disabled={isBusy}>
            Selection Criteria
          </ToolBtn>
          <ToolBtn onClick={() => { setPane('history'); setOpenRun(null); }} disabled={isBusy}>
            <History className="w-3 h-3" /> Previous Report
          </ToolBtn>
          <ToolBtn
            onClick={() => { if (validate()) { setError(''); previewMut.mutate(); } }}
            disabled={isBusy || !companyId}
          >
            <Search className="w-3 h-3" /> {previewMut.isPending ? 'Working…' : 'Expanded'}
          </ToolBtn>
          <ToolBtn onClick={() => { void periodsQuery.refetch(); void runsQuery.refetch(); }} title="Refresh">
            <RefreshCw className={cn('w-3 h-3', periodsQuery.isFetching && 'animate-spin')} />
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>
            {preview
              ? `Preview: debits ${money(preview.totalDebit)} · credits ${money(preview.totalCredit)} · net ${money(preview.netResult)}`
              : 'No preview yet'}
          </span>
          <span>Period-End Closing</span>
        </>
      }
    >
      {!companyId ? (
        <div className="p-3 text-[10px] text-gray-500 italic">
          No company selected. Open{' '}
          <span className="font-medium not-italic">Administration → Choose Company</span> first.
        </div>
      ) : pane === 'criteria' ? (
        <>
          <div className="shrink-0 bg-[#f7f7f7] border-b border-[#d4d0c8] p-3">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 max-w-[860px]">
              <FieldRow label="Period From" labelWidth="150px" required>
                <ClassicSel
                  value={fromPeriodId}
                  onChange={(e) => { setFromPeriodId(e.target.value); setPreview(null); }}
                  className="w-full"
                >
                  <option value="">— pick —</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}{p.displayName ? ` — ${p.displayName}` : ''}</option>
                  ))}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Period To" labelWidth="150px" required>
                <ClassicSel
                  value={toPeriodId}
                  onChange={(e) => { setToPeriodId(e.target.value); setPreview(null); }}
                  className="w-full"
                >
                  <option value="">— pick —</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}{p.displayName ? ` — ${p.displayName}` : ''}</option>
                  ))}
                </ClassicSel>
              </FieldRow>

              <FieldRow label="Retained Earnings Account" labelWidth="150px" required>
                <ClassicSel
                  value={retainedEarningsAccountId}
                  onChange={(e) => { setRetainedEarningsAccountId(e.target.value); setPreview(null); }}
                  className="w-full"
                >
                  <option value="">— pick —</option>
                  {equityAccounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                  ))}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Period-End Closing Account" labelWidth="150px">
                <ClassicSel
                  value={closingAccountId}
                  onChange={(e) => setClosingAccountId(e.target.value)}
                  className="w-full"
                  disabled={usePrimaryClosingAccount}
                >
                  <option value="">— none —</option>
                  {equityAccounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                  ))}
                </ClassicSel>
              </FieldRow>

              <FieldRow label="Posting Date" labelWidth="150px">
                <ClassicInput
                  type="date"
                  value={postingDate}
                  onChange={(e) => setPostingDate(e.target.value)}
                  className="w-full"
                />
              </FieldRow>
              <label className="flex items-center gap-2 text-[11px] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5"
                  checked={usePrimaryClosingAccount}
                  onChange={(e) => setUsePrimaryClosingAccount(e.target.checked)}
                />
                Use Primary Closing Account
              </label>
            </div>

            <div className="text-[9.5px] text-gray-600 mt-2 max-w-[860px]">
              Only profit-and-loss accounts are closed. Balance-sheet accounts carry forward by
              definition — sweeping them into retained earnings would zero the company's assets.
              The posting date defaults to the last day of the “to” period.
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto bg-white custom-scrollbar">
            {previewMut.isPending ? (
              <div className="p-3 text-[10.5px] text-gray-400">Calculating…</div>
            ) : !preview ? (
              <div className="p-3 text-[10.5px] text-gray-400">
                Choose the period range and the retained earnings account, then press Expanded to
                see exactly what would post. Nothing is written until you press Execute.
              </div>
            ) : !preview.willPost ? (
              <div className="p-3 text-[10.5px] text-gray-500">
                No posted profit-and-loss movement between {preview.from.name} and {preview.to.name}.
                There is nothing to close.
              </div>
            ) : (
              <table className="w-full border-collapse text-[10.5px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Account</th>
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Name</th>
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Type</th>
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Debit</th>
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Credit</th>
                    <th className="px-2 py-1 font-bold text-[#444] text-right">Closing Entry</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.lines.map((l) => {
                    const balance = Number(l.balance);
                    return (
                      <tr key={l.accountId} className="border-b border-[#f0f0f0]">
                        <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">{l.code}</td>
                        <td className="px-2 py-1 border-r border-[#f0f0f0]">{l.name}</td>
                        <td className="px-2 py-1 border-r border-[#f0f0f0]">{l.type}</td>
                        <td className="px-2 py-1 border-r border-[#f0f0f0] text-right font-mono">{money(l.debit)}</td>
                        <td className="px-2 py-1 border-r border-[#f0f0f0] text-right font-mono">{money(l.credit)}</td>
                        <td className={cn(
                          'px-2 py-1 text-right font-mono',
                          balance > 0 ? 'text-blue-800' : 'text-red-800',
                        )}>
                          {balance > 0 ? `Dr ${money(balance)}` : `Cr ${money(Math.abs(balance))}`}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#fffbe6] font-bold border-t-2 border-[#d4d0c8]">
                    <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">
                      {preview.retainedEarnings.code}
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]" colSpan={4}>
                      {preview.retainedEarnings.name} — {Number(preview.netResult) > 0 ? 'net profit' : 'net loss'}
                    </td>
                    <td className="px-2 py-1 text-right font-mono">
                      {Number(preview.netResult) > 0
                        ? `Cr ${money(preview.netResult)}`
                        : `Dr ${money(Math.abs(Number(preview.netResult)))}`}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        /* ── Previous Report ── */
        <div className="flex-1 min-h-0 flex overflow-hidden">
          <div className="w-[380px] shrink-0 border-r border-[#d4d0c8] overflow-auto bg-white custom-scrollbar">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Run</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Status</th>
                  <th className="px-2 py-1 font-bold text-[#444] text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {(runsQuery.data ?? []).map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setOpenRun(r)}
                    className={cn(
                      'border-b border-[#f0f0f0] cursor-default',
                      openRun?.id === r.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
                    )}
                  >
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">
                      {new Date(r.createdAt).toLocaleString()}
                      <div className="text-[9px] text-gray-500">
                        {r.executedBy?.name ?? '—'}
                      </div>
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">
                      <span className={cn(
                        'text-[9px] px-1 rounded-[1px]',
                        r.status === 'EXECUTED' ? 'bg-green-100 text-green-800'
                        : r.status === 'FAILED' ? 'bg-red-100 text-red-800'
                        : 'bg-gray-200 text-gray-700',
                      )}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-right font-mono">
                      {money(Number(r.totalDebit) - Number(r.totalCredit))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {runsQuery.isLoading && <div className="p-3 text-[10.5px] text-gray-400">Loading…</div>}
            {!runsQuery.isLoading && (runsQuery.data?.length ?? 0) === 0 && (
              <div className="p-3 text-[10.5px] text-gray-400">No closings have been run yet.</div>
            )}
          </div>

          <div className="flex-1 min-w-0 overflow-auto bg-white p-3 custom-scrollbar">
            {!openRun ? (
              <div className="text-[10.5px] text-gray-400">
                Pick a run to reprint it. Each run stores the balances it moved, so the report reads
                the same today as it did then, even though the live balances have moved on since.
              </div>
            ) : (
              <>
                <div className="text-[11px] font-bold mb-1">
                  Closing run — {new Date(openRun.createdAt).toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-600 mb-2">
                  Status {openRun.status}
                  {openRun.journalEntryId ? ` · journal ${openRun.journalEntryId}` : ''}
                  {openRun.executedBy ? ` · by ${openRun.executedBy.name}` : ''}
                </div>
                <table className="w-full border-collapse text-[10.5px]">
                  <thead>
                    <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                      <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Account</th>
                      <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Name</th>
                      <th className="px-2 py-1 font-bold text-[#444] text-right">Balance Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(openRun.lines ?? []).map((l) => (
                      <tr key={l.accountId} className="border-b border-[#f0f0f0]">
                        <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">{l.code}</td>
                        <td className="px-2 py-1 border-r border-[#f0f0f0]">{l.name}</td>
                        <td className="px-2 py-1 text-right font-mono">{money(l.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
        <YellowBtn onClick={handleExecute} disabled={isBusy || !preview?.willPost}>
          <span className="inline-flex items-center gap-1">
            <Play className="w-3 h-3" />
            {executeMut.isPending ? 'Posting…' : 'Execute'}
          </span>
        </YellowBtn>
        <GreyBtn onClick={onClose}>Cancel</GreyBtn>
        <span className="text-[9.5px] text-gray-600 ml-1">
          Execute recalculates server-side and posts from the fresh figures, not from this screen.
        </span>
      </div>
    </ClassicWindow>
  );
};
