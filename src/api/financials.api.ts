import api from '../lib/axios';
import { createCrudApi, type Auditable, type CodedRef, type ListParams } from './crud';

// ─── ENUMS (mirror the Prisma enums) ──────────────────────────────────────────
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type AccountSubtype =
  | 'CASH' | 'BANK' | 'ACCOUNTS_RECEIVABLE' | 'ACCOUNTS_PAYABLE' | 'INVENTORY'
  | 'FIXED_ASSET' | 'CURRENT_LIABILITY' | 'LONG_TERM_LIABILITY' | 'TAX_PAYABLE'
  | 'TAX_RECOVERABLE' | 'SHARE_CAPITAL' | 'RETAINED_EARNINGS' | 'REVENUE'
  | 'COST_OF_GOODS_SOLD' | 'OPERATING_EXPENSE' | 'OTHER_INCOME' | 'OTHER_EXPENSE';
export type PeriodStatus = 'OPEN' | 'CLOSING' | 'CLOSED' | 'LOCKED';
export type SubPeriodType = 'YEAR' | 'MONTHS' | 'QUARTERS' | 'DAYS';
export type JournalStatus = 'DRAFT' | 'POSTED' | 'REVERSED';
export type PostingArea = 'general' | 'sales' | 'purchasing' | 'inventory';
export type TaxCodeType = 'SALES' | 'PURCHASE' | 'WITHHOLDING';
export type DepreciationMethod =
  | 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'SUM_OF_YEARS' | 'IMMEDIATE' | 'NONE';

// ─── CHART OF ACCOUNTS ────────────────────────────────────────────────────────
export interface Account extends Auditable {
  code: string;
  name: string;
  type: AccountType;
  subtype?: AccountSubtype | null;
  parentId?: string | null;
  parent?: { id: string; code: string; name: string } | null;
  currency: string;
  isTitle: boolean;
  isControl: boolean;
  isActive: boolean;
  level: number;
  description?: string | null;
  cashFlowLineItemId?: string | null;
  _count?: { children: number; lines: number };
}

export interface AccountNode {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  isTitle: boolean;
  isControl: boolean;
  isActive: boolean;
  level: number;
  children: AccountNode[];
}

export interface AccountBalance {
  accountId: string;
  debit: string;
  credit: string;
  balance: string;
}

const accountsBase = createCrudApi<Account>('/financials/accounts');
export const accountsApi = {
  ...accountsBase,
  tree: (params?: { type?: AccountType; includeInactive?: boolean }) =>
    api.get<AccountNode[]>('/financials/accounts/tree', { params }).then((r) => r.data),
  balances: (params?: { from?: string; to?: string; includeUnposted?: boolean }) =>
    api.get<AccountBalance[]>('/financials/accounts/balances', { params }).then((r) => r.data),
};

// ─── POSTING PERIODS ──────────────────────────────────────────────────────────
export interface PostingPeriod extends Auditable {
  name: string;
  displayName?: string | null;
  parentId?: string | null;
  fiscalYear?: number | null;
  subPeriodType: SubPeriodType;
  startDate: string;
  endDate: string;
  activeFrom?: string | null;
  activeTo?: string | null;
  dueDateFrom?: string | null;
  dueDateTo?: string | null;
  status: PeriodStatus;
  salesStatus: PeriodStatus;
  purchasingStatus: PeriodStatus;
  generalStatus: PeriodStatus;
  inventoryStatus: PeriodStatus;
  closedAt?: string | null;
  children?: PostingPeriod[];
  _count?: { children: number; journals: number };
}

const periodsBase = createCrudApi<PostingPeriod>('/financials/posting-periods');
export const postingPeriodsApi = {
  ...periodsBase,
  generate: (payload: {
    fiscalYear: number;
    subPeriodType: SubPeriodType;
    startMonth?: number;
    displayName?: string;
  }) => api.post<PostingPeriod>('/financials/posting-periods/generate', payload).then((r) => r.data),

  resolve: (date: string, area: PostingArea = 'general') =>
    api.get<PostingPeriod>('/financials/posting-periods/resolve', { params: { date, area } })
      .then((r) => r.data),

  setStatus: (id: string, status: PeriodStatus, area?: PostingArea) =>
    api.put<PostingPeriod>(`/financials/posting-periods/${id}/status`, { status, area })
      .then((r) => r.data),
};

