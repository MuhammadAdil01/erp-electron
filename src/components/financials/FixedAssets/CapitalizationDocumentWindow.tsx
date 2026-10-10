import React, { useEffect, useMemo, useState } from 'react';
import { FilePlus2, FileMinus2, Plus, Trash2, Ban, RefreshCw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  assetCapitalizationsApi,
  type CapitalizationKind,
  type CapitalizationOrigin,
  type CapitalizationPayload,
  type CapitalizationDetail,
} from '../../../api/fixed-assets.api';
import { confirmDiscardUnsaved, useUnsavedChangesGuard } from '../../../lib/unsavedChanges';
import { ClassicWindow, StatusNote, ListPlaceholder, ToolBtn, type WindowState } from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

export interface CapitalizationWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (patch: Partial<WindowState>) => void;
  onFocus: () => void;
  /** Asset Master Data → Capitalize…: start a new document with this asset. */
  prefill?: { assetId: string; nonce: number } | null;
  /** Another window asked to show this document. */
  focusDocument?: { id: string; nonce: number } | null;
  onOpenJournalEntry?: (id: string) => void;
  onOpenAsset?: (id: string) => void;
}

interface DraftLine {
  key: string;
  assetId: string;
  apBillLineId: string;
  amount: string;
  quantity: string;
  remarks: string;
}

const today = () => new Date().toISOString().slice(0, 10);
/** dd.mm.yyyy, as SAP shows dates. */
const day = (iso: string | null | undefined) => (iso ? iso.slice(0, 10).split('-').reverse().join('.') : '');
const num = (s: string) => (Number.isFinite(Number(s)) ? Number(s) : 0);
// 999,999,999,999,999.99 (QA FA-D13), as close as a double gets.
const MAX_AMOUNT = 1e15 - 0.01;
/** QA FA-D13: a positive amount with at most 2 decimals. */
const isAmount = (s: string) => /^\d+(\.\d{1,2})?$/.test(s.trim()) && Number(s) > 0 && Number(s) <= MAX_AMOUNT;
const money = (v: string | number | null | undefined) =>
  v === null || v === undefined || v === '' ? '' : Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
/** What the user has entered, without the row keys: compared to tell whether there is anything to lose. */
const snapshot = (header: object, lines: DraftLine[]) =>
  JSON.stringify({ header, lines: lines.map((l) => [l.assetId, l.apBillLineId, l.amount, l.quantity, l.remarks]) });
const blankLine = (): DraftLine => ({ key: newKey(), assetId: '', apBillLineId: '', amount: '', quantity: '', remarks: '' });

const emptyHeader = {
  origin: 'MANUAL' as CapitalizationOrigin,
  apBillId: '',
  baseCapitalizationId: '',
  depreciationAreaId: '',
  seriesId: '',
  reference: '',
  postingDate: today(),
  documentDate: today(),
  assetValueDate: today(),
  journalRemark: '',
  remarks: '',
};

const TITLES: Record<CapitalizationKind, string> = {
  CAPITALIZATION: 'Capitalization',
  CREDIT_MEMO: 'Capitalization Credit Memo',
};

/**
 * Financials → Fixed Assets → Capitalization and Capitalization Credit Memo.
 *
 * Add posts the document straight away: a capitalization raises each asset's
 * acquisition and production cost (APC) in the chosen depreciation areas and,
 * in the area that posts to the G/L, books Dr asset account / Cr clearing
 * account (or the A/P invoice line it capitalizes). A credit memo is the
 * mirror image. A posted document is never edited; Cancel reverses its
 * journal entry and its effect on the assets.
 */
