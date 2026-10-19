import React, { useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  documentPrintingApi,
  type DocumentPrintingCriteria,
  type PrintDocumentType,
  type PrintListRow,
  type PrintPropertyMode,
} from '../../../api/financials.api';
import { ClassicWindow, ListPlaceholder, StatusNote, type WindowState } from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, GreyBtn, YellowBtn, cn } from '../../ui/ClassicERPUI';
import { DocumentPrintingResultsWindow } from './DocumentPrintingResultsWindow';

interface DocumentPrintingSelectionWindowProps {
  onClose: () => void;
  onFocus: () => void;
  windowState: WindowState;
  onUpdateState: (state: Partial<WindowState>) => void;
}

/**
 * SAP's Document Type list. Only the types the backend keeps documents for
 * carry a `key`; the rest are shown, disabled, so the list reads like SAP's.
 */
const TYPE_OPTIONS: { group: string; items: { label: string; key?: PrintDocumentType }[] }[] = [
  {
    group: 'Sales',
    items: [
      { label: 'Sales Quotations' }, { label: 'Sales Orders' }, { label: 'Deliveries' },
      { label: 'Return Request' }, { label: 'Returns' }, { label: 'A/R Down Payment' },
      { label: 'A/R Invoices', key: 'ar_invoice' }, { label: 'A/R Credit Memos' },
    ],
  },
  {
    group: 'Purchase',
    items: [
      { label: 'Purchase Request' }, { label: 'Purchase Quotation' }, { label: 'Purchase Orders' },
      { label: 'Goods Receipt PO' }, { label: 'Goods Return Request' }, { label: 'Goods Return' },
      { label: 'A/P Down Payment' }, { label: 'A/P Invoices', key: 'ap_invoice' }, { label: 'A/P Credit Memos' },
    ],
  },
  {
    group: 'Financials',
    items: [
      { label: 'Budget Scenarios', key: 'budget_scenario' },
      { label: 'Journal Entries', key: 'journal_entry' },
    ],
  },
  {
    group: 'Banking',
    items: [
      { label: 'Incoming Payments', key: 'incoming_payment' }, { label: 'Deposits' },
      { label: 'Outgoing Payments', key: 'outgoing_payment' }, { label: 'Checks for Payment' },
    ],
  },
];

const TYPE_LABEL: Record<PrintDocumentType, string> = {
  journal_entry: 'Journal Entries',
  ar_invoice: 'A/R Invoices',
  incoming_payment: 'Incoming Payments',
  ap_invoice: 'A/P Invoices',
  outgoing_payment: 'Outgoing Payments',
  budget_scenario: 'Budget Scenarios',
};

