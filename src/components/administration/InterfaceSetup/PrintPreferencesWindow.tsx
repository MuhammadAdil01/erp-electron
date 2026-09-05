import React, { useMemo, useState } from 'react';
import { Printer, RefreshCw, RotateCcw, Save } from 'lucide-react';
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

type Tab = 'general' | 'perDocument' | 'perReport';

/**
 * The General tab is company-wide and lives in a settings group.
 *
 * The per-document tab is different: its values belong to one document type, so
 * they are stored as document settings under a `print` key. Putting them in the
 * settings group would need a key per document type per field and would make
 * "reset the print preferences for A/R invoices" impossible to express.
 */
const PRINT_GROUP = 'print_preferences';

const GENERAL_FIELDS = [
  { key: 'maxRowsPerPage', label: 'Max. Rows per Page', type: 'number', default: 99, min: 1, max: 999 },
  { key: 'printWithVerticalCompression', label: 'Print With Vertical Compression (%)', type: 'number', default: 100, min: 10, max: 100 },
  { key: 'topMarginCm', label: 'Top Margin (cm)', type: 'number', default: 0, min: 0, max: 20 },
  { key: 'bottomMarginCm', label: 'Bottom Margin (cm)', type: 'number', default: 0, min: 0, max: 20 },
  { key: 'maxRowsPerPageInExport', label: 'Max. Rows per Page in Export', type: 'number', default: 10, min: 1, max: 999 },
] as const;

const GENERAL_CHECKS = [
  { key: 'printTextAsPicture', label: 'Print Text as Picture', default: false },
  { key: 'printOnLetterPaper', label: 'Print on Letter Paper', default: false },
  { key: 'printGenerationMessagePld', label: 'Print Generation Message for PLD', default: true },
  { key: 'printGenerationMessageCrystal', label: 'Print Generation Message for Crystal Reports', default: true },
  { key: 'printDraftWatermark', label: 'Print Draft Watermark on Draft Documents', default: true },
  { key: 'generatePdfWhenPrinting', label: 'Generate PDF When Printing', default: false },
  { key: 'printCancelledWatermark', label: 'Print Cancelled Watermark on Applicable Documents', default: true },
  { key: 'useSystemPrintPreference', label: 'Use System Print Preference for Crystal Reports', default: false },
  { key: 'useAttachmentsFolderForExport', label: 'Use Attachments Folder as Default Path for Export PDFs', default: false },
  { key: 'attachExportedPdfsToDocuments', label: 'Attach Exported PDFs to Marketing Documents, Payments and Deposits', default: false },
] as const;

/** The per-document keys, all stored inside one `print` object on the type. */
const PER_DOCUMENT_DEFAULTS = {
  permanentRemarks: '',
  printDocument: true,
  emailDocument: false,
  exportToPdf: false,
  emailSubject: '',
  emailBody: '',
  copies: 1,
};

const PER_REPORT_DEFAULTS = {
  emailSubject: '',
  emailBody: '',
  includeAttachment: true,
};

type Values = Record<string, string | number | boolean>;