export const CapitalizationDocumentWindow: React.FC<CapitalizationWindowProps & { kind: CapitalizationKind }> = ({
  kind, windowState, onClose, onUpdateState, onFocus, prefill, focusDocument, onOpenJournalEntry, onOpenAsset,
}) => {
  const isCredit = kind === 'CREDIT_MEMO';
  const title = TITLES[kind];
  const { activeCompanyId, hasPermission } = useAuth();
  const can = {
    post: hasPermission('financials.fixed_asset_document.create'),
    cancel: hasPermission('financials.fixed_asset_document.cancel'),
  };
  const qc = useQueryClient();

  const [mode, setMode] = useState<'browse' | 'new'>('browse');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'Contents' | 'Accounting'>('Contents');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [header, setHeader] = useState(emptyHeader);
  const [lines, setLines] = useState<DraftLine[]>([blankLine()]);
  // One key per document being entered: a retry after a timeout replays the
  // first answer instead of posting twice.
  const [idempotencyKey, setIdempotencyKey] = useState(newKey);

  const listQuery = useQuery({
    queryKey: ['asset-capitalizations', kind, activeCompanyId],
    queryFn: () => assetCapitalizationsApi.list(kind),
    enabled: !!activeCompanyId,
  });
  const lookupsQuery = useQuery({
    queryKey: ['asset-capitalizations', 'lookups', kind, activeCompanyId],
    queryFn: () => assetCapitalizationsApi.lookups(kind),
    enabled: !!activeCompanyId,
  });
  const lk = lookupsQuery.data;
  const detailQuery = useQuery({
    queryKey: ['asset-capitalizations', 'detail', activeCompanyId, selectedId],
    queryFn: () => assetCapitalizationsApi.getOne(selectedId as string),
    enabled: !!selectedId && mode === 'browse',
  });
  const doc: CapitalizationDetail | null = detailQuery.data && detailQuery.data.id === selectedId ? detailQuery.data : null;
  const docs = listQuery.data ?? [];

  const assetById = useMemo(() => new Map((lk?.assets ?? []).map((a) => [a.id, a])), [lk]);
  const bill = (lk?.apBills ?? []).find((b) => b.id === header.apBillId) ?? null;
  const base = (lk?.baseDocuments ?? []).find((b) => b.id === header.baseCapitalizationId) ?? null;
  const area = (lk?.depreciationAreas ?? []).find((a) => a.id === header.depreciationAreaId) ?? null;
  const postsToGl = !area || area.postsToGl;

  const freshHeader = () => ({
    ...emptyHeader,
    postingDate: today(),
    documentDate: today(),
    assetValueDate: today(),
    seriesId: lk?.series.find((s) => s.isDefault)?.id ?? lk?.series[0]?.id ?? '',
    journalRemark: lk?.journalRemark ?? title,
  });
  const [pristine, setPristine] = useState('');
  const isNewMode = mode === 'new';
  const dirty = isNewMode && pristine !== '' && snapshot(header, lines) !== pristine;
  useUnsavedChangesGuard(title, dirty);
  const discardOk = (action: string) => !dirty || window.confirm(`${title} has an unposted document. ${action} will discard it. Continue?`);

  const startNew = (firstAssetId?: string) => {
    if (!discardOk('Starting a new document')) return;
    setMode('new');
    setSelectedId(null);
    setTab('Contents');
    setError('');
    setStatus('');
    const h = freshHeader();
    const ls = [firstAssetId ? lineFor(firstAssetId) : blankLine()];
    setHeader(h);
    setIdempotencyKey(newKey());
    setLines(ls);
    setPristine(snapshot(h, firstAssetId ? [blankLine()] : ls));
  };

  // Defaults for a line once its asset is chosen: the planned purchase cost as
  // the amount, and one unit when the asset has none in service yet (FA-D15:
  // a later document defaults to a value-only 0, so an addition does not
  // count the asset twice).
  const lineFor = (assetId: string, patch: Partial<DraftLine> = {}): DraftLine => {
    const a = assetById.get(assetId);
    return {
      ...blankLine(),
      assetId,
      amount: !isCredit && a?.purchaseCost ? String(Number(a.purchaseCost)) : '',
      quantity: isCredit ? '0' : !a || a.quantity === 0 ? '1' : '0',
      ...patch,
    };
  };

  useEffect(() => {
    if (!prefill || !lk) return;
    startNew(prefill.assetId);
    if (!assetById.has(prefill.assetId)) {
      setError(isCredit
        ? 'That asset is not capitalized, so there is nothing to credit.'
        : 'That asset cannot be capitalized: it is inactive, retired, or its class is inactive.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill, lk]);

  useEffect(() => {
    if (!focusDocument) return;
    if (!discardOk('Opening another document')) return;
    setMode('browse');
    setSelectedId(focusDocument.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusDocument]);

  const setLine = (key: string, patch: Partial<DraftLine>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const chooseBase = (id: string) => {
    const b = (lk?.baseDocuments ?? []).find((x) => x.id === id);
    if (!b) { setHeader((h) => ({ ...h, baseCapitalizationId: '' })); return; }
    setHeader((h) => ({ ...h, baseCapitalizationId: id, origin: b.origin, apBillId: b.apBillId ?? '' }));
    setLines(b.lines
      .map((l) => ({ l, open: Number(l.amount) - Number(l.credited) }))
      .filter(({ l }) => assetById.has(l.assetId))
      .map(({ l, open }) => lineFor(l.assetId, { apBillLineId: l.apBillLineId ?? '', amount: open > 0 ? String(open) : '' })));
  };

  const total = lines.reduce((s, l) => s + num(l.amount), 0);
  // Rows with neither an asset nor an amount are ignored, wherever they are.
  const filled = lines.filter((l) => l.assetId || l.amount.trim());

  /** What the posting will book, from the asset classes' accounts. */
  const preview = filled.flatMap((l) => {
    const a = assetById.get(l.assetId);
    if (!a || !num(l.amount)) return [];
    const billLine = bill?.lines.find((bl) => bl.id === l.apBillLineId);
    const offset = billLine?.account ?? a.assetClass.clearingAccount;
    const assetSide = { account: a.assetClass.assetAccount, debit: isCredit ? 0 : num(l.amount), credit: isCredit ? num(l.amount) : 0 };
    const offsetSide = { account: offset, debit: isCredit ? num(l.amount) : 0, credit: isCredit ? 0 : num(l.amount) };
    return isCredit ? [offsetSide, assetSide] : [assetSide, offsetSide];
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['asset-capitalizations'] });
    void qc.invalidateQueries({ queryKey: ['fixed-assets'] });
    void qc.invalidateQueries({ queryKey: ['journal-entries'] });
    void qc.invalidateQueries({ queryKey: ['account-balances'] });
  };
  const onErr = (e: unknown) => { setError(e instanceof Error ? e.message : 'The server rejected the document.'); setStatus(''); };

  const createMut = useMutation({
    mutationFn: (payload: CapitalizationPayload) => assetCapitalizationsApi.create(payload, idempotencyKey),
    onSuccess: (d) => {
      invalidate();
      setMode('browse');
      setSelectedId(d.id);
      setError('');
      setStatus(`${d.number} posted${d.journalEntry ? ` — journal entry ${d.journalEntry.number}` : ' (statistical area only, no journal entry)'}.`);
      setIdempotencyKey(newKey());
    },
    onError: onErr,
  });
  const cancelMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => assetCapitalizationsApi.cancel(id, reason),
    onSuccess: (d) => {
      invalidate();
      setError('');
      setStatus(`${d.number} cancelled${d.cancellationJournalEntry ? ` — reversal ${d.cancellationJournalEntry.number}` : ''}.`);
    },
    onError: onErr,
  });
  const busy = createMut.isPending || cancelMut.isPending;

  const add = () => {
    setError('');
    if (createMut.isPending) return;
    if (!can.post) return setError('You do not have permission to post this document (financials.fixed_asset_document.create).');
    if (!filled.length) return setError('Add at least one asset.');
    if (!header.postingDate || !header.documentDate || !header.assetValueDate) return setError('Posting date, document date and asset value date are required.');
    if (header.journalRemark.trim().length > 100) return setError('The journal remark is at most 100 characters.');
    if (header.origin === 'AP_INVOICE' && !header.apBillId) return setError('Choose the A/P invoice (Origin No.).');
    const seen = new Set<string>();
    for (const l of filled) {
      const n = lines.indexOf(l) + 1;
      if (!l.assetId) return setError(`Line ${n}: choose the asset.`);
      if (seen.has(l.assetId)) return setError(`Line ${n}: the same asset is already on this document.`);
      seen.add(l.assetId);
      if (!isAmount(l.amount)) return setError(`Line ${n}: Total (LC) must be more than 0, with at most 2 decimals.`);
      if (header.origin === 'AP_INVOICE' && !l.apBillLineId) return setError(`Line ${n}: choose the A/P invoice line it capitalizes.`);
      if (l.quantity.trim() !== '' && !/^\d+$/.test(l.quantity.trim())) return setError(`Line ${n}: quantity is a whole number, 0 or more.`);
    }
    createMut.mutate({
      kind,
      origin: header.origin,
      apBillId: header.origin === 'AP_INVOICE' ? header.apBillId : undefined,
      baseCapitalizationId: isCredit && header.baseCapitalizationId ? header.baseCapitalizationId : undefined,
      depreciationAreaId: header.depreciationAreaId || undefined,
      seriesId: header.seriesId || undefined,
      reference: header.reference.trim() || undefined,
      postingDate: header.postingDate,
      documentDate: header.documentDate || undefined,
      assetValueDate: header.assetValueDate || undefined,
      journalRemark: header.journalRemark.trim() || undefined,
      remarks: header.remarks.trim() || undefined,
      lines: filled.map((l) => ({
        assetId: l.assetId,
        amount: num(l.amount),
        quantity: l.quantity.trim() === '' ? undefined : Number(l.quantity),
        apBillLineId: header.origin === 'AP_INVOICE' ? l.apBillLineId : undefined,
        remarks: l.remarks.trim() || undefined,
      })),
    });
  };

  const cancelDoc = () => {
    if (!doc) return;
    const reason = window.prompt(
      `Cancel ${doc.number}? Its journal entry is reversed and the assets return to their values before it. Reason (optional):`,
      '',
    );
    if (reason === null) return;
    cancelMut.mutate({ id: doc.id, reason: reason.trim() || undefined });
  };

  const lookupError = lookupsQuery.error instanceof Error ? `Could not load the document's dropdowns: ${lookupsQuery.error.message}` : '';
  const listError = listQuery.error instanceof Error ? `Could not load the documents: ${listQuery.error.message}` : '';
  const seriesLabel = (id: string) => {
    const s = lk?.series.find((x) => x.id === id);
    return s ? `${s.prefix ?? ''}${String(s.nextNumber).padStart(s.digits, '0')}` : '';
  };
  const lbl = (s: string) => <span className="text-[10.5px] text-[#333] w-28 shrink-0">{s}</span>;
  const isNew = mode === 'new';

  return (
    <ClassicWindow
      title={title}
      icon={isCredit ? <FileMinus2 className="w-3.5 h-3.5 text-gray-600" /> : <FilePlus2 className="w-3.5 h-3.5 text-gray-600" />}
      accent="#e8a01c"
      onClose={() => { if (!dirty || confirmDiscardUnsaved(`Closing ${title}`)) onClose(); }}
      onFocus={onFocus}
      windowState={windowState}
      onUpdateState={onUpdateState}
      minWidth={1000}
      minHeight={580}
      toolbar={
        <>
          <ToolBtn onClick={() => startNew()} disabled={busy || !can.post} title={can.post ? undefined : 'Needs financials.fixed_asset_document.create'}>
            <Plus className="w-3 h-3" /> New
          </ToolBtn>
          <ToolBtn danger onClick={cancelDoc} disabled={busy || !doc || doc.status !== 'POSTED' || !can.cancel || isNew}
            title={can.cancel ? 'Reverse this document' : 'Needs financials.fixed_asset_document.cancel'}>
            <Ban className="w-3 h-3" /> Cancel Document
          </ToolBtn>
          <ToolBtn onClick={() => { void listQuery.refetch(); void lookupsQuery.refetch(); void detailQuery.refetch(); }} title="Refresh">
            <RefreshCw className={cn('w-3 h-3', (listQuery.isFetching || lookupsQuery.isFetching) && 'animate-spin')} />
          </ToolBtn>
          <StatusNote error={error || lookupError || listError} status={status} />
        </>
      }
      footer={<><span>{docs.length} document{docs.length === 1 ? '' : 's'}</span><span>{title}</span></>}
    >
      <div className="flex flex-1 min-h-0">
        {/* Documents */}
        <div className="w-[230px] shrink-0 border-r border-[#d4d0c8] bg-white overflow-auto custom-scrollbar">
          <ListPlaceholder noCompany={!activeCompanyId} isLoading={listQuery.isLoading} isEmpty={!listQuery.isLoading && docs.length === 0} emptyText={`No ${title.toLowerCase()} documents yet. Click New.`} />
          {docs.map((d) => (
            <div key={d.id} onClick={() => { if (!discardOk('Opening another document')) return; setMode('browse'); setSelectedId(d.id); setError(''); setStatus(''); }}
              className={cn('px-2 py-1.5 border-b border-[#f0f0f0] cursor-default', selectedId === d.id && !isNew ? 'bg-[#ffed99]' : 'hover:bg-blue-50/60')}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] font-medium">{d.number}</span>
                <span className={cn('text-[8.5px] px-1 rounded-[1px]', d.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800')}>
                  {d.status === 'POSTED' ? 'Posted' : 'Cancelled'}
                </span>
              </div>
              <div className="text-[9.5px] text-gray-500">{day(d.postingDate)} · {money(d.total)} {d.currency}</div>
              <div className="text-[9.5px] text-gray-500 truncate">
                {d.origin === 'AP_INVOICE' ? `A/P ${d.apBill?.number ?? ''}` : 'Manual'} · {d._count.lines} line{d._count.lines === 1 ? '' : 's'}
              </div>
            </div>
          ))}
        </div>

        {/* Document */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#f0f0f0]">
          {!isNew && !doc && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400">
              {detailQuery.isLoading ? 'Loading…' : 'Select a document, or click New.'}
            </div>
          )}
          {(isNew || doc) && (
            <>
              {/* Header */}
              <div className="grid grid-cols-2 gap-x-10 px-4 py-3 shrink-0 border-b border-[#d4d0c8]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {lbl('Origin')}
                    {isNew ? (
                      <ClassicSel value={header.origin} disabled={!!base}
                        onChange={(e) => { setHeader((h) => ({ ...h, origin: e.target.value as CapitalizationOrigin, apBillId: '' })); setLines((ls) => ls.map((l) => ({ ...l, apBillLineId: '' }))); }}
                        className="w-40">
                        <option value="MANUAL">Manual</option>
                        <option value="AP_INVOICE">A/P Invoice</option>
                      </ClassicSel>
                    ) : <span className="text-[10.5px]">{doc!.origin === 'AP_INVOICE' ? 'A/P Invoice' : 'Manual'}</span>}
                    <span className="text-[10.5px] text-[#333] ml-3">Origin No.</span>
                    {isNew ? (
                      <ClassicSel value={header.apBillId} disabled={header.origin !== 'AP_INVOICE' || !!base}
                        onChange={(e) => { setHeader((h) => ({ ...h, apBillId: e.target.value })); setLines((ls) => ls.map((l) => ({ ...l, apBillLineId: '' }))); }}
                        className="flex-1">
                        <option value="">—</option>
                        {(lk?.apBills ?? []).map((b) => <option key={b.id} value={b.id}>{b.number} — {b.bp.cardName}</option>)}
                      </ClassicSel>
                    ) : <span className="text-[10.5px]">{doc!.apBill ? `${doc!.apBill.number} — ${doc!.apBill.bp.cardName}` : '—'}</span>}
                  </div>
                  {isNew && header.origin === 'AP_INVOICE' && !(lk?.apBills ?? []).length && (
                    <div className="text-[10px] text-gray-600 ml-[120px]">No posted A/P invoice has a line on an asset clearing account.</div>
                  )}
                  {isCredit && (
                    <div className="flex items-center gap-2">
                      {lbl('Base Document')}
                      {isNew ? (
                        <ClassicSel value={header.baseCapitalizationId} onChange={(e) => chooseBase(e.target.value)} className="flex-1">
                          <option value="">— none (credit freely, up to net book value)</option>
                          {(lk?.baseDocuments ?? []).map((b) => <option key={b.id} value={b.id}>{b.number} — {day(b.postingDate)} — {money(b.total)}</option>)}
                        </ClassicSel>
                      ) : doc!.baseCapitalization ? (
                        <button className="text-[10.5px] text-blue-700 underline" onClick={() => setSelectedId(doc!.baseCapitalization!.id)}>{doc!.baseCapitalization.number}</button>
                      ) : <span className="text-[10.5px]">—</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {lbl('Depreciation Area')}
                    {isNew ? (
                      <ClassicSel value={header.depreciationAreaId} onChange={(e) => setHeader((h) => ({ ...h, depreciationAreaId: e.target.value }))} className="w-64 bg-[#fffae6]">
                        <option value="">* (all areas)</option>
                        {(lk?.depreciationAreas ?? []).map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                      </ClassicSel>
                    ) : <span className="text-[10.5px]">{doc!.depreciationArea ? `${doc!.depreciationArea.code} — ${doc!.depreciationArea.name}` : '* (all areas)'}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {lbl('Reference')}
                    {isNew
                      ? <ClassicInput value={header.reference} maxLength={100} onChange={(e) => setHeader((h) => ({ ...h, reference: e.target.value }))} className="flex-1" />
                      : <span className="text-[10.5px]">{doc!.reference ?? '—'}</span>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <FieldRow label="No." labelWidth="120px">
                    {isNew ? (
                      <div className="flex gap-1">
                        <ClassicSel value={header.seriesId} onChange={(e) => setHeader((h) => ({ ...h, seriesId: e.target.value }))} className="w-28">
                          {(lk?.series ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </ClassicSel>
                        <ClassicInput value={seriesLabel(header.seriesId)} readOnly disabled className="w-28" />
                      </div>
                    ) : <span className="font-mono text-[11px] font-bold">{doc!.number}</span>}
                  </FieldRow>
                  <FieldRow label="Status" labelWidth="120px">
                    {isNew ? <span className="text-[10.5px] text-gray-500">Posted on Add</span> : (
                      <span className={cn('text-[9.5px] px-1.5 py-0.5 rounded-[1px]', doc!.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800')}>
                        {doc!.status === 'POSTED' ? 'Posted' : `Cancelled ${day(doc!.cancelledAt)}`}
                      </span>
                    )}
                  </FieldRow>
                  {([['Posting Date', 'postingDate'], ['Document Date', 'documentDate'], ['Asset Value Date', 'assetValueDate']] as const).map(([label, k]) => (
                    <FieldRow key={k} label={label} labelWidth="120px">
                      {isNew
                        ? <ClassicInput type="date" value={header[k]} onChange={(e) => setHeader((h) => ({ ...h, [k]: e.target.value }))} className="w-36" />
                        : <span className="text-[10.5px]">{day(doc![k])}</span>}
                    </FieldRow>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-0.5 px-4 pt-2 shrink-0">
                {(['Contents', 'Accounting'] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn('px-4 py-1 text-[10.5px] border border-b-0 rounded-t-[2px]', tab === t ? 'bg-white border-[#a0a0a0] font-bold' : 'bg-[#e5e5e5] border-[#d4d0c8] text-gray-600')}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-h-0 overflow-auto mx-4 bg-white border border-[#a0a0a0]">
                {tab === 'Contents' && (
                  <table className="w-full border-collapse text-[10.5px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#e5e5e5]">
                        {['#', 'Asset No.', 'Asset Description', ...(header.origin === 'AP_INVOICE' || doc?.origin === 'AP_INVOICE' ? ['A/P Invoice Line'] : []), 'Total (LC)', 'Quantity', 'Remarks', ''].map((h) => (
                          <th key={h} className="text-left px-2 py-1 border-r border-[#ccc] font-bold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {isNew && lines.map((l, i) => {
                        const a = assetById.get(l.assetId);
                        const bookArea = a?.areaValues.find((v) => v.areaId === (header.depreciationAreaId || lk?.depreciationAreas.find((x) => x.postsToGl)?.id));
                        return (
                          <tr key={l.key} className="border-b border-[#eee]">
                            <td className="px-2 py-0.5 bg-gray-50 text-center w-8">{i + 1}</td>
                            <td className="px-1 py-0.5 w-48">
                              <ClassicSel value={l.assetId} onChange={(e) => setLines((ls) => ls.map((x) => (x.key === l.key ? lineFor(e.target.value, { key: x.key, apBillLineId: x.apBillLineId }) : x)))} className="w-full bg-[#fffae6]">
                                <option value="">—</option>
                                {(lk?.assets ?? []).map((x) => <option key={x.id} value={x.id}>{x.code} — {x.name}</option>)}
                              </ClassicSel>
                            </td>
                            <td className="px-2 py-0.5">
                              {a ? (
                                <button className="text-left hover:underline" onClick={() => onOpenAsset?.(a.id)}>
                                  {a.name} <span className="text-gray-500">({a.assetClass.code}{isCredit && bookArea ? ` · NBV ${money(bookArea.netBookValue)}` : ''})</span>
                                </button>
                              ) : ''}
                            </td>
                            {header.origin === 'AP_INVOICE' && (
                              <td className="px-1 py-0.5 w-64">
                                <ClassicSel value={l.apBillLineId} disabled={!bill}
                                  onChange={(e) => {
                                    const bl = bill?.lines.find((x) => x.id === e.target.value);
                                    const open = bl ? (isCredit ? Number(bl.capitalized) : Number(bl.lineTotal) - Number(bl.capitalized)) : 0;
                                    setLine(l.key, { apBillLineId: e.target.value, ...(bl && !l.amount ? { amount: open > 0 ? String(open) : '' } : {}) });
                                  }}
                                  className="w-full">
                                  <option value="">—</option>
                                  {(bill?.lines ?? []).map((bl) => (
                                    <option key={bl.id} value={bl.id}>
                                      {bl.description} — {money(bl.lineTotal)} ({isCredit ? `${money(bl.capitalized)} capitalized` : `${money(Number(bl.lineTotal) - Number(bl.capitalized))} open`})
                                    </option>
                                  ))}
                                </ClassicSel>
                              </td>
                            )}
                            <td className="px-1 py-0.5 w-32">
                              <ClassicInput inputMode="decimal" value={l.amount} onChange={(e) => setLine(l.key, { amount: e.target.value })} className="w-full text-right" placeholder="0.00" />
                            </td>
                            <td className="px-1 py-0.5 w-20">
                              <ClassicInput inputMode="numeric" value={l.quantity} onChange={(e) => setLine(l.key, { quantity: e.target.value })} className="w-full text-right" />
                            </td>
                            <td className="px-1 py-0.5">
                              <ClassicInput value={l.remarks} maxLength={254} onChange={(e) => setLine(l.key, { remarks: e.target.value })} className="w-full" />
                            </td>
                            <td className="px-1 text-center w-8">
                              <button onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.key !== l.key) : [blankLine()]))} title="Remove line">
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {!isNew && doc && doc.lines.map((l, i) => (
                        <tr key={l.id} className="border-b border-[#eee]">
                          <td className="px-2 py-1 bg-gray-50 text-center w-8">{i + 1}</td>
                          <td className="px-2 py-1 font-mono">
                            <button className="text-blue-700 underline" onClick={() => onOpenAsset?.(l.asset.id)}>{l.asset.code}</button>
                          </td>
                          <td className="px-2 py-1">{l.asset.name} <span className="text-gray-500">({l.asset.assetClass.code})</span></td>
                          {doc.origin === 'AP_INVOICE' && <td className="px-2 py-1">{l.apBillLine ? `${l.apBillLine.description} — ${money(l.apBillLine.lineTotal)}` : '—'}</td>}
                          <td className="px-2 py-1 text-right font-mono">{money(l.amount)}</td>
                          <td className="px-2 py-1 text-right">{l.quantity}</td>
                          <td className="px-2 py-1">{l.remarks ?? ''}</td>
                          <td />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {tab === 'Accounting' && (
                  <div className="p-3 text-[10.5px]">
                    <table className="w-full border-collapse text-[10.5px] border border-[#ccc] mb-3">
                      <thead>
                        <tr className="bg-[#e4e4e4]">
                          <th className="text-left p-1 border-r border-[#ccc] w-56">Depreciation Area</th>
                          <th className="text-left p-1 border-r border-[#ccc]">Journal Remark</th>
                          <th className="text-left p-1 w-40">JE No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(isNew
                          ? (header.depreciationAreaId ? (lk?.depreciationAreas ?? []).filter((a) => a.id === header.depreciationAreaId) : lk?.depreciationAreas ?? [])
                          : doc?.depreciationArea ? [doc.depreciationArea] : (lk?.depreciationAreas ?? [])
                        ).map((a) => (
                          <tr key={a.id} className="border-t border-[#eee]">
                            <td className="p-1 border-r border-[#eee] font-mono">{a.code} — {a.name}{a.postsToGl ? '' : ' (statistical)'}</td>
                            <td className="p-1 border-r border-[#eee]">
                              {!a.postsToGl ? <span className="text-gray-400">no journal entry</span>
                                : isNew ? <ClassicInput value={header.journalRemark} maxLength={100} onChange={(e) => setHeader((h) => ({ ...h, journalRemark: e.target.value }))} className="w-full" />
                                  : doc?.journalRemark}
                            </td>
                            <td className="p-1">
                              {!a.postsToGl ? '—'
                                : isNew ? <span className="text-gray-400">after Add</span>
                                  : doc?.journalEntry
                                    ? <button className="text-blue-700 underline font-mono" onClick={() => onOpenJournalEntry?.(doc.journalEntry!.id)}>{doc.journalEntry.number}</button>
                                    : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {isNew ? (
                      postsToGl ? (
                        <>
                          <div className="mb-2 text-gray-600">Journal entry this document will post (from the asset classes' accounts):</div>
                          <JournalTable rows={preview.map((p, i) => ({ id: String(i), account: p.account, debit: p.debit, credit: p.credit }))} />
                        </>
                      ) : (
                        <div className="text-gray-600">Area {area?.code} is statistical: the assets are valued, nothing is posted to the G/L.</div>
                      )
                    ) : doc && (
                      <>
                        <div className="flex gap-6 mb-2">
                          <span>Depreciation Area: <b>{doc.depreciationArea ? doc.depreciationArea.code : '* (all areas)'}</b></span>
                          <span>
                            Journal Entry:{' '}
                            {doc.journalEntry
                              ? <button className="text-blue-700 underline font-mono" onClick={() => onOpenJournalEntry?.(doc.journalEntry!.id)}>{doc.journalEntry.number}</button>
                              : <b>none (statistical area only)</b>}
                          </span>
                          {doc.cancellationJournalEntry && (
                            <span>
                              Reversal:{' '}
                              <button className="text-blue-700 underline font-mono" onClick={() => onOpenJournalEntry?.(doc.cancellationJournalEntry!.id)}>
                                {doc.cancellationJournalEntry.number}
                              </button>{' '}({day(doc.cancellationJournalEntry.date)})
                            </span>
                          )}
                          {!!doc.creditMemos.length && <span>Credit memos: {doc.creditMemos.map((c) => c.number).join(', ')}</span>}
                        </div>
                        {doc.journalEntry && (
                          <JournalTable rows={doc.journalEntry.lines.map((l) => ({ id: l.id, account: l.account, debit: Number(l.debit), credit: Number(l.credit), description: l.description }))} />
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 shrink-0">
                <div className="flex justify-between items-start gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10.5px] text-[#333]">Remarks</span>
                    {isNew ? (
                      <textarea value={header.remarks} maxLength={5000} onChange={(e) => setHeader((h) => ({ ...h, remarks: e.target.value }))}
                        className="h-14 w-72 border border-[#d4d0c8] bg-white p-1 text-[10.5px] outline-none focus:border-orange-400 resize-none" />
                    ) : <div className="text-[10.5px] w-72 min-h-[3.5rem]">{doc?.remarks ?? '—'}</div>}
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    {isNew && (
                      <button onClick={() => setLines((ls) => [...ls, blankLine()])} className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white hover:bg-[#ffed99] mr-4">
                        <Plus className="w-3 h-3" /> Add Line
                      </button>
                    )}
                    <span className="text-[11px] font-bold">Total</span>
                    <ClassicInput value={money(isNew ? total : doc?.total) || '0.00'} readOnly disabled className="w-36 text-right font-bold" />
                    <span className="text-[10.5px]">{lk?.currency ?? doc?.currency ?? ''}</span>
                  </div>
                </div>
                {isNew && (
                  <div className="flex gap-2 mt-2">
                    <YellowBtn onClick={add} disabled={busy}>{createMut.isPending ? 'Posting…' : 'Add'}</YellowBtn>
                    <GreyBtn onClick={() => { if (!discardOk('Cancel')) return; setMode('browse'); setError(''); }}>Cancel</GreyBtn>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};

const JournalTable: React.FC<{ rows: { id: string; account: { code: string; name: string } | null; debit: number; credit: number; description?: string | null }[] }> = ({ rows }) => {
  const dr = rows.reduce((s, r) => s + r.debit, 0);
  const cr = rows.reduce((s, r) => s + r.credit, 0);
  return (
    <table className="w-full border-collapse text-[10.5px] border border-[#ccc]">
      <thead>
        <tr className="bg-[#e4e4e4]">
          <th className="text-left p-1 border-r border-[#ccc]">G/L Account</th>
          <th className="text-left p-1 border-r border-[#ccc]">Details</th>
          <th className="text-right p-1 border-r border-[#ccc]">Debit</th>
          <th className="text-right p-1">Credit</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
            <td className="p-1 border-r border-[#eee] font-mono">{r.account ? `${r.account.code} ${r.account.name}` : '—'}</td>
            <td className="p-1 border-r border-[#eee]">{r.description ?? ''}</td>
            <td className="p-1 border-r border-[#eee] text-right font-mono">{r.debit ? money(r.debit) : ''}</td>
            <td className="p-1 text-right font-mono">{r.credit ? money(r.credit) : ''}</td>
          </tr>
        ))}
        {!rows.length && <tr><td colSpan={4} className="p-2 text-gray-500">Choose assets and amounts to see the posting.</td></tr>}
        <tr className="bg-[#f0f0f0] font-bold border-t border-[#ccc]">
          <td className="p-1" colSpan={2}>Totals</td>
          <td className="p-1 text-right font-mono">{money(dr)}</td>
          <td className="p-1 text-right font-mono">{money(cr)}</td>
        </tr>
      </tbody>
    </table>
  );
};
