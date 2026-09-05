import React, { useMemo, useState } from 'react';
import { FileCog, RefreshCw, RotateCcw, Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { settingsApi, numberingApi } from '../../../api/administration.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

type Tab = 'general' | 'perDocument' | 'electronic';
type Values = Record<string, string | number | boolean>;

interface Spec {
  key: string;
  label: string;
  type: 'checkbox' | 'select' | 'number' | 'text';
  default: string | number | boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  hint?: string;
  dependsOn?: string;
}

/**
 * The General tab applies to every document type.
 *
 * It is stored as a document-settings row with a null document type, which is
 * the shape the backend already uses for "applies to all". A per-type row then
 * overrides only the keys it names.
 */
const GENERAL: { title: string; fields: Spec[] }[] = [
  {
    title: 'Gross Profit',
    fields: [
      { key: 'calculateGrossProfit', label: 'Calculate Gross Profit', type: 'checkbox', default: true },
      {
        key: 'basePriceOrigin', label: 'Base Price Origin', type: 'select', default: 'lastPurchase',
        options: [
          { value: 'lastPurchase', label: 'Last Purchase Price' },
          { value: 'lastEvaluated', label: 'Last Evaluated Price' },
          { value: 'itemCost', label: 'Item Cost' },
          { value: 'priceList', label: 'Price List' },
        ],
        dependsOn: 'calculateGrossProfit',
      },
      {
        key: 'defaultGrossProfitPercent', label: 'Default Gross Profit % for Service Documents',
        type: 'number', default: 0, min: 0, max: 100, dependsOn: 'calculateGrossProfit',
      },
      {
        key: 'grossProfitBasis', label: 'Calculate % Gross Profit As', type: 'select', default: 'salesPrice',
        options: [
          { value: 'salesPrice', label: 'Profit / Sales Price' },
          { value: 'basePrice', label: 'Profit / Base Price' },
        ],
        dependsOn: 'calculateGrossProfit',
      },
    ],
  },
  {
    title: 'Remarks & Display',
    fields: [
      {
        key: 'documentRemarksInclude', label: 'Document Remarks Include', type: 'select', default: 'baseDocumentNumber',
        options: [
          { value: 'baseDocumentNumber', label: 'Base Document Number' },
          { value: 'manualOnly', label: 'Manual Remarks Only' },
          { value: 'bpReference', label: 'BP Reference Number' },
        ],
      },
      {
        key: 'salesBomDisplay', label: 'For a Sales BOM in Documents, Display', type: 'select', default: 'parentOnly',
        options: [
          { value: 'parentOnly', label: 'Price and Total for Parent Item Only' },
          { value: 'components', label: 'Price for Component Items' },
        ],
      },
      { key: 'displayRoundingRemark', label: 'Display Rounding Remark', type: 'checkbox', default: false },
      { key: 'useWarehouseAddress', label: 'Use Warehouse Address', type: 'checkbox', default: false },
      { key: 'manageFreightInDocuments', label: 'Manage Freight in Documents', type: 'checkbox', default: false },
      {
        key: 'displayCancelledInReports',
        label: 'Display Cancelled and Cancellation Documents in Reports',
        type: 'checkbox', default: true,
      },
    ],
  },
  {
    title: 'Controls',
    fields: [
      {
        key: 'glBalanceOutsideRange', label: 'G/L Account Balance Outside Allowed Range',
        type: 'select', default: 'warning',
        options: [
          { value: 'ignore', label: 'Without Warning' },
          { value: 'warning', label: 'Warning Only' },
          { value: 'block', label: 'Block Posting' },
        ],
      },
      {
        key: 'inventoryOutsideRange', label: 'Release / Receipt of Inventory Outside Defined Range',
        type: 'select', default: 'warning',
        options: [
          { value: 'ignore', label: 'Without Warning' },
          { value: 'warning', label: 'Warning Only' },
          { value: 'block', label: 'Block Release / Receipt' },
        ],
      },
      {
        key: 'blockNegativeInventoryBy', label: 'Block Negative Inventory By',
        type: 'select', default: 'document',
        options: [
          { value: 'document', label: 'By Document' },
          { value: 'currency', label: 'By Currency' },
        ],
      },
      {
        key: 'blockEarlierPostingDate', label: 'Block Documents with an Earlier Posting Date',
        type: 'checkbox', default: false,
      },
      {
        key: 'allowFuturePostingDate', label: 'Allow a Future Posting Date',
        type: 'checkbox', default: true,
      },
      {
        key: 'maxDaysForCancelling',
        label: 'Max. Days for Cancelling Documents Before or After Posting',
        type: 'number', default: 0, min: 0, max: 3650,
        hint: '0 means no limit.',
      },
    ],
  },
  {
    title: 'Exchange Rate & Journals',
    fields: [
      {
        key: 'apExchangeRateBaseDate', label: 'Exchange Rate Base Date (A/P Documents)',
        type: 'select', default: 'postingDate',
        options: [
          { value: 'postingDate', label: 'Posting Date' },
          { value: 'documentDate', label: 'Document Date' },
        ],
      },
      {
        key: 'splitJournalByDocumentLines', label: 'Split Journal Entry Posting by Document Lines',
        type: 'checkbox', default: false,
      },
      {
        key: 'useDocumentRateWhenCopying',
        label: 'Use Document Exchange Rate When Copying to a Target Document',
        type: 'checkbox', default: true,
      },
    ],
  },
  {
    title: 'Attachments',
    fields: [
      { key: 'copyAttachmentsToTarget', label: 'Copy Attachments from Base to Target Document', type: 'checkbox', default: true },
      { key: 'copyAttachmentsFromBom', label: 'Copy Attachments from BOM to Production Order', type: 'checkbox', default: false },
      { key: 'doNotOverwriteSameFileName', label: 'Do Not Overwrite Attachments with the Same File Name', type: 'checkbox', default: true },
    ],
  },
];

/** Per-document-type overrides. */
const PER_DOCUMENT: Spec[] = [
  { key: 'blockUnbalancedFcJournalEntry', label: 'Block Unbalanced FC Journal Entry', type: 'checkbox', default: true },
  { key: 'blockMultipleCurrencyTransactions', label: 'Block Multiple Currency Transactions', type: 'checkbox', default: false },
  { key: 'blockEditingTotalsInSystemCurrency', label: 'Block Editing of Totals in System Currency', type: 'checkbox', default: false },
  { key: 'blockPostingDateEditingPerRow', label: 'Block Posting Date Editing per Row', type: 'checkbox', default: false },
  { key: 'blockDocDateUpdateAfterPosting', label: 'Block Updating of Doc. Date After Posting per Row', type: 'checkbox', default: false },
  { key: 'useAutomaticTax', label: 'Use Automatic Tax', type: 'checkbox', default: true },
  { key: 'blockEarlierPostingDate', label: 'Block Documents with an Earlier Posting Date', type: 'checkbox', default: false },
  { key: 'mandatoryRemarks', label: 'Mandatory Remarks', type: 'checkbox', default: false },
  { key: 'approvalRequired', label: 'Require Approval Before Posting', type: 'checkbox', default: false },
];

const ELECTRONIC: Spec[] = [
  { key: 'enableElectronicDocuments', label: 'Enable Electronic Documents', type: 'checkbox', default: false },
  {
    key: 'electronicFormat', label: 'Electronic Format', type: 'select', default: 'ubl',
    options: [
      { value: 'ubl', label: 'UBL 2.1' },
      { value: 'facturae', label: 'Facturae' },
      { value: 'custom', label: 'Custom' },
    ],
    dependsOn: 'enableElectronicDocuments',
  },
  { key: 'electronicExportFolder', label: 'Export Folder', type: 'text', default: '', dependsOn: 'enableElectronicDocuments' },
  { key: 'signElectronicDocuments', label: 'Digitally Sign Electronic Documents', type: 'checkbox', default: false, dependsOn: 'enableElectronicDocuments' },
  { key: 'certificateAlias', label: 'Certificate Alias', type: 'text', default: '', dependsOn: 'signElectronicDocuments' },
];

const seed = (specs: Spec[], stored: Record<string, unknown> | undefined): Values => {
  const out: Values = {};
  for (const s of specs) {
    const v = stored?.[s.key];
    out[s.key] = v === undefined || v === null
      ? s.default
      : s.type === 'checkbox' ? Boolean(v)
      : s.type === 'number' ? Number(v)
      : String(v);
  }
  return out;
};

const ALL_GENERAL_SPECS = GENERAL.flatMap((s) => s.fields);

export const DocumentSettingsWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [tab, setTab] = useState<Tab>('general');
  const [documentType, setDocumentType] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [edits, setEdits] = useState<Values | null>(null);

  const docTypesQuery = useQuery({
    queryKey: ['numbering-document-types', companyId],
    queryFn: () => numberingApi.documentTypes(),
    enabled: !!companyId,
  });

  // The General tab reads the null-documentType row; the other two read the row
  // for the selected type. Same endpoint either way.
  const scope = tab === 'general' ? undefined : documentType || undefined;

  const settingsQuery = useQuery({
    queryKey: ['document-settings', companyId, scope ?? '__general__'],
    queryFn: () => settingsApi.getDocumentSettings(scope),
    enabled: !!companyId && (tab === 'general' || !!documentType),
  });

  const specs = tab === 'general' ? ALL_GENERAL_SPECS
    : tab === 'perDocument' ? PER_DOCUMENT
    : ELECTRONIC;

  const stored = useMemo(() => seed(specs, settingsQuery.data), [specs, settingsQuery.data]);
  const values = edits ?? stored;
  const dirty = !!edits && Object.keys(edits).some((k) => edits[k] !== stored[k]);

  const setValue = (key: string, value: string | number | boolean) =>
    setEdits((prev) => ({ ...(prev ?? stored), [key]: value }));

  const saveMut = useMutation({
    mutationFn: () => {
      if (!edits) return Promise.resolve({});
      if (tab !== 'general' && !documentType) {
        return Promise.reject(new Error('Pick a document type first.'));
      }
      const changed: Values = {};
      for (const k of Object.keys(edits)) {
        if (edits[k] !== stored[k]) changed[k] = edits[k];
      }
      if (!Object.keys(changed).length) return Promise.resolve({});
      // The backend merges into the existing row, so only the changed keys go
      // over the wire and nothing another tab owns is disturbed.
      return settingsApi.saveDocumentSettings(changed, scope);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['document-settings'] });
      setEdits(null);
      setError('');
      setStatus('Document settings saved.');
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : 'The server rejected those settings.');
      setStatus('');
    },
  });

  const renderField = (s: Spec) => {
    if (s.dependsOn && !values[s.dependsOn]) return null;
    const value = values[s.key];

    if (s.type === 'checkbox') {
      return (
        <div key={s.key}>
          <label className="flex items-start gap-2 text-[11px] cursor-pointer py-0.5">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 mt-[1px]"
              checked={Boolean(value)}
              onChange={(e) => setValue(s.key, e.target.checked)}
            />
            <span>{s.label}</span>
          </label>
          {s.hint && <div className="text-[9.5px] text-gray-500 pl-[22px]">{s.hint}</div>}
        </div>
      );
    }

    return (
      <div key={s.key}>
        <div className="grid grid-cols-[minmax(180px,1fr)_200px] items-center gap-2 py-0.5">
          <span className="text-[11px] text-gray-700">{s.label}</span>
          {s.type === 'select' ? (
            <ClassicSel
              value={String(value ?? '')}
              onChange={(e) => setValue(s.key, e.target.value)}
              className="w-full"
            >
              {s.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </ClassicSel>
          ) : (
            <ClassicInput
              type={s.type === 'number' ? 'number' : 'text'}
              min={s.min}
              max={s.max}
              value={String(value ?? '')}
              onChange={(e) =>
                setValue(s.key, s.type === 'number'
                  ? (e.target.value === '' ? '' : Number(e.target.value))
                  : e.target.value)
              }
              className={cn('w-full', s.type === 'number' && 'text-right')}
            />
          )}
        </div>
        {s.hint && <div className="text-[9.5px] text-gray-500">{s.hint}</div>}
      </div>
    );
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'perDocument', label: 'Per Document' },
    { key: 'electronic', label: 'Electronic Documents' },
  ];

  return (
    <ClassicWindow
      title="Document Settings"
      icon={<FileCog className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={820}
      minHeight={580}
      toolbar={
        <>
          <ToolBtn onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !dirty}>
            <Save className="w-3 h-3" /> {saveMut.isPending ? 'Saving…' : 'Save'}
          </ToolBtn>
          <ToolBtn onClick={() => { setEdits(null); setError(''); }} disabled={!dirty}>
            <RotateCcw className="w-3 h-3" /> Discard
          </ToolBtn>
          <ToolBtn onClick={() => settingsQuery.refetch()} title="Reload">
            <RefreshCw className={cn('w-3 h-3', settingsQuery.isFetching && 'animate-spin')} />
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>
            {tab === 'general' ? 'Applies to every document type' : documentType || 'No document type selected'}
            {dirty ? ' · unsaved changes' : ''}
          </span>
          <span>Document Settings</span>
        </>
      }
    >
      <div className="shrink-0 flex px-2 pt-1.5 bg-[#ececec] border-b border-[#d4d0c8]">
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <div
              key={key}
              onClick={() => { setTab(key); setEdits(null); setError(''); setStatus(''); }}
              style={{ marginBottom: active ? '-1px' : 0 }}
              className={cn(
                'relative px-5 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border-l border-t border-r',
                active
                  ? 'bg-white border-[#d4d0c8] text-black z-10'
                  : 'bg-gradient-to-b from-[#f0f0f0] to-[#e0e0e0] border-gray-300 text-gray-600',
              )}
            >
              {active && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ffd700] rounded-t-[3px]" />}
              {label}
            </div>
          );
        })}
      </div>

      {tab !== 'general' && (
        <div className="shrink-0 bg-[#f7f7f7] border-b border-[#d4d0c8] px-3 py-2">
          <div className="grid grid-cols-[100px_260px] items-center gap-2">
            <span className="text-[11px] text-gray-700">Document</span>
            <ClassicSel
              value={documentType}
              onChange={(e) => { setDocumentType(e.target.value); setEdits(null); }}
              className="w-full"
            >
              <option value="">— pick a document type —</option>
              {(docTypesQuery.data ?? []).map((d) => (
                <option key={d.documentType} value={d.documentType}>{d.documentType}</option>
              ))}
            </ClassicSel>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto bg-white p-3 custom-scrollbar">
        {!companyId ? (
          <div className="text-[10px] text-gray-500 italic">
            No company selected. Open{' '}
            <span className="font-medium not-italic">Administration → Choose Company</span> first.
          </div>
        ) : tab !== 'general' && !documentType ? (
          <div className="text-[10.5px] text-gray-400">
            Pick a document type above. Each type stores its own overrides, and only the fields you
            change are written — the rest keep following the General tab.
          </div>
        ) : settingsQuery.isLoading ? (
          <div className="text-[10.5px] text-gray-400">Loading…</div>
        ) : tab === 'general' ? (
          <div className="space-y-4 max-w-[860px]">
            {GENERAL.map((section) => (
              <div key={section.title}>
                <div className="text-[11px] font-bold text-gray-800 border-b border-[#e5e5e5] pb-0.5 mb-1.5">
                  {section.title}
                </div>
                <div className="grid grid-cols-2 gap-x-8">
                  {section.fields.map(renderField)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-[700px] space-y-0.5">
            {specs.map(renderField)}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
        <YellowBtn
          onClick={() => {
            if (!dirty) { onClose(); return; }
            saveMut.mutate(undefined, { onSuccess: () => onClose() });
          }}
          disabled={saveMut.isPending || !companyId}
        >
          {saveMut.isPending ? 'Saving…' : 'Update'}
        </YellowBtn>
        <GreyBtn onClick={onClose}>Cancel</GreyBtn>
      </div>
    </ClassicWindow>
  );
};