export const PrintPreferencesWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [tab, setTab] = useState<Tab>('general');
  const [documentType, setDocumentType] = useState('');
  const [reportKey, setReportKey] = useState('aging');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [generalEdits, setGeneralEdits] = useState<Values | null>(null);
  const [docEdits, setDocEdits] = useState<Values | null>(null);
  const [reportEdits, setReportEdits] = useState<Values | null>(null);

  const generalQuery = useQuery({
    queryKey: ['settings-group', companyId, PRINT_GROUP],
    queryFn: () => settingsApi.getGroup(PRINT_GROUP),
    enabled: !!companyId,
  });

  const docTypesQuery = useQuery({
    queryKey: ['numbering-document-types', companyId],
    queryFn: () => numberingApi.documentTypes(),
    enabled: !!companyId,
  });

  const docSettingsQuery = useQuery({
    queryKey: ['document-settings', companyId, documentType],
    queryFn: () => settingsApi.getDocumentSettings(documentType || undefined),
    enabled: !!companyId && tab === 'perDocument' && !!documentType,
  });

  const reportSettingsQuery = useQuery({
    queryKey: ['settings-group', companyId, `print_report_${reportKey}`],
    queryFn: () => settingsApi.getGroup(`print_report_${reportKey}`),
    enabled: !!companyId && tab === 'perReport',
  });

  const generalStored: Values = useMemo(() => {
    const out: Values = {};
    for (const f of GENERAL_FIELDS) {
      const v = generalQuery.data?.[f.key];
      out[f.key] = v === undefined || v === null ? f.default : Number(v);
    }
    for (const c of GENERAL_CHECKS) {
      const v = generalQuery.data?.[c.key];
      out[c.key] = v === undefined || v === null ? c.default : Boolean(v);
    }
    const sn = generalQuery.data?.printingLayoutSerialNo;
    out.printingLayoutSerialNo = sn ? String(sn) : 'serial_no';
    return out;
  }, [generalQuery.data]);

  const docStored: Values = useMemo(() => {
    const print = (docSettingsQuery.data?.print ?? {}) as Record<string, unknown>;
    const out: Values = { ...PER_DOCUMENT_DEFAULTS };
    for (const k of Object.keys(PER_DOCUMENT_DEFAULTS)) {
      const v = print[k];
      if (v === undefined || v === null) continue;
      const fallback = PER_DOCUMENT_DEFAULTS[k as keyof typeof PER_DOCUMENT_DEFAULTS];
      out[k] = typeof fallback === 'boolean' ? Boolean(v)
        : typeof fallback === 'number' ? Number(v)
        : String(v);
    }
    return out;
  }, [docSettingsQuery.data]);

  const reportStored: Values = useMemo(() => {
    const data = reportSettingsQuery.data ?? {};
    const out: Values = { ...PER_REPORT_DEFAULTS };
    for (const k of Object.keys(PER_REPORT_DEFAULTS)) {
      const v = data[k];
      if (v === undefined || v === null) continue;
      const fallback = PER_REPORT_DEFAULTS[k as keyof typeof PER_REPORT_DEFAULTS];
      out[k] = typeof fallback === 'boolean' ? Boolean(v) : String(v);
    }
    return out;
  }, [reportSettingsQuery.data]);

  const general = generalEdits ?? generalStored;
  const doc = docEdits ?? docStored;
  const report = reportEdits ?? reportStored;

  const dirty =
    tab === 'general' ? !!generalEdits
    : tab === 'perDocument' ? !!docEdits
    : !!reportEdits;

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected those preferences.');
    setStatus('');
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      if (tab === 'general') {
        if (!generalEdits) return;
        await settingsApi.saveGroup(PRINT_GROUP, generalEdits);
        return;
      }
      if (tab === 'perDocument') {
        if (!docEdits) return;
        if (!documentType) throw new Error('Pick a document type first.');
        // Nested under `print` so the print preferences for a type live beside
        // that type's other settings without colliding with them.
        await settingsApi.saveDocumentSettings({ print: docEdits }, documentType);
        return;
      }
      if (!reportEdits) return;
      await settingsApi.saveGroup(`print_report_${reportKey}`, reportEdits);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['settings-group'] });
      void qc.invalidateQueries({ queryKey: ['document-settings'] });
      setGeneralEdits(null); setDocEdits(null); setReportEdits(null);
      setError('');
      setStatus('Print preferences saved.');
    },
    onError: onErr,
  });

  const resetMut = useMutation({
    mutationFn: () => settingsApi.resetGroup(PRINT_GROUP),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['settings-group', companyId, PRINT_GROUP] });
      setGeneralEdits(null);
      setError('');
      setStatus('General print preferences restored to defaults.');
    },
    onError: onErr,
  });

  const setGeneral = (key: string, value: string | number | boolean) =>
    setGeneralEdits((prev) => ({ ...(prev ?? generalStored), [key]: value }));
  const setDoc = (key: string, value: string | number | boolean) =>
    setDocEdits((prev) => ({ ...(prev ?? docStored), [key]: value }));
  const setReport = (key: string, value: string | number | boolean) =>
    setReportEdits((prev) => ({ ...(prev ?? reportStored), [key]: value }));

  const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="grid grid-cols-[280px_180px] items-center gap-2 py-0.5">
      <span className="text-[11px] text-gray-700">{label}</span>
      {children}
    </div>
  );

  const Check: React.FC<{
    checked: boolean; label: string; onChange: (v: boolean) => void;
  }> = ({ checked, label, onChange }) => (
    <label className="flex items-start gap-2 text-[11px] cursor-pointer py-0.5">
      <input
        type="checkbox"
        className="w-3.5 h-3.5 mt-[1px]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );

  const TABS: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'perDocument', label: 'Per Document' },
    { key: 'perReport', label: 'Per Report' },
  ];

  return (
    <ClassicWindow
      title="Print Preferences"
      icon={<Printer className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={780}
      minHeight={560}
      toolbar={
        <>
          <ToolBtn onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !dirty}>
            <Save className="w-3 h-3" /> {saveMut.isPending ? 'Saving…' : 'Save'}
          </ToolBtn>
          <ToolBtn
            onClick={() => { setGeneralEdits(null); setDocEdits(null); setReportEdits(null); setError(''); }}
            disabled={!dirty}
          >
            <RotateCcw className="w-3 h-3" /> Discard
          </ToolBtn>
          {tab === 'general' && (
            <ToolBtn
              danger
              onClick={() => {
                if (!window.confirm('Restore the General print preferences to their defaults?')) return;
                resetMut.mutate();
              }}
              disabled={resetMut.isPending || !companyId}
            >
              Reset
            </ToolBtn>
          )}
          <ToolBtn
            onClick={() => {
              void generalQuery.refetch();
              void docSettingsQuery.refetch();
              void reportSettingsQuery.refetch();
            }}
            title="Reload"
          >
            <RefreshCw className={cn('w-3 h-3', generalQuery.isFetching && 'animate-spin')} />
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>{dirty ? 'Unsaved changes' : 'Saved'}</span>
          <span>Print Preferences</span>
        </>
      }
    >
      <div className="shrink-0 flex px-2 pt-1.5 bg-[#ececec] border-b border-[#d4d0c8]">
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <div
              key={key}
              onClick={() => { setTab(key); setError(''); setStatus(''); }}
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

      <div className="flex-1 min-h-0 overflow-auto bg-white p-3 custom-scrollbar">
        {!companyId ? (
          <div className="text-[10px] text-gray-500 italic">
            No company selected. Open{' '}
            <span className="font-medium not-italic">Administration → Choose Company</span> first.
          </div>
        ) : tab === 'general' ? (
          generalQuery.isLoading ? (
            <div className="text-[10.5px] text-gray-400">Loading…</div>
          ) : (
            <div className="space-y-1 max-w-[720px]">
              {GENERAL_FIELDS.map((f) => (
                <Row key={f.key} label={f.label}>
                  <ClassicInput
                    type="number"
                    min={f.min}
                    max={f.max}
                    value={String(general[f.key] ?? '')}
                    onChange={(e) =>
                      setGeneral(f.key, e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full text-right"
                  />
                </Row>
              ))}

              <Row label="When Printing Layout Including SN, Print">
                <ClassicSel
                  value={String(general.printingLayoutSerialNo ?? 'serial_no')}
                  onChange={(e) => setGeneral('printingLayoutSerialNo', e.target.value)}
                  className="w-full"
                >
                  <option value="serial_no">Serial No.</option>
                  <option value="mfr_serial_no">Mfr. Serial No.</option>
                  <option value="lot_number">Lot Number</option>
                </ClassicSel>
              </Row>

              <div className="pt-2 mt-2 border-t border-[#e5e5e5]">
                {GENERAL_CHECKS.map((c) => (
                  <Check
                    key={c.key}
                    label={c.label}
                    checked={Boolean(general[c.key])}
                    onChange={(v) => setGeneral(c.key, v)}
                  />
                ))}
              </div>
            </div>
          )
        ) : tab === 'perDocument' ? (
          <div className="space-y-2 max-w-[720px]">
            <Row label="Document">
              <ClassicSel
                value={documentType}
                onChange={(e) => { setDocumentType(e.target.value); setDocEdits(null); }}
                className="w-full"
              >
                <option value="">— pick a document type —</option>
                {(docTypesQuery.data ?? []).map((d) => (
                  <option key={d.documentType} value={d.documentType}>{d.documentType}</option>
                ))}
              </ClassicSel>
            </Row>

            {!documentType ? (
              <div className="text-[10.5px] text-gray-400 pt-2">
                Pick a document type to edit its print preferences. Each type is stored
                separately, so changing one never affects another.
              </div>
            ) : docSettingsQuery.isLoading ? (
              <div className="text-[10.5px] text-gray-400">Loading…</div>
            ) : (
              <>
                <Row label="Permanent Remarks for Printing">
                  <ClassicInput
                    value={String(doc.permanentRemarks ?? '')}
                    onChange={(e) => setDoc('permanentRemarks', e.target.value)}
                    className="w-full"
                  />
                </Row>
                <Row label="Copies">
                  <ClassicInput
                    type="number"
                    min={1}
                    max={99}
                    value={String(doc.copies ?? 1)}
                    onChange={(e) => setDoc('copies', Number(e.target.value))}
                    className="w-full text-right"
                  />
                </Row>

                <div className="pt-2 mt-1 border-t border-[#e5e5e5]">
                  <Check label="Print Document" checked={Boolean(doc.printDocument)}
                    onChange={(v) => setDoc('printDocument', v)} />
                  <Check label="E-Mail Document" checked={Boolean(doc.emailDocument)}
                    onChange={(v) => setDoc('emailDocument', v)} />
                  <Check label="Export to PDF" checked={Boolean(doc.exportToPdf)}
                    onChange={(v) => setDoc('exportToPdf', v)} />
                </div>

                <div className="pt-2 mt-1 border-t border-[#e5e5e5] space-y-1">
                  <Row label="E-Mail Subject">
                    <ClassicInput
                      value={String(doc.emailSubject ?? '')}
                      onChange={(e) => setDoc('emailSubject', e.target.value)}
                      className="w-full"
                    />
                  </Row>
                  <div>
                    <div className="text-[11px] text-gray-700 mb-0.5">E-Mail Body</div>
                    <textarea
                      value={String(doc.emailBody ?? '')}
                      onChange={(e) => setDoc('emailBody', e.target.value)}
                      rows={5}
                      className="w-full border border-gray-400 px-1 py-0.5 text-[11px] font-sans"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-w-[720px]">
            <Row label="Report">
              <ClassicSel
                value={reportKey}
                onChange={(e) => { setReportKey(e.target.value); setReportEdits(null); }}
                className="w-full"
              >
                <option value="aging">Aging</option>
                <option value="trial_balance">Trial Balance</option>
                <option value="profit_and_loss">Profit and Loss</option>
                <option value="balance_sheet">Balance Sheet</option>
                <option value="general_ledger">General Ledger</option>
                <option value="document_journal">Document Journal</option>
              </ClassicSel>
            </Row>

            {reportSettingsQuery.isLoading ? (
              <div className="text-[10.5px] text-gray-400">Loading…</div>
            ) : (
              <>
                <Row label="E-Mail Subject">
                  <ClassicInput
                    value={String(report.emailSubject ?? '')}
                    onChange={(e) => setReport('emailSubject', e.target.value)}
                    className="w-full"
                  />
                </Row>
                <div>
                  <div className="text-[11px] text-gray-700 mb-0.5">E-Mail Body</div>
                  <textarea
                    value={String(report.emailBody ?? '')}
                    onChange={(e) => setReport('emailBody', e.target.value)}
                    rows={5}
                    className="w-full border border-gray-400 px-1 py-0.5 text-[11px] font-sans"
                  />
                </div>
                <Check
                  label="Attach the rendered report to the e-mail"
                  checked={Boolean(report.includeAttachment)}
                  onChange={(v) => setReport('includeAttachment', v)}
                />
              </>
            )}
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