// ─── JOURNAL ENTRIES ──────────────────────────────────────────────────────────
export interface JournalLine {
  id?: string;
  accountId: string;
  account?: { id: string; code: string; name: string; type: AccountType };
  debit: number | string;
  credit: number | string;
  description?: string | null;
  bpId?: string | null;
  bp?: { id: string; cardCode: string; cardName: string } | null;
  costCenterId?: string | null;
  distributionRuleId?: string | null;
  projectId?: string | null;
  taxCodeId?: string | null;
  taxAmount?: number | string | null;
  dueDate?: string | null;
  ref1?: string | null;
  ref2?: string | null;
  ref3?: string | null;
  ordering?: number;
}

export interface JournalEntry extends Auditable {
  number: string;
  periodId: string;
  period?: { id: string; name: string; status: PeriodStatus };
  date: string;
  docDate?: string | null;
  dueDate?: string | null;
  description?: string | null;
  reference?: string | null;
  status: JournalStatus;
  currency: string;
  totalDebit: string;
  totalCredit: string;
  source?: string | null;
  seriesId?: string | null;
  transactionCodeId?: string | null;
  projectId?: string | null;
  indicator?: string | null;
  ref1?: string | null;
  ref2?: string | null;
  ref3?: string | null;
  isAdjustment: boolean;
  postedAt?: string | null;
  reversalOf?: { id: string; number: string } | null;
  reversal?: { id: string; number: string } | null;
  lines: JournalLine[];
}

export interface CreateJournalEntryPayload {
  date: string;
  docDate?: string;
  dueDate?: string;
  seriesId?: string;
  description?: string;
  reference?: string;
  currency?: string;
  transactionCodeId?: string;
  projectId?: string;
  templateId?: string;
  indicator?: string;
  ref1?: string;
  ref2?: string;
  ref3?: string;
  isAdjustment?: boolean;
  autoReverseDate?: string;
  lines: Omit<JournalLine, 'id' | 'account' | 'bp'>[];
  /** Post immediately rather than saving a draft. */
  post?: boolean;
}

