import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  exchangeRatesApi,
  currenciesApi,
  type ExchangeRateGrid,
} from '../../../api/financials.api';
import {
  indexesApi,
  type FinancialIndex,
  type IndexGrid,
  type IndexGridCell,
} from '../../../api/administration.api';
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
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Cell edits, keyed so a currency/day (or index/month) pair maps to one entry. */
type Edits = Record<string, string>;

const rateKey = (currency: string, day: number) => `${currency}|${day}`;
const indexKey = (indexId: string, month: number) => `${indexId}|${month}`;

/**
 * A rate is a positive decimal. The grid used to accept anything, so a typo'd
 * "1.2.3" or "-4" was posted and only surfaced later as a posting failure.
 */
const parseRate = (raw: string): { ok: true; value: number | null } | { ok: false; why: string } => {
  const s = raw.trim();
  if (!s) return { ok: true, value: null }; // cleared cell = no quote that day
  if (!/^\d*\.?\d+$/.test(s)) return { ok: false, why: `"${raw}" is not a number.` };
  const n = Number(s);
  if (!Number.isFinite(n)) return { ok: false, why: `"${raw}" is not a number.` };
  if (n <= 0) return { ok: false, why: 'A rate must be greater than zero.' };
  if (n > 1_000_000_000) return { ok: false, why: `${raw} is implausibly large for a rate.` };
  return { ok: true, value: n };
};

const parseIndexValue = (raw: string): { ok: true; value: number | null } | { ok: false; why: string } => {
  const s = raw.trim();
  if (!s) return { ok: true, value: null };
  if (!/^\d*\.?\d+$/.test(s)) return { ok: false, why: `"${raw}" is not a number.` };
  const n = Number(s);
  if (!Number.isFinite(n)) return { ok: false, why: `"${raw}" is not a number.` };
  if (n < 0) return { ok: false, why: 'An index value cannot be negative.' };
  return { ok: true, value: n };
};

const emptyIndexForm = { code: '', name: '', description: '', baseYear: '' };

export const ExchangeRatesIndexesWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const now = new Date();
  const [tab, setTab] = useState<'rates' | 'indexes'>('rates');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [indexYear, setIndexYear] = useState(now.getFullYear());

  const [rateEdits, setRateEdits] = useState<Edits>({});
  const [indexEdits, setIndexEdits] = useState<Edits>({});
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  // Add panes — the Add button the window was missing entirely.
  const [addRate, setAddRate] = useState<null | {
    targetCurrency: string; date: string; rate: string;
  }>(null);
  const [addIndex, setAddIndex] = useState<null | typeof emptyIndexForm>(null);

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that change.');
    setStatus('');
  };

  // ── Exchange rates ──
  const ratesQuery = useQuery<ExchangeRateGrid>({
    queryKey: ['exchange-rate-grid', companyId, year, month],
    queryFn: () => exchangeRatesApi.grid(year, month),
    enabled: !!companyId && tab === 'rates',
  });

  const currenciesQuery = useQuery({
    queryKey: ['currencies', companyId],
    queryFn: () => currenciesApi.getAll({ take: 300 }),
    enabled: !!companyId,
  });

  // ── Indexes ──
  const indexGridQuery = useQuery<IndexGrid>({
    queryKey: ['index-grid', companyId, indexYear],
    queryFn: () => indexesApi.grid(indexYear),
    enabled: !!companyId && tab === 'indexes',
  });

  const indexListQuery = useQuery<FinancialIndex[]>({
    queryKey: ['indexes', companyId],
    queryFn: () => indexesApi.getAll({ take: 200 }),
    enabled: !!companyId && tab === 'indexes',
  });

  // Switching month/year abandons whatever was typed for the previous one.
  // Carrying edits across would write them onto the wrong dates.
  useEffect(() => { setRateEdits({}); }, [year, month]);
  useEffect(() => { setIndexEdits({}); }, [indexYear]);

  const saveRatesMut = useMutation({
    mutationFn: async () => {
      const grid = ratesQuery.data;
      if (!grid) return { upserted: 0 };

      const toUpsert: { targetCurrency: string; rate: number; date: string; baseCurrency: string }[] = [];
      const toClear: { targetCurrency: string; date: string }[] = [];

      for (const [key, raw] of Object.entries(rateEdits)) {
        const [currency, dayStr] = key.split('|');
        const day = Number(dayStr);
        const dayRow = grid.days.find((d) => d.day === day);
        if (!dayRow) continue;

        const parsed = parseRate(raw);
        if (!parsed.ok) throw new Error(`${currency} on day ${day}: ${parsed.why}`);

        if (parsed.value === null) {
          // Only worth a delete if something is actually stored there.
          if (dayRow.cells[currency]) toClear.push({ targetCurrency: currency, date: dayRow.date });
        } else {
          toUpsert.push({
            targetCurrency: currency,
            rate: parsed.value,
            date: dayRow.date,
            baseCurrency: grid.baseCurrency,
          });
        }
      }

      if (toUpsert.length) await exchangeRatesApi.bulk(toUpsert);
      for (const c of toClear) {
        await exchangeRatesApi.clearCell(c.targetCurrency, c.date, grid.baseCurrency);
      }
      return { upserted: toUpsert.length, cleared: toClear.length };
    },
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['exchange-rate-grid'] });
      setRateEdits({});
      setError('');
      setStatus(
        `Saved ${res.upserted ?? 0} rate(s)` +
        ((res as { cleared?: number }).cleared ? `, cleared ${(res as { cleared?: number }).cleared}` : '') + '.',
      );
    },
    onError: onErr,
  });

  const addRateMut = useMutation({
    mutationFn: () => {
      if (!addRate) throw new Error('Nothing to add.');
      const parsed = parseRate(addRate.rate);
      if (!parsed.ok) throw new Error(parsed.why);
      if (parsed.value === null) throw new Error('Enter a rate.');
      if (!/^[A-Z]{3}$/.test(addRate.targetCurrency)) {
        throw new Error('Pick a currency.');
      }
      if (!addRate.date) throw new Error('Pick a date.');
      return exchangeRatesApi.create({
        targetCurrency: addRate.targetCurrency,
        baseCurrency: ratesQuery.data?.baseCurrency ?? 'USD',
        rate: parsed.value,
        date: addRate.date,
        source: 'manual',
      } as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['exchange-rate-grid'] });
      setAddRate(null);
      setError('');
      setStatus('Exchange rate added.');
    },
    onError: onErr,
  });

  const saveIndexesMut = useMutation({
    mutationFn: () => {
      const cells: IndexGridCell[] = [];
      for (const [key, raw] of Object.entries(indexEdits)) {
        const [indexId, monthStr] = key.split('|');
        const parsed = parseIndexValue(raw);
        if (!parsed.ok) throw new Error(`Month ${monthStr}: ${parsed.why}`);
        cells.push({ indexId, month: Number(monthStr), value: parsed.value });
      }
      return indexesApi.saveGrid(indexYear, cells);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['index-grid'] });
      setIndexEdits({});
      setError('');
      setStatus('Index values saved.');
    },
    onError: onErr,
  });

  const addIndexMut = useMutation({
    mutationFn: () => {
      if (!addIndex) throw new Error('Nothing to add.');
      if (!addIndex.code.trim()) throw new Error('An index code is required.');
      if (!addIndex.name.trim()) throw new Error('An index name is required.');
      const baseYear = addIndex.baseYear.trim();
      if (baseYear && !/^\d{4}$/.test(baseYear)) throw new Error('Base year must be a four-digit year.');
      return indexesApi.create({
        code: addIndex.code.trim().toUpperCase(),
        name: addIndex.name.trim(),
        description: addIndex.description.trim() || undefined,
        baseYear: baseYear ? Number(baseYear) : undefined,
        isActive: true,
      } as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['index-grid'] });
      void qc.invalidateQueries({ queryKey: ['indexes'] });
      setAddIndex(null);
      setError('');
      setStatus('Index added.');
    },
    onError: onErr,
  });

  const deleteIndexMut = useMutation({
    mutationFn: (id: string) => indexesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['index-grid'] });
      void qc.invalidateQueries({ queryKey: ['indexes'] });
      setError('');
      setStatus('Index deleted.');
    },
    onError: onErr,
  });

  const isBusy =
    saveRatesMut.isPending || addRateMut.isPending ||
    saveIndexesMut.isPending || addIndexMut.isPending || deleteIndexMut.isPending;

  const rateGrid = ratesQuery.data;
  const idxGrid = indexGridQuery.data;
  const dirtyRates = Object.keys(rateEdits).length;
  const dirtyIndexes = Object.keys(indexEdits).length;

  const yearOptions = useMemo(() => {
    const y = now.getFullYear();
    return Array.from({ length: 11 }, (_, i) => y - 5 + i);
  }, [now]);

  const cellValue = (currency: string, day: number, stored: string | null) => {
    const key = rateKey(currency, day);
    return key in rateEdits ? rateEdits[key] : (stored ?? '');
  };

  const idxCellValue = (indexId: string, m: number, stored: string | null) => {
    const key = indexKey(indexId, m);
    return key in indexEdits ? indexEdits[key] : (stored ?? '');
  };

  return (
    <ClassicWindow
      title="Exchange Rates and Indexes"
      icon={<ArrowLeftRight className="w-3.5 h-3.5 text-gray-600" />}
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
          {tab === 'rates' ? (
            <>
              <ToolBtn
                onClick={() => {
                  setAddRate({
                    targetCurrency: rateGrid?.currencies[0]?.code ?? '',
                    date: new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10),
                    rate: '',
                  });
                  setError(''); setStatus('');
                }}
                disabled={isBusy || !companyId}
              >
                <Plus className="w-3 h-3" /> Add Rate
              </ToolBtn>
              <ToolBtn onClick={() => saveRatesMut.mutate()} disabled={isBusy || !dirtyRates}>
                <Save className="w-3 h-3" />
                {saveRatesMut.isPending ? 'Saving…' : `Save${dirtyRates ? ` (${dirtyRates})` : ''}`}
              </ToolBtn>
              <ToolBtn onClick={() => { setRateEdits({}); setError(''); }} disabled={!dirtyRates}>
                Discard
              </ToolBtn>
              <ToolBtn onClick={() => ratesQuery.refetch()} title="Refresh">
                <RefreshCw className={cn('w-3 h-3', ratesQuery.isFetching && 'animate-spin')} />
              </ToolBtn>
            </>
          ) : (
            <>
              <ToolBtn
                onClick={() => { setAddIndex({ ...emptyIndexForm }); setError(''); setStatus(''); }}
                disabled={isBusy || !companyId}
              >
                <Plus className="w-3 h-3" /> Add Index
              </ToolBtn>
              <ToolBtn onClick={() => saveIndexesMut.mutate()} disabled={isBusy || !dirtyIndexes}>
                <Save className="w-3 h-3" />
                {saveIndexesMut.isPending ? 'Saving…' : `Save${dirtyIndexes ? ` (${dirtyIndexes})` : ''}`}
              </ToolBtn>
              <ToolBtn onClick={() => { setIndexEdits({}); setError(''); }} disabled={!dirtyIndexes}>
                Discard
              </ToolBtn>
              <ToolBtn onClick={() => indexGridQuery.refetch()} title="Refresh">
                <RefreshCw className={cn('w-3 h-3', indexGridQuery.isFetching && 'animate-spin')} />
              </ToolBtn>
            </>
          )}
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>
            {tab === 'rates'
              ? `${rateGrid?.currencies.length ?? 0} currency column(s) · base ${rateGrid?.baseCurrency ?? '—'}`
              : `${idxGrid?.indexes.length ?? 0} index column(s)`}
            {(dirtyRates || dirtyIndexes) ? ' · unsaved changes' : ''}
          </span>
          <span>Exchange Rates and Indexes</span>
        </>
      }
    >
      {/* ── Tabs ── */}
      <div className="shrink-0 flex px-2 pt-1.5 bg-[#ececec] border-b border-[#d4d0c8]">
        {(['rates', 'indexes'] as const).map((key) => {
          const active = tab === key;
          return (
            <div
              key={key}
              onClick={() => { setTab(key); setError(''); setStatus(''); }}
              style={{ marginBottom: active ? '-1px' : 0 }}
              className={cn(
                'relative px-6 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border-l border-t border-r',
                active
                  ? 'bg-white border-[#d4d0c8] text-black z-10'
                  : 'bg-gradient-to-b from-[#f0f0f0] to-[#e0e0e0] border-gray-300 text-gray-600',
              )}
            >
              {active && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ffd700] rounded-t-[3px]" />}
              {key === 'rates' ? 'Exchange Rates' : 'Indexes'}
            </div>
          );
        })}
      </div>

      {/* ── Period pickers ── */}
      <div className="shrink-0 flex items-center justify-end gap-2 px-3 py-1.5 bg-[#f7f7f7] border-b border-[#d4d0c8]">
        {tab === 'rates' && (
          <ClassicSel value={String(month)} onChange={(e) => setMonth(Number(e.target.value))} className="w-32">
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </ClassicSel>
        )}
        <ClassicSel
          value={String(tab === 'rates' ? year : indexYear)}
          onChange={(e) => (tab === 'rates' ? setYear : setIndexYear)(Number(e.target.value))}
          className="w-24"
        >
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </ClassicSel>
      </div>

      {/* ── Add Rate pane ── */}
      {tab === 'rates' && addRate && (
        <div className="shrink-0 bg-[#fffbe6] border-b border-[#e0d090] p-3">
          <div className="text-[11px] font-bold mb-2">Add Exchange Rate</div>
          <div className="flex items-end gap-3 flex-wrap">
            <FieldRow label="Currency" labelWidth="70px" required>
              <ClassicSel
                value={addRate.targetCurrency}
                onChange={(e) => setAddRate((a) => a && { ...a, targetCurrency: e.target.value })}
                className="w-32"
              >
                <option value="">— pick —</option>
                {(currenciesQuery.data ?? [])
                  .filter((c) => c.code !== (rateGrid?.baseCurrency ?? 'USD'))
                  .map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </ClassicSel>
            </FieldRow>
            <FieldRow label="Date" labelWidth="50px" required>
              <ClassicInput
                type="date"
                value={addRate.date}
                onChange={(e) => setAddRate((a) => a && { ...a, date: e.target.value })}
                className="w-36"
              />
            </FieldRow>
            <FieldRow label="Rate" labelWidth="50px" required>
              <ClassicInput
                type="text"
                inputMode="decimal"
                value={addRate.rate}
                onChange={(e) => setAddRate((a) => a && { ...a, rate: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') addRateMut.mutate(); }}
                className="w-32 text-right font-mono"
                placeholder="278.500000"
                autoFocus
              />
            </FieldRow>
            <YellowBtn onClick={() => addRateMut.mutate()} disabled={isBusy}>
              {addRateMut.isPending ? 'Adding…' : 'Add'}
            </YellowBtn>
            <GreyBtn onClick={() => { setAddRate(null); setError(''); }}>Cancel</GreyBtn>
          </div>
          <div className="text-[9.5px] text-gray-600 mt-2">
            One quote per currency per day against {rateGrid?.baseCurrency ?? 'USD'}. Adding a rate for a
            day that already has one replaces it.
          </div>
        </div>
      )}

      {/* ── Add Index pane ── */}
      {tab === 'indexes' && addIndex && (
        <div className="shrink-0 bg-[#fffbe6] border-b border-[#e0d090] p-3">
          <div className="text-[11px] font-bold mb-2">Add Index</div>
          <div className="flex items-end gap-3 flex-wrap">
            <FieldRow label="Code" labelWidth="50px" required>
              <ClassicInput
                value={addIndex.code}
                onChange={(e) => setAddIndex((a) => a && { ...a, code: e.target.value.toUpperCase() })}
                className="w-24 font-mono"
                placeholder="CPI"
                autoFocus
              />
            </FieldRow>
            <FieldRow label="Name" labelWidth="50px" required>
              <ClassicInput
                value={addIndex.name}
                onChange={(e) => setAddIndex((a) => a && { ...a, name: e.target.value })}
                className="w-56"
                placeholder="Consumer Price Index"
              />
            </FieldRow>
            <FieldRow label="Base Year" labelWidth="70px">
              <ClassicInput
                value={addIndex.baseYear}
                onChange={(e) => setAddIndex((a) => a && { ...a, baseYear: e.target.value })}
                className="w-24"
                placeholder="2020"
              />
            </FieldRow>
            <FieldRow label="Description" labelWidth="80px">
              <ClassicInput
                value={addIndex.description}
                onChange={(e) => setAddIndex((a) => a && { ...a, description: e.target.value })}
                className="w-64"
              />
            </FieldRow>
            <YellowBtn onClick={() => addIndexMut.mutate()} disabled={isBusy}>
              {addIndexMut.isPending ? 'Adding…' : 'Add'}
            </YellowBtn>
            <GreyBtn onClick={() => { setAddIndex(null); setError(''); }}>Cancel</GreyBtn>
          </div>
        </div>
      )}

      {/* ── Grids ── */}
      <div className="flex-1 min-h-0 overflow-auto bg-white custom-scrollbar">
        {!companyId ? (
          <div className="p-3 text-[10px] text-gray-500 italic">
            No company selected. Open <span className="font-medium not-italic">Administration → Choose Company</span> first.
          </div>
        ) : tab === 'rates' ? (
          <>
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] w-[70px]">
                    {MONTHS[month - 1]}
                  </th>
                  {(rateGrid?.currencies ?? []).map((c) => (
                    <th
                      key={c.code}
                      className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right"
                      title={c.name}
                    >
                      {c.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(rateGrid?.days ?? []).map((d) => (
                  <tr key={d.day} className="border-b border-[#f0f0f0]">
                    <td className="px-2 py-0.5 border-r border-[#f0f0f0] font-bold bg-[#f7f7f7]">{d.day}</td>
                    {(rateGrid?.currencies ?? []).map((c) => {
                      const stored = d.cells[c.code];
                      const key = rateKey(c.code, d.day);
                      const dirty = key in rateEdits;
                      const value = cellValue(c.code, d.day, stored?.rate ?? null);
                      const invalid = dirty && !parseRate(value).ok;
                      return (
                        <td key={c.code} className="border-r border-[#f0f0f0] p-0">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) =>
                              setRateEdits((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className={cn(
                              'w-full h-[20px] px-1 text-[10.5px] text-right font-mono bg-transparent outline-none',
                              'focus:bg-[#fffbd0] focus:ring-1 focus:ring-[#ffd700]',
                              dirty && 'bg-[#fff7d6]',
                              invalid && 'bg-red-100 text-red-800',
                            )}
                            title={invalid ? 'Not a valid rate' : stored?.source ?? undefined}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {ratesQuery.isLoading && <div className="p-3 text-[10.5px] text-gray-400">Loading rates…</div>}
            {!ratesQuery.isLoading && (rateGrid?.currencies.length ?? 0) === 0 && (
              <div className="p-3 text-[10.5px] text-gray-400">
                This company has no currencies other than its base. Add currencies under
                Financials → Currencies, then quote them here.
              </div>
            )}
          </>
        ) : (
          <>
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] w-[110px]">
                    {indexYear}
                  </th>
                  {(idxGrid?.indexes ?? []).map((idx) => (
                    <th
                      key={idx.id}
                      className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right"
                      title={idx.name}
                    >
                      <span className="inline-flex items-center gap-1 justify-end w-full">
                        {idx.code}
                        <button
                          className="opacity-50 hover:opacity-100 hover:text-red-700"
                          title={`Delete index ${idx.code} and all of its values`}
                          onClick={() => {
                            if (!window.confirm(
                              `Delete index ${idx.code}?\n\nEvery recorded value for it is deleted too.`,
                            )) return;
                            deleteIndexMut.mutate(idx.id);
                          }}
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(idxGrid?.rows ?? []).map((row) => (
                  <tr key={row.month} className="border-b border-[#f0f0f0]">
                    <td className="px-2 py-0.5 border-r border-[#f0f0f0] font-bold bg-[#f7f7f7]">
                      {row.monthName}
                    </td>
                    {(idxGrid?.indexes ?? []).map((idx) => {
                      const key = indexKey(idx.id, row.month);
                      const dirty = key in indexEdits;
                      const value = idxCellValue(idx.id, row.month, row.values[idx.id]);
                      const invalid = dirty && !parseIndexValue(value).ok;
                      return (
                        <td key={idx.id} className="border-r border-[#f0f0f0] p-0">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) =>
                              setIndexEdits((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className={cn(
                              'w-full h-[20px] px-1 text-[10.5px] text-right font-mono bg-transparent outline-none',
                              'focus:bg-[#fffbd0] focus:ring-1 focus:ring-[#ffd700]',
                              dirty && 'bg-[#fff7d6]',
                              invalid && 'bg-red-100 text-red-800',
                            )}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {indexGridQuery.isLoading && (
              <div className="p-3 text-[10.5px] text-gray-400">Loading indexes…</div>
            )}
            {!indexGridQuery.isLoading && (idxGrid?.indexes.length ?? 0) === 0 && (
              <div className="p-3 text-[10.5px] text-gray-400">
                No indexes defined yet. Click Add Index to create one — it becomes a column here.
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer actions ── */}
      <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
        <YellowBtn
          onClick={() => (tab === 'rates' ? saveRatesMut : saveIndexesMut).mutate()}
          disabled={isBusy || (tab === 'rates' ? !dirtyRates : !dirtyIndexes)}
        >
          OK
        </YellowBtn>
        <GreyBtn onClick={onClose}>Cancel</GreyBtn>
        <span className="text-[9.5px] text-gray-600 ml-1">
          Type into a cell to edit it. Clearing a cell removes the value — a blank cell means
          “not published”, which is not the same as zero.
        </span>
        {tab === 'indexes' && (indexListQuery.data?.length ?? 0) > 0 && (
          <span className="text-[9.5px] text-gray-500 ml-auto">
            {indexListQuery.data?.length} index definition(s)
          </span>
        )}
      </div>
    </ClassicWindow>
  );
};
