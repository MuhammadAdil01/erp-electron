import React, { useEffect, useMemo, useState } from 'react';
import { Building, RefreshCw, RotateCcw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { settingsApi, type CompanyDetails } from '../../../api/administration.api';
import { accountsApi, currenciesApi } from '../../../api/financials.api';
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

type Tab = 'general' | 'accounting' | 'basic';

/**
 * The settings group the SAP-shaped fields live in.
 *
 * The Company row owns the handful of values the rest of the system posts
 * against — name, currency, fiscal year, the default control accounts. Address
 * lines, tax registration numbers and initialization switches are presentation
 * and policy, and giving each of them a column would be a migration per field
 * for no gain. They live as (group, key) settings, which the backend already
 * merges rather than replaces, so one tab saving cannot wipe another's keys.
 */
const DETAILS_GROUP = 'company_details';

/** Every SAP field this window persists, with its default. */
const DETAIL_DEFAULTS: Record<string, string | boolean> = {
  // General
  address: '', streetPoBox: '', streetNo: '', block: '', buildingFloorRoom: '',
  city: '', zipCode: '', county: '', state: '',
  internetAddress: '', printingHeader: '', activeManager: '',
  aliasName: '', telephone1: '', telephone2: '', fax: '', email: '', gln: '',
  foreignCompanyName: '', foreignAddress: '', foreignPrintingHeader: '',
  // Accounting Data
  taxOffice: '', federalTaxId1: '', federalTaxId2: '', federalTaxId3: '',
  additionalId: '', companyTaxRate: '0.00', exemptionNumber: '',
  taxDeductionNumber: '', taxOfficial: '',
  useDeferredTax: false, applyExchangeRateOnDeferredTax: false,
  taxRateDetermination: 'posting_date',
  holidays: '', extendedTaxReporting: false, eoriNumber: '',
  // Basic Initialization
  chartOfAccountsTemplate: 'User-Defined',
  defaultAccountCurrency: 'all',
  displayCreditBalanceNegative: false,
  useSegmentationAccounts: false,
  multiLanguageSupport: false,
  usePerpetualInventory: false,
  itemGroupsValuationMethod: 'FIFO',
  manageItemCostPerWarehouse: false,
  usePurchaseAccountsPosting: false,
  allowStockReleaseWithoutCost: false,
  manageSerialBatchCostBy: 'itemGroup',
  serialBatchValuationMethod: 'FIFO',
  separateNetGrossPriceMode: false,
  orderingParty: '',
  defaultBankCountry: '', defaultBank: '', defaultAccountNo: '', defaultBranch: '',
  installBankStatementProcessing: false,
  enableFixedAssets: false,
  calculateDepreciationBy: 'month',
  enableMultipleBranches: false,
};

const TABS: { key: Tab; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'accounting', label: 'Accounting Data' },
  { key: 'basic', label: 'Basic Initialization' },
];

type FormState = {
  // Company columns
  name: string;
  country: string;
  currency: string;
  locale: string;
  timezone: string;
  fiscalYearStart: string;
  industry: string;
  logoUrl: string;
  defaultArAccountId: string;
  defaultApAccountId: string;
  defaultCashAccountId: string;
  defaultTaxPayableAccountId: string;
  defaultTaxRecoverableAccountId: string;
  defaultRevenueAccountId: string;
  defaultExpenseAccountId: string;
  // Settings-group keys
  details: Record<string, string | boolean>;
};

const COMPANY_COLUMN_KEYS = [
  'name', 'country', 'currency', 'locale', 'timezone', 'fiscalYearStart', 'industry', 'logoUrl',
  'defaultArAccountId', 'defaultApAccountId', 'defaultCashAccountId',
  'defaultTaxPayableAccountId', 'defaultTaxRecoverableAccountId',
  'defaultRevenueAccountId', 'defaultExpenseAccountId',
] as const;