export interface JournalListParams extends ListParams {
  status?: JournalStatus;
  periodId?: string;
  source?: string;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const journalEntriesApi = {
  getAll: (params?: JournalListParams) =>
    api.get<JournalEntry[]>('/financials/journal-entries', { params }).then((r) => r.data),
  getOne: (id: string) =>
    api.get<JournalEntry>(`/financials/journal-entries/${id}`).then((r) => r.data),
  create: (payload: CreateJournalEntryPayload) =>
    api.post<JournalEntry>('/financials/journal-entries', payload).then((r) => r.data),
  update: (id: string, payload: Partial<CreateJournalEntryPayload>) =>
    api.put<JournalEntry>(`/financials/journal-entries/${id}`, payload).then((r) => r.data),
  post: (id: string) =>
    api.post<JournalEntry>(`/financials/journal-entries/${id}/post`).then((r) => r.data),
  reverse: (id: string, payload: { date?: string; reason?: string } = {}) =>
    api.post<JournalEntry>(`/financials/journal-entries/${id}/reverse`, payload).then((r) => r.data),
  remove: (id: string) =>
    api.delete<{ id: string; message: string }>(`/financials/journal-entries/${id}`)
      .then((r) => r.data),
};

// ─── SETUP CATALOGS ───────────────────────────────────────────────────────────
export interface Currency extends Auditable {
  code: string; name: string; intlDescription?: string | null;
  hundredthName?: string | null; decimals: number; rounding?: string | null; isActive: boolean;
}
export const currenciesApi = createCrudApi<Currency>('/financials/currencies');

export interface ExchangeRate extends Auditable {
  baseCurrency: string; targetCurrency: string; rate: string; date: string; source?: string | null;
}
const ratesBase = createCrudApi<ExchangeRate>('/financials/exchange-rates');
export const exchangeRatesApi = {
  ...ratesBase,
  resolve: (target: string, date?: string, base = 'USD') =>
    api.get<{ base: string; target: string; date: string | null; rate: string }>(
      '/financials/exchange-rates/resolve', { params: { target, date, base } },
    ).then((r) => r.data),
  bulk: (rates: { baseCurrency?: string; targetCurrency: string; rate: number; date: string; source?: string }[]) =>
    api.post<{ upserted: number; rates: ExchangeRate[] }>(
      '/financials/exchange-rates/bulk', { rates },
    ).then((r) => r.data),
};

export interface PaymentTerms extends Auditable {
  code: string; name: string; netDays: number;
  discountDays?: number | null; discountPercent?: string | null; isActive: boolean;
}
export const paymentTermsApi = createCrudApi<PaymentTerms>('/financials/payment-terms');

export interface FinanceProject extends Auditable {
  code: string; name: string; validFrom?: string | null; validTo?: string | null; isActive: boolean;
}
export const financeProjectsApi = createCrudApi<FinanceProject>('/financials/projects');

export interface TransactionCode extends Auditable {
  code: string; description: string; isActive: boolean;
}
export const transactionCodesApi = createCrudApi<TransactionCode>('/financials/transaction-codes');

export interface TaxCode extends Auditable {
  code: string; name: string; type: TaxCodeType; rate: string;
  accountId?: string | null; account?: CodedRef | null; isActive: boolean;
}
export const taxCodesApi = createCrudApi<TaxCode>('/financials/tax-codes');

export interface CashFlowLineItem extends Auditable {
  code: string; name: string; parentId?: string | null; section?: string | null; isActive: boolean;
}
export const cashFlowLineItemsApi = createCrudApi<CashFlowLineItem>('/financials/cash-flow-line-items');

export interface Bank extends Auditable {
  code: string; name: string; swift?: string | null; country?: string | null; isActive: boolean;
}
export const banksApi = createCrudApi<Bank>('/financials/banks');

export interface HouseBankAccount extends Auditable {
  bankId: string; bank?: CodedRef; accountNo: string; accountName?: string | null;
  branch?: string | null; iban?: string | null; currency: string;
  glAccountId?: string | null; glAccount?: CodedRef | null; isDefault: boolean; isActive: boolean;
}
export const houseBankAccountsApi = createCrudApi<HouseBankAccount>('/financials/house-bank-accounts');

export interface PaymentMethod extends Auditable {
  code: string; description: string; direction: 'INCOMING' | 'OUTGOING';
  paymentMeans?: string | null; houseBankAccountId?: string | null; isActive: boolean;
}
export const paymentMethodsApi = createCrudApi<PaymentMethod>('/financials/payment-methods');

export interface DunningTerm extends Auditable {
  code: string; name: string; levels: unknown[]; isActive: boolean;
}
export const dunningTermsApi = createCrudApi<DunningTerm>('/financials/dunning-terms');

// ─── COST ACCOUNTING ──────────────────────────────────────────────────────────
export interface Dimension extends Auditable {
  dimensionNo: number; name: string; description?: string | null; isActive: boolean;
}
export const dimensionsApi = createCrudApi<Dimension>('/financials/dimensions');

export interface CostCenter extends Auditable {
  dimensionId: string; dimension?: { id: string; dimensionNo: number; name: string };
  code: string; name: string; parentId?: string | null; parent?: CodedRef | null;
  effectiveFrom?: string | null; effectiveTo?: string | null; isActive: boolean;
}
export interface CostCenterNode {
  id: string; code: string; name: string; isActive: boolean; children: CostCenterNode[];
}
const costCentersBase = createCrudApi<CostCenter>('/financials/cost-centers');
export const costCentersApi = {
  ...costCentersBase,
  hierarchy: (dimensionId?: string) =>
    api.get<CostCenterNode[]>('/financials/cost-centers/hierarchy', { params: { dimensionId } })
      .then((r) => r.data),
};

export interface DistributionRuleLine {
  id?: string; costCenterId: string; costCenter?: CodedRef; ratio: string | number;
}
export interface DistributionRule extends Auditable {
  dimensionId: string; code: string; name: string; totalRatio: string;
  effectiveFrom?: string | null; effectiveTo?: string | null; isActive: boolean;
  lines: DistributionRuleLine[];
}
const rulesBase = createCrudApi<DistributionRule>('/financials/distribution-rules');
export const distributionRulesApi = {
  ...rulesBase,
  split: (id: string, amount: number) =>
    api.get<{ costCenterId: string; amount: string }[]>(
      `/financials/distribution-rules/${id}/split`, { params: { amount } },
    ).then((r) => r.data),
};

// ─── POSTING & RECURRING ──────────────────────────────────────────────────────
export interface PostingTemplateLine {
  id?: string; accountId: string; account?: CodedRef;
  description?: string | null; percentage: number | string; side: 'debit' | 'credit'; ordering?: number;
}
export interface PostingTemplate extends Auditable {
  code: string; description: string; isActive: boolean; lines: PostingTemplateLine[];
}
export const postingTemplatesApi = createCrudApi<PostingTemplate>('/financials/posting-templates');

export interface RecurringPostingLine {
  id?: string; accountId: string; account?: CodedRef;
  debit: number | string; credit: number | string; description?: string | null; ordering?: number;
}
export interface RecurringPosting extends Auditable {
  code: string; description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'ANNUALLY' | 'ONE_TIME';
  nextExecution: string; validUntil?: string | null; executionCount: number;
  maxExecutions?: number | null; currency: string; isActive: boolean;
  lines: RecurringPostingLine[];
}
const recurringBase = createCrudApi<RecurringPosting>('/financials/recurring-postings');
export const recurringPostingsApi = {
  ...recurringBase,
  due: (asOf?: string) =>
    api.get<RecurringPosting[]>('/financials/recurring-postings/due', { params: { asOf } })
      .then((r) => r.data),
  advance: (id: string) =>
    api.post<RecurringPosting>(`/financials/recurring-postings/${id}/advance`).then((r) => r.data),
};

// ─── BUDGETS ──────────────────────────────────────────────────────────────────
export interface BudgetScenario extends Auditable {
  code: string; name: string; fiscalYear: number;
  basedOnScenarioId?: string | null; basedOn?: CodedRef | null;
  initialRatio: string; isActive: boolean;
}
export const budgetScenariosApi = createCrudApi<BudgetScenario>('/financials/budget-scenarios');

export interface BudgetDistributionMethod extends Auditable {
  code: string; name: string; monthlyRatios: number[]; isActive: boolean;
}
export const budgetDistributionMethodsApi =
  createCrudApi<BudgetDistributionMethod>('/financials/budget-distribution-methods');

export interface BudgetLine extends Auditable {
  scenarioId: string; accountId: string; account?: CodedRef;
  costCenterId?: string | null; periodId?: string | null; distributionMethodId?: string | null;
  annualDebit: string; annualCredit: string;
  breakdown?: { month: number; ratio: number; debit: string; credit: string }[] | null;
}
const budgetLinesBase = createCrudApi<BudgetLine>('/financials/budget-lines');
export const budgetLinesApi = {
  ...budgetLinesBase,
  versusActual: (scenarioId: string) =>
    api.get<{
      scenario: { id: string; code: string; name: string; fiscalYear: number };
      rows: {
        account: CodedRef; budget: string; actual: string;
        variance: string; variancePercent: string | null;
      }[];
    }>(`/financials/budget-lines/versus-actual/${scenarioId}`).then((r) => r.data),
};

// ─── G/L ACCOUNT DETERMINATION ────────────────────────────────────────────────
export type DeterminationArea = 'SALES' | 'PURCHASING' | 'GENERAL' | 'INVENTORY';
export interface AccountDetermination {
  id: string; area: DeterminationArea; key: string;
  accountId: string; account?: CodedRef & { type: AccountType };
}
export const accountDeterminationApi = {
  list: (area?: DeterminationArea) =>
    api.get<AccountDetermination[]>('/financials/account-determination', { params: { area } })
      .then((r) => r.data),
  set: (payload: { area: DeterminationArea; key: string; accountId: string }) =>
    api.post<AccountDetermination>('/financials/account-determination', payload).then((r) => r.data),
  remove: (id: string) =>
    api.delete<{ id: string; message: string }>(`/financials/account-determination/${id}`)
      .then((r) => r.data),
};

// ─── FIXED ASSETS ─────────────────────────────────────────────────────────────
export interface FixedAsset extends Auditable {
  code: string; name: string; assetClass?: string | null;
  status: 'NEW' | 'CAPITALIZED' | 'RETIRED' | 'SOLD';
  capitalizedAt?: string | null; retiredAt?: string | null;
  usefulLifeMonths: number; depreciationMethod: DepreciationMethod;
  acquisitionCost: string; salvageValue: string;
  accumulatedDepreciation: string; netBookValue: string; currency: string;
  costAccountId?: string | null; depreciationAccountId?: string | null;
  accumulatedAccountId?: string | null; costCenterId?: string | null;
  serialNumber?: string | null; location?: string | null; remarks?: string | null;
}
const assetsBase = createCrudApi<FixedAsset>('/financials/fixed-assets');
export const fixedAssetsApi = {
  ...assetsBase,
  capitalize: (id: string, payload: { postingDate: string; amount: number; remarks?: string }) =>
    api.post<FixedAsset>(`/financials/fixed-assets/${id}/capitalize`, payload).then((r) => r.data),
  retire: (id: string, payload: { postingDate: string; remarks?: string }) =>
    api.post<FixedAsset>(`/financials/fixed-assets/${id}/retire`, payload).then((r) => r.data),
  forecast: (id: string, months = 12) =>
    api.get<{
      assetId: string; code: string; name: string;
      rows: { month: number; date: string; charge: string; accumulated: string; netBookValue: string }[];
    }>(`/financials/fixed-assets/${id}/forecast`, { params: { months } }).then((r) => r.data),
  depreciationRun: (payload: { postingDate: string; assetIds?: string[]; dryRun?: boolean }) =>
    api.post<{
      postingDate: string; dryRun: boolean; assetsProcessed: number; totalCharge: string;
      results: {
        assetId: string; code: string; name: string; charge: string;
        accumulated: string; netBookValue: string; posted: boolean; note?: string;
      }[];
    }>('/financials/fixed-assets/depreciation-run', payload).then((r) => r.data),
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export interface ReportRangeParams {
  from?: string;
  to?: string;
  includeUnposted?: boolean;
  includeZeroBalances?: boolean;
}

export interface TrialBalanceRow {
  accountId: string; code: string; name: string; type: AccountType;
  opening: string; debit: string; credit: string; closing: string;
}

export interface ReportNode {
  id: string; code: string; name: string; type: AccountType;
  isTitle: boolean; level: number; amount: string; children: ReportNode[];
}

export const financialReportsApi = {
  trialBalance: (params?: ReportRangeParams) =>
    api.get<{
      range: { from: string | null; to: string | null; includeUnposted: boolean };
      rows: TrialBalanceRow[];
      totals: { debit: string; credit: string; difference: string; balanced: boolean };
    }>('/financials/reports/trial-balance', { params }).then((r) => r.data),

  profitAndLoss: (params?: ReportRangeParams) =>
    api.get<{
      range: { from: string | null; to: string | null };
      income: { sections: ReportNode[]; total: string };
      expenses: { sections: ReportNode[]; total: string };
      grossProfit: string; netProfit: string; netProfitIsLoss: boolean;
    }>('/financials/reports/profit-and-loss', { params }).then((r) => r.data),

  balanceSheet: (params?: { asOf?: string; includeUnposted?: boolean }) =>
    api.get<{
      asOf: string;
      assets: { sections: ReportNode[]; total: string };
      liabilities: { sections: ReportNode[]; total: string };
      equity: { sections: ReportNode[]; currentYearResult: string; total: string };
      totals: { assets: string; liabilitiesAndEquity: string; difference: string; balanced: boolean };
    }>('/financials/reports/balance-sheet', { params }).then((r) => r.data),

  generalLedger: (params?: ReportRangeParams & { accountIds?: string; bpId?: string }) =>
    api.get<{
      range: { from: string | null; to: string | null };
      accounts: {
        account: { id: string; code: string; name: string; type: AccountType };
        opening: string; debit: string; credit: string; closing: string;
        rows: {
          lineId: string; entryId: string; number: string; date: string; status: JournalStatus;
          description: string | null; reference: string | null;
          businessPartner: { id: string; cardCode: string; cardName: string } | null;
          debit: string; credit: string; runningBalance: string;
        }[];
      }[];
    }>('/financials/reports/general-ledger', { params }).then((r) => r.data),

  aging: (kind: 'receivables' | 'payables', asOf?: string) =>
    api.get<{
      kind: string; asOf: string; bucketLabels: string[];
      rows: {
        partner: { id: string; cardCode: string; cardName: string };
        buckets: Record<string, string>; total: string;
      }[];
      totals: Record<string, string>;
    }>(`/financials/reports/aging/${kind}`, { params: { asOf } }).then((r) => r.data),

  documentJournal: (params?: ReportRangeParams) =>
    api.get<{
      range: { from: string | null; to: string | null };
      count: number;
      entries: {
        id: string; number: string; date: string; period: string; status: JournalStatus;
        source: string | null; description: string | null; reference: string | null;
        totalDebit: string; totalCredit: string;
        lines: {
          accountCode: string; accountName: string; description: string | null;
          debit: string; credit: string;
        }[];
      }[];
    }>('/financials/reports/document-journal', { params }).then((r) => r.data),
};