/** Which partners a type carries — decides which group filter applies. */
const SIDE: Record<PrintDocumentType, 'customer' | 'vendor' | 'any'> = {
  journal_entry: 'any',
  ar_invoice: 'customer',
  incoming_payment: 'customer',
  ap_invoice: 'vendor',
  outgoing_payment: 'vendor',
  budget_scenario: 'any',
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const initialForm = () => {
  const now = new Date();
  return {
    documentType: 'outgoing_payment' as PrintDocumentType,
    postingDateFrom: iso(new Date(now.getFullYear(), now.getMonth(), 1)),
    postingDateTo: iso(now),
    seriesId: '',
    accountFrom: '', accountTo: '',
    bpCodeFrom: '', bpCodeTo: '',
    customerGroupId: '', vendorGroupId: '',
    properties: [] as number[],
    propertiesMode: 'ignore' as PrintPropertyMode,
    onlyNotPrinted: false,
    onlyNotEmailed: false,
    useLayoutSettings: true,
    internalNumberFrom: '', internalNumberTo: '',
    copies: '1',
  };
};
type Form = ReturnType<typeof initialForm>;

const errText = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

interface ResultsState {
  key: number;
  criteria: DocumentPrintingCriteria;
  rows: PrintListRow[];
  truncated: boolean;
  copies: number;
  useLayoutSettings: boolean;
}

/**
 * Financials → Document Printing — Selection Criteria.
 *
 * Picks the posted documents of one type to print. OK finds them and opens
 * the Document Printing list, where they are previewed, printed or e-mailed.
 * Fields that do not apply to the chosen type are disabled rather than
 * silently ignored.
 */
export const DocumentPrintingSelectionWindow: React.FC<DocumentPrintingSelectionWindowProps> = ({
  onClose,
  onFocus,
  windowState,
  onUpdateState,
}) => {
  const { activeCompanyId } = useAuth();
  const noCompany = !activeCompanyId;
  const [form, setForm] = useState<Form>(initialForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showProps, setShowProps] = useState(false);
  const [results, setResults] = useState<ResultsState | null>(null);
  const [resultsState, setResultsState] = useState<WindowState>(() => ({
    x: windowState.x + 60, y: windowState.y + 30, width: 860, height: 480,
    isMinimized: false, isMaximized: false, zIndex: windowState.zIndex + 1,
  }));

  const lookupsQ = useQuery({
    queryKey: ['document-printing-lookups', activeCompanyId],
    queryFn: documentPrintingApi.lookups,
    enabled: !noCompany,
  });
  const lookups = lookupsQ.data;
  const allowed = useMemo(
    () => new Set((lookups?.documentTypes ?? []).filter((t) => t.allowed).map((t) => t.key)),
    [lookups],
  );

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setError('');
    setForm((f) => ({ ...f, [k]: v }));
  };

  const side = SIDE[form.documentType];
  const isJournal = form.documentType === 'journal_entry';

  // Series and groups belong to particular types; clear them when they stop applying.
  useEffect(() => {
    setForm((f) => ({
      ...f,
      seriesId: f.documentType === 'journal_entry' ? f.seriesId : '',
      customerGroupId: SIDE[f.documentType] === 'vendor' ? '' : f.customerGroupId,
      vendorGroupId: SIDE[f.documentType] === 'customer' ? '' : f.vendorGroupId,
    }));
  }, [form.documentType]);

  const validate = (): string | null => {
    if (!allowed.has(form.documentType)) return `You are not allowed to print ${TYPE_LABEL[form.documentType]}`;
    const pairs: [string, string, string][] = [
      ['Posting Date', form.postingDateFrom, form.postingDateTo],
      ['Account', form.accountFrom.trim(), form.accountTo.trim()],
      ['BP Code', form.bpCodeFrom.trim(), form.bpCodeTo.trim()],
    ];
    for (const [label, from, to] of pairs) {
      if (from && to && from > to) return `${label} "From" must not be after "To"`;
    }
    for (const v of [form.internalNumberFrom, form.internalNumberTo]) {
      if (v.trim() && !/^\d+$/.test(v.trim())) return 'Internal Number must be a whole number';
    }
    if (
      form.internalNumberFrom.trim() && form.internalNumberTo.trim() &&
      Number(form.internalNumberFrom) > Number(form.internalNumberTo)
    ) return 'Internal Number "From" must not be after "To"';
    const copies = Number(form.copies);
    if (!Number.isInteger(copies) || copies < 1 || copies > 99) return 'No. of Copies must be between 1 and 99';
    if (form.propertiesMode !== 'ignore' && form.properties.length === 0) {
      return 'Choose at least one property, or set Properties to Ignore';
    }
    return null;
  };

  const criteria = (): DocumentPrintingCriteria => {
    const opt = (s: string) => s.trim() || undefined;
    const num = (s: string) => (s.trim() ? Number(s) : undefined);
    return {
      documentType: form.documentType,
      postingDateFrom: opt(form.postingDateFrom),
      postingDateTo: opt(form.postingDateTo),
      seriesId: isJournal ? opt(form.seriesId) : undefined,
      accountFrom: opt(form.accountFrom),
      accountTo: opt(form.accountTo),
      bpCodeFrom: opt(form.bpCodeFrom),
      bpCodeTo: opt(form.bpCodeTo),
      customerGroupId: side !== 'vendor' ? opt(form.customerGroupId) : undefined,
      vendorGroupId: side !== 'customer' ? opt(form.vendorGroupId) : undefined,
      properties: form.propertiesMode !== 'ignore' ? form.properties : undefined,
      propertiesMode: form.propertiesMode !== 'ignore' ? form.propertiesMode : undefined,
      onlyNotPrinted: form.onlyNotPrinted || undefined,
      onlyNotEmailed: form.onlyNotEmailed || undefined,
      internalNumberFrom: num(form.internalNumberFrom),
      internalNumberTo: num(form.internalNumberTo),
    };
  };

  const onOk = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const c = criteria();
      const res = await documentPrintingApi.search(c);
      if (res.rows.length === 0) {
        setError('No matching records found');
        return;
      }
      setResults((prev) => ({
        key: (prev?.key ?? 0) + 1,
        criteria: c,
        rows: res.rows,
        truncated: res.truncated,
        copies: Number(form.copies),
        useLayoutSettings: form.useLayoutSettings,
      }));
      setResultsState((s) => ({ ...s, isMinimized: false, zIndex: windowState.zIndex + 1 }));
    } catch (e) {
      setError(errText(e, 'Could not find documents'));
    } finally {
      setBusy(false);
    }
  };

  const label = 'text-[10.5px] text-[#333] whitespace-nowrap';
  const row = 'grid grid-cols-[130px_1fr] items-center gap-x-3 mb-1';
  const range = (from: keyof Form, to: keyof Form, opts: { type?: string; disabled?: boolean; width?: string } = {}) => (
    <div className="flex items-center gap-2">
      <ClassicInput
        type={opts.type ?? 'text'}
        className={cn(opts.width ?? 'w-32', 'disabled:bg-[#f4f4f4]')}
        disabled={opts.disabled}
        value={form[from] as string}
        onChange={(e) => set(from, e.target.value as never)}
      />
      <span className={label}>To</span>
      <ClassicInput
        type={opts.type ?? 'text'}
        className={cn(opts.width ?? 'w-32', 'disabled:bg-[#f4f4f4]')}
        disabled={opts.disabled}
        value={form[to] as string}
        onChange={(e) => set(to, e.target.value as never)}
      />
    </div>
  );
  const check = (k: 'onlyNotPrinted' | 'onlyNotEmailed' | 'useLayoutSettings', text: string) => (
    <label className="flex items-center gap-2 cursor-pointer mb-1">
      <input type="checkbox" className="w-3.5 h-3.5 accent-orange-500" checked={form[k]} onChange={(e) => set(k, e.target.checked)} />
      <span className={label}>{text}</span>
    </label>
  );

  return (
    <>
      <ClassicWindow
        title="Document Printing - Selection Criteria"
        icon={<Printer className="w-3.5 h-3.5 text-gray-600" />}
        windowState={windowState}
        onUpdateState={onUpdateState}
        onFocus={onFocus}
        onClose={onClose}
        minWidth={560}
        minHeight={470}
        footer={
          <>
            <span className="flex items-center">
              <StatusNote error={error || (lookupsQ.error ? errText(lookupsQ.error, 'Could not load lookups') : '')} />
            </span>
            <span />
          </>
        }
      >
        {noCompany ? (
          <ListPlaceholder noCompany />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 relative">
            {/* Document type, dates, series */}
            <div className={row}>
              <span className={label}>Document Type</span>
              <ClassicSel
                className="w-full"
                value={form.documentType}
                onChange={(e) => set('documentType', e.target.value as PrintDocumentType)}
              >
                {TYPE_OPTIONS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((it) => (
                      <option
                        key={it.label}
                        value={it.key ?? `unavailable:${it.label}`}
                        disabled={!it.key || (lookups ? !allowed.has(it.key) : false)}
                      >
                        {it.label}
                        {!it.key ? ' (not available yet)' : lookups && !allowed.has(it.key) ? ' (no permission)' : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </ClassicSel>
            </div>
            <div className={row}>
              <span className={label}>Posting Date From</span>
              {range('postingDateFrom', 'postingDateTo', { type: 'date', width: 'w-32' })}
            </div>
            <div className={row}>
              <span className={label}>Series</span>
              <ClassicSel
                className="w-full disabled:bg-[#f4f4f4]"
                disabled={!isJournal}
                value={form.seriesId}
                onChange={(e) => set('seriesId', e.target.value)}
                title={isJournal ? '' : 'Series can only be chosen for journal entries'}
              >
                <option value="">All</option>
                {isJournal && lookups?.series.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </ClassicSel>
            </div>

            {/* Account, partner, groups, properties */}
            <div className="pt-3">
              <div className={row}>
                <span className={label}>Account From</span>
                {range('accountFrom', 'accountTo')}
              </div>
              <div className={row}>
                <span className={label}>BP Code From</span>
                {range('bpCodeFrom', 'bpCodeTo')}
              </div>
              <div className={row}>
                <span className={label}>Customer Group</span>
                <ClassicSel
                  className="w-full disabled:bg-[#f4f4f4]"
                  disabled={side === 'vendor'}
                  value={form.customerGroupId}
                  onChange={(e) => set('customerGroupId', e.target.value)}
                >
                  <option value="">All</option>
                  {lookups?.customerGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </ClassicSel>
              </div>
              <div className={row}>
                <span className={label}>Vendor Group</span>
                <ClassicSel
                  className="w-full disabled:bg-[#f4f4f4]"
                  disabled={side === 'customer'}
                  value={form.vendorGroupId}
                  onChange={(e) => set('vendorGroupId', e.target.value)}
                >
                  <option value="">All</option>
                  {lookups?.vendorGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </ClassicSel>
              </div>
              <div className={row}>
                <YellowBtn className="py-0.5" onClick={() => setShowProps(true)}>
                  Properties{form.properties.length ? ` (${form.properties.length})` : ''}
                </YellowBtn>
                <ClassicSel
                  className="w-full"
                  value={form.propertiesMode}
                  onChange={(e) => set('propertiesMode', e.target.value as PrintPropertyMode)}
                >
                  <option value="ignore">Ignore</option>
                  <option value="and">And</option>
                  <option value="or">Or</option>
                </ClassicSel>
              </div>
            </div>

            {/* Status and printer options */}
            <div className="pt-2">
              {check('onlyNotPrinted', 'Only Documents Still to Be Printed')}
              {check('onlyNotEmailed', 'Only Documents Still to Be E-Mailed')}
              <div className="h-2" />
              {check('useLayoutSettings', 'Obtain printer settings from default printing layout')}
            </div>

            {/* Number range and copies */}
            <div className="pt-3">
              <div className={row}>
                <span className={label}>Internal Number From</span>
                {range('internalNumberFrom', 'internalNumberTo')}
              </div>
              <div className={row}>
                <span className={label}>No. of Copies</span>
                <ClassicInput
                  type="number"
                  min={1}
                  max={99}
                  className="w-32"
                  value={form.copies}
                  onChange={(e) => set('copies', e.target.value)}
                />
              </div>
            </div>

            {showProps && (
              <PropertiesDialog
                selected={form.properties}
                onCancel={() => setShowProps(false)}
                onOk={(props) => {
                  setShowProps(false);
                  setForm((f) => ({
                    ...f,
                    properties: props,
                    // Picking properties with the filter still on Ignore would do nothing.
                    propertiesMode: props.length && f.propertiesMode === 'ignore' ? 'and' : props.length ? f.propertiesMode : 'ignore',
                  }));
                  setError('');
                }}
              />
            )}
          </div>
        )}

        <div className="h-10 px-4 bg-[#f0f0f0] border-t border-[#ccc] flex items-center gap-2 shrink-0">
          <YellowBtn onClick={() => void onOk()} disabled={busy || noCompany || lookupsQ.isLoading} className="disabled:opacity-50 min-w-[70px]">
            {busy ? 'Searching…' : 'OK'}
          </YellowBtn>
          <GreyBtn onClick={onClose} className="min-w-[70px]">Cancel</GreyBtn>
        </div>
      </ClassicWindow>

      {results && lookups && (
        <DocumentPrintingResultsWindow
          key={results.key}
          criteria={results.criteria}
          typeLabel={TYPE_LABEL[results.criteria.documentType]}
          initialRows={results.rows}
          truncated={results.truncated}
          lookups={lookups}
          copies={results.copies}
          useLayoutSettings={results.useLayoutSettings}
          windowState={resultsState}
          onUpdateState={(p) => setResultsState((s) => ({ ...s, ...p }))}
          onFocus={() => setResultsState((s) => ({ ...s, zIndex: windowState.zIndex + 1 }))}
          onClose={() => setResults(null)}
        />
      )}
    </>
  );
};

/** SAP's 64 business partner properties, ticked to filter by. */
const PropertiesDialog: React.FC<{
  selected: number[];
  onOk: (props: number[]) => void;
  onCancel: () => void;
}> = ({ selected, onOk, onCancel }) => {
  const [picked, setPicked] = useState<Set<number>>(() => new Set(selected));
  const toggle = (n: number) =>
    setPicked((p) => {
      const next = new Set(p);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  return (
    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[80]">
      <div className="bg-[#ececec] border border-[#404040]/60 shadow-lg w-[420px]">
        <div className="h-[22px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-b border-gray-400 px-2 flex items-center text-[11px] font-medium">
          Properties
        </div>
        <div className="p-3 grid grid-cols-4 gap-x-3 gap-y-0.5 max-h-[280px] overflow-y-auto bg-white m-2 border border-[#d4d0c8]">
          {Array.from({ length: 64 }, (_, i) => i + 1).map((n) => (
            <label key={n} className="flex items-center gap-1.5 text-[10.5px] cursor-pointer">
              <input type="checkbox" className="w-3 h-3 accent-orange-500" checked={picked.has(n)} onChange={() => toggle(n)} />
              Property {n}
            </label>
          ))}
        </div>
        <div className="flex gap-2 px-3 pb-3">
          <YellowBtn onClick={() => onOk([...picked].sort((a, b) => a - b))}>OK</YellowBtn>
          <GreyBtn onClick={onCancel}>Cancel</GreyBtn>
          <div className="flex-1" />
          <GreyBtn onClick={() => setPicked(new Set())}>Clear All</GreyBtn>
        </div>
      </div>
    </div>
  );
};