const buildForm = (
  company: CompanyDetails | undefined,
  details: Record<string, unknown> | undefined,
): FormState => ({
  name: company?.name ?? '',
  country: company?.country ?? '',
  currency: company?.currency ?? '',
  locale: company?.locale ?? '',
  timezone: company?.timezone ?? '',
  fiscalYearStart: company?.fiscalYearStart ? String(company.fiscalYearStart) : '',
  industry: company?.industry ?? '',
  logoUrl: company?.logoUrl ?? '',
  defaultArAccountId: company?.defaultArAccountId ?? '',
  defaultApAccountId: company?.defaultApAccountId ?? '',
  defaultCashAccountId: company?.defaultCashAccountId ?? '',
  defaultTaxPayableAccountId: company?.defaultTaxPayableAccountId ?? '',
  defaultTaxRecoverableAccountId: company?.defaultTaxRecoverableAccountId ?? '',
  defaultRevenueAccountId: company?.defaultRevenueAccountId ?? '',
  defaultExpenseAccountId: company?.defaultExpenseAccountId ?? '',
  details: Object.fromEntries(
    Object.entries(DETAIL_DEFAULTS).map(([k, fallback]) => {
      const stored = details?.[k];
      if (stored === undefined || stored === null) return [k, fallback];
      return [k, typeof fallback === 'boolean' ? Boolean(stored) : String(stored)];
    }),
  ),
});

export const CompanyDetailsWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [tab, setTab] = useState<Tab>('general');
  const [lang, setLang] = useState<'local' | 'foreign'>('local');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<FormState>(() => buildForm(undefined, undefined));
  const [loaded, setLoaded] = useState(false);

  const companyQuery = useQuery({
    queryKey: ['company-details', companyId],
    queryFn: () => settingsApi.getCompany(),
    enabled: !!companyId,
  });

  const detailsQuery = useQuery({
    queryKey: ['settings-group', companyId, DETAILS_GROUP],
    queryFn: () => settingsApi.getGroup(DETAILS_GROUP),
    enabled: !!companyId,
  });

  const accountsQuery = useQuery({
    queryKey: ['accounts', companyId],
    queryFn: () => accountsApi.getAll({ take: 1000 }),
    enabled: !!companyId,
  });

  const currenciesQuery = useQuery({
    queryKey: ['currencies', companyId],
    queryFn: () => currenciesApi.getAll({ take: 300 }),
    enabled: !!companyId,
  });

  // Seeded once per load rather than on every render: re-seeding from the query
  // would throw away whatever the user has typed each time it refetches.
  useEffect(() => {
    if (loaded) return;
    if (!companyQuery.data || !detailsQuery.data) return;
    setForm(buildForm(companyQuery.data, detailsQuery.data));
    setLoaded(true);
  }, [companyQuery.data, detailsQuery.data, loaded]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setDetail = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, details: { ...f.details, [key]: value } }));

  const saveMut = useMutation({
    mutationFn: async () => {
      // The data has two homes — the Company row for what the ledger reads, and
      // a settings group for everything else — but it is sent as one request so
      // the server can write both in a single transaction. Two requests meant
      // the first could commit and the second fail, leaving the window showing
      // an error over a save that had half happened.
      const companyPayload: Partial<CompanyDetails> = {};
      for (const key of COMPANY_COLUMN_KEYS) {
        const raw = form[key];
        if (key === 'fiscalYearStart') {
          if (raw) companyPayload.fiscalYearStart = Number(raw);
          continue;
        }
        // Empty strings are omitted rather than sent: the DTO rejects an empty
        // logoUrl as a malformed URL, and clearing a default account is done by
        // choosing a different one, not by blanking the field.
        if (typeof raw === 'string' && raw.trim()) {
          (companyPayload as Record<string, unknown>)[key] = raw.trim();
        }
      }

      return settingsApi.saveCompanyDetails({
        company: companyPayload,
        details: form.details,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['company-details'] });
      void qc.invalidateQueries({ queryKey: ['settings-group'] });
      void qc.invalidateQueries({ queryKey: ['choose-company'] });
      setError('');
      setStatus('Company details saved.');
      // The window closes on a successful save, which is what the Update button
      // has always implied and did not do.
      onClose();
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : 'The server rejected that change.');
      setStatus('');
    },
  });

  const handleSave = () => {
    if (!companyId) { setError('No company selected — open Choose Company first.'); return; }
    if (!form.name.trim()) { setError('Company name is required.'); return; }
    if (form.currency && !/^[A-Z]{3}$/.test(form.currency)) {
      setError('Currency must be a three-letter ISO code, e.g. USD.');
      return;
    }
    if (form.country && !/^[A-Z]{2}$/.test(form.country)) {
      setError('Country must be a two-letter ISO code, e.g. PK.');
      return;
    }
    const rate = String(form.details.companyTaxRate ?? '').trim();
    if (rate && !/^\d*\.?\d+$/.test(rate)) {
      setError('Company tax rate must be a number.');
      return;
    }
    setError('');
    saveMut.mutate();
  };

  const accounts = accountsQuery.data ?? [];
  const postableAccounts = useMemo(
    () => accounts.filter((a) => !a.isTitle),
    [accounts],
  );

  const AccountSelect: React.FC<{ field: keyof FormState; label: string }> = ({ field, label }) => (
    <FieldRow label={label} labelWidth="180px">
      <ClassicSel
        value={String(form[field] ?? '')}
        onChange={(e) => setField(field, e.target.value as never)}
        className="w-full"
      >
        <option value="">— not set —</option>
        {postableAccounts.map((a) => (
          <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
        ))}
      </ClassicSel>
    </FieldRow>
  );

  const Text: React.FC<{ k: string; label: string; placeholder?: string; width?: string }> = ({
    k, label, placeholder, width = '150px',
  }) => (
    <FieldRow label={label} labelWidth={width}>
      <ClassicInput
        value={String(form.details[k] ?? '')}
        onChange={(e) => setDetail(k, e.target.value)}
        className="w-full"
        placeholder={placeholder}
      />
    </FieldRow>
  );

  const Check: React.FC<{ k: string; label: string }> = ({ k, label }) => (
    <label className="flex items-center gap-2 text-[11px] cursor-pointer py-0.5">
      <input
        type="checkbox"
        className="w-3.5 h-3.5"
        checked={Boolean(form.details[k])}
        onChange={(e) => setDetail(k, e.target.checked)}
      />
      {label}
    </label>
  );

  const isLoading = companyQuery.isLoading || detailsQuery.isLoading;

  return (
    <ClassicWindow
      title="Company Details"
      icon={<Building className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={860}
      minHeight={620}
      toolbar={
        <>
          <ToolBtn
            onClick={() => {
              void companyQuery.refetch();
              void detailsQuery.refetch();
              setLoaded(false);
              setStatus(''); setError('');
            }}
            title="Reload from the server"
          >
            <RefreshCw className={cn('w-3 h-3', (companyQuery.isFetching || detailsQuery.isFetching) && 'animate-spin')} />
            Reload
          </ToolBtn>
          <ToolBtn
            onClick={() => {
              setForm(buildForm(companyQuery.data, detailsQuery.data));
              setStatus('Unsaved changes discarded.'); setError('');
            }}
            disabled={!loaded}
          >
            <RotateCcw className="w-3 h-3" /> Discard Changes
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>{companyQuery.data?.name ?? (companyId ? 'Loading…' : 'No company selected')}</span>
          <span>Company Details</span>
        </>
      }
    >
      {/* ── Tabs ── */}
      <div className="shrink-0 flex px-2 pt-1.5 bg-[#ececec] border-b border-[#d4d0c8]">
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <div
              key={key}
              onClick={() => setTab(key)}
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
            No company selected. Open <span className="font-medium not-italic">Administration → Choose Company</span> first.
          </div>
        ) : isLoading ? (
          <div className="text-[10.5px] text-gray-400">Loading company details…</div>
        ) : (
          <>
            {/* ── GENERAL ── */}
            {tab === 'general' && (
              <div className="space-y-3">
                <div className="flex gap-1">
                  {(['local', 'foreign'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={cn(
                        'px-3 py-0.5 text-[10.5px] border border-[#d4d0c8] rounded-[1px]',
                        lang === l ? 'bg-[#ffed99] font-bold' : 'bg-white hover:bg-gray-50',
                      )}
                    >
                      {l === 'local' ? 'Local Language' : 'Foreign Language'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 max-w-[900px]">
                  {lang === 'local' ? (
                    <>
                      <FieldRow label="Company Name" labelWidth="150px" required>
                        <ClassicInput
                          value={form.name}
                          onChange={(e) => setField('name', e.target.value)}
                          className="w-full bg-[#fffbd0]"
                        />
                      </FieldRow>
                      <Text k="address" label="Address" />
                      <Text k="streetPoBox" label="Street/PO Box" />
                      <Text k="streetNo" label="Street No." />
                      <Text k="block" label="Block" />
                      <Text k="buildingFloorRoom" label="Building/Floor/Room" />
                      <Text k="city" label="City" />
                      <Text k="zipCode" label="Zip Code" />
                      <Text k="county" label="County" />
                      <Text k="state" label="State" />

                      <FieldRow label="Country/Region" labelWidth="150px">
                        <ClassicInput
                          value={form.country}
                          onChange={(e) => setField('country', e.target.value.toUpperCase().slice(0, 2))}
                          className="w-full"
                          placeholder="PK"
                        />
                      </FieldRow>
                      <Text k="internetAddress" label="Internet Address" />
                      <Text k="printingHeader" label="Printing Header" />
                      <Text k="activeManager" label="Active Manager" />
                      <Text k="aliasName" label="Alias Name" />
                      <Text k="telephone1" label="Telephone 1" />
                      <Text k="telephone2" label="Telephone 2" />
                      <Text k="fax" label="Fax" />
                      <Text k="email" label="E-Mail" />
                      <Text k="gln" label="GLN" />

                      <FieldRow label="Locale" labelWidth="150px">
                        <ClassicInput
                          value={form.locale}
                          onChange={(e) => setField('locale', e.target.value)}
                          className="w-full"
                          placeholder="en-US"
                        />
                      </FieldRow>
                      <FieldRow label="Timezone" labelWidth="150px">
                        <ClassicInput
                          value={form.timezone}
                          onChange={(e) => setField('timezone', e.target.value)}
                          className="w-full"
                          placeholder="Asia/Karachi"
                        />
                      </FieldRow>
                    </>
                  ) : (
                    <>
                      <Text k="foreignCompanyName" label="Company Name" />
                      <Text k="foreignAddress" label="Address" />
                      <Text k="foreignPrintingHeader" label="Printing Header" />
                      <div className="col-span-2 text-[9.5px] text-gray-600">
                        The foreign-language block is stored alongside the local one, so switching
                        tabs never overwrites the other language's values.
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── ACCOUNTING DATA ── */}
            {tab === 'accounting' && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 max-w-[900px]">
                <Text k="taxOffice" label="Tax Office" />
                <Text k="federalTaxId1" label="Federal Tax ID 1" />
                <Text k="federalTaxId2" label="Federal Tax ID 2" />
                <Text k="federalTaxId3" label="Federal Tax ID 3" />
                <Text k="additionalId" label="Additional ID" />

                <FieldRow label="Company Tax Rate" labelWidth="150px">
                  <ClassicInput
                    value={String(form.details.companyTaxRate ?? '')}
                    onChange={(e) => setDetail('companyTaxRate', e.target.value)}
                    className="w-full text-right font-mono"
                    inputMode="decimal"
                  />
                </FieldRow>

                <Text k="exemptionNumber" label="Exemption Number" />
                <Text k="taxDeductionNumber" label="Tax Deduction Number" />
                <Text k="taxOfficial" label="Tax Official" />
                <Text k="eoriNumber" label="EORI Number" />
                <Text k="holidays" label="Holidays" placeholder="Australian Holidays" />

                <FieldRow label="Tax Rate Determination" labelWidth="150px">
                  <ClassicSel
                    value={String(form.details.taxRateDetermination ?? 'posting_date')}
                    onChange={(e) => setDetail('taxRateDetermination', e.target.value)}
                    className="w-full"
                  >
                    <option value="posting_date">Posting Date</option>
                    <option value="document_date">Document Date</option>
                    <option value="due_date">Due Date</option>
                  </ClassicSel>
                </FieldRow>

                <div className="col-span-2 mt-2 border-t border-[#e5e5e5] pt-2">
                  <Check k="useDeferredTax" label="Use Deferred Tax" />
                  <Check k="applyExchangeRateOnDeferredTax" label="Apply Exchange Rate on Deferred Tax" />
                  <Check k="extendedTaxReporting" label="Extended Tax Reporting" />
                </div>

                <div className="col-span-2 mt-3">
                  <div className="text-[11px] font-bold mb-1">Default Control Accounts</div>
                  <div className="text-[9.5px] text-gray-600 mb-2">
                    These are the accounts AR, AP and tax posting use. They live on the company
                    record rather than in settings so a posting routine never has to look them up
                    through a settings read.
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <AccountSelect field="defaultArAccountId" label="A/R Control Account" />
                    <AccountSelect field="defaultApAccountId" label="A/P Control Account" />
                    <AccountSelect field="defaultCashAccountId" label="Default Cash Account" />
                    <AccountSelect field="defaultTaxPayableAccountId" label="Tax Payable Account" />
                    <AccountSelect field="defaultTaxRecoverableAccountId" label="Tax Recoverable Account" />
                    <AccountSelect field="defaultRevenueAccountId" label="Default Revenue Account" />
                    <AccountSelect field="defaultExpenseAccountId" label="Default Expense Account" />
                  </div>
                </div>
              </div>
            )}

            {/* ── BASIC INITIALIZATION ── */}
            {tab === 'basic' && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 max-w-[900px]">
                <Text k="chartOfAccountsTemplate" label="Chart of Accounts Template" width="200px" />

                <FieldRow label="Local Currency" labelWidth="200px">
                  <ClassicSel
                    value={form.currency}
                    onChange={(e) => setField('currency', e.target.value)}
                    className="w-full"
                  >
                    <option value="">— not set —</option>
                    {(currenciesQuery.data ?? []).map((c) => (
                      <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </ClassicSel>
                </FieldRow>

                <FieldRow label="Default Account Currency" labelWidth="200px">
                  <ClassicSel
                    value={String(form.details.defaultAccountCurrency ?? 'all')}
                    onChange={(e) => setDetail('defaultAccountCurrency', e.target.value)}
                    className="w-full"
                  >
                    <option value="all">All Currencies</option>
                    {(currenciesQuery.data ?? []).map((c) => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </ClassicSel>
                </FieldRow>

                <FieldRow label="Fiscal Year Starts" labelWidth="200px">
                  <ClassicSel
                    value={form.fiscalYearStart}
                    onChange={(e) => setField('fiscalYearStart', e.target.value)}
                    className="w-full"
                  >
                    <option value="">— not set —</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(Date.UTC(2000, i, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })}
                      </option>
                    ))}
                  </ClassicSel>
                </FieldRow>

                <FieldRow label="Items Valuation Method" labelWidth="200px">
                  <ClassicSel
                    value={String(form.details.itemGroupsValuationMethod ?? 'FIFO')}
                    onChange={(e) => setDetail('itemGroupsValuationMethod', e.target.value)}
                    className="w-full"
                  >
                    <option value="FIFO">FIFO</option>
                    <option value="MOVING_AVERAGE">Moving Average</option>
                    <option value="STANDARD">Standard</option>
                    <option value="SERIAL_BATCH">Serial/Batch</option>
                  </ClassicSel>
                </FieldRow>

                <FieldRow label="Serial/Batch Valuation" labelWidth="200px">
                  <ClassicSel
                    value={String(form.details.serialBatchValuationMethod ?? 'FIFO')}
                    onChange={(e) => setDetail('serialBatchValuationMethod', e.target.value)}
                    className="w-full"
                  >
                    <option value="FIFO">FIFO</option>
                    <option value="MOVING_AVERAGE">Moving Average</option>
                    <option value="STANDARD">Standard</option>
                  </ClassicSel>
                </FieldRow>

                <FieldRow label="Manage Serial/Batch Cost By" labelWidth="200px">
                  <ClassicSel
                    value={String(form.details.manageSerialBatchCostBy ?? 'itemGroup')}
                    onChange={(e) => setDetail('manageSerialBatchCostBy', e.target.value)}
                    className="w-full"
                  >
                    <option value="itemGroup">Item Group</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="company">Company</option>
                  </ClassicSel>
                </FieldRow>

                <FieldRow label="Calculate Depreciation By" labelWidth="200px">
                  <ClassicSel
                    value={String(form.details.calculateDepreciationBy ?? 'month')}
                    onChange={(e) => setDetail('calculateDepreciationBy', e.target.value)}
                    className="w-full"
                  >
                    <option value="month">Month</option>
                    <option value="day">Day</option>
                  </ClassicSel>
                </FieldRow>

                <div className="col-span-2 mt-2 border-t border-[#e5e5e5] pt-2 grid grid-cols-2 gap-x-6">
                  <div>
                    <Check k="displayCreditBalanceNegative" label="Display Credit Balance with Negative Sign" />
                    <Check k="useSegmentationAccounts" label="Use Segmentation Accounts" />
                    <Check k="multiLanguageSupport" label="Multi-Language Support" />
                    <Check k="usePerpetualInventory" label="Use Perpetual Inventory" />
                    <Check k="manageItemCostPerWarehouse" label="Manage Item Cost per Warehouse" />
                  </div>
                  <div>
                    <Check k="usePurchaseAccountsPosting" label="Use Purchase Accounts Posting System" />
                    <Check k="allowStockReleaseWithoutCost" label="Allow Stock Release Without Item Cost" />
                    <Check k="separateNetGrossPriceMode" label="Enable Separate Net and Gross Price Mode" />
                    <Check k="enableFixedAssets" label="Enable Fixed Assets" />
                    <Check k="enableMultipleBranches" label="Enable Multiple Branches" />
                  </div>
                </div>

                <div className="col-span-2 mt-3">
                  <div className="text-[11px] font-bold mb-1">House Bank</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Text k="orderingParty" label="Ordering Party" width="200px" />
                    <Text k="defaultBankCountry" label="Default Bank Country/Region" width="200px" />
                    <Text k="defaultBank" label="Default Bank" width="200px" />
                    <Text k="defaultAccountNo" label="Default Account No." width="200px" />
                    <Text k="defaultBranch" label="Default Branch" width="200px" />
                  </div>
                  <div className="mt-1">
                    <Check k="installBankStatementProcessing" label="Install Bank Statement Processing" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Update / Cancel ── */}
      <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
        <YellowBtn onClick={handleSave} disabled={saveMut.isPending || !companyId || isLoading}>
          {saveMut.isPending ? 'Saving…' : 'Update'}
        </YellowBtn>
        <GreyBtn onClick={onClose}>Cancel</GreyBtn>
        <span className="text-[9.5px] text-gray-600 ml-1">
          Update saves all three tabs and closes the window.
        </span>
      </div>
    </ClassicWindow>
  );
};
