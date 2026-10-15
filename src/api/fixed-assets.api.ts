import api from '../lib/axios';
import { createCrudApi, type Auditable } from './crud';
import type { AccountType, DepreciationMethod } from './financials.api';

/**
 * Fixed Assets: Asset Master Data, Capitalization / Capitalization Credit
 * Memo, and their setup (Asset Classes, Depreciation Areas). Every window
 * loads its dropdowns from its own `lookups` route, which is guarded by the
 * fixed-asset permissions — so a Fixed Assets user does not also need CRM,
 * HR and tenancy rights just to see a vendor, an employee or a branch.
 */

export interface CodedRef { id: string; code: string; name: string }
export interface AccountRef { id: string; code: string; name: string; type?: AccountType }
export interface DepreciationMethodOption { value: DepreciationMethod; label: string }

// ─── SETUP ────────────────────────────────────────────────────────────────────
export interface AssetClass extends Auditable {
  code: string;
  name: string;
  depreciationMethod: DepreciationMethod;
  usefulLifeMonths: number;
  assetAccountId: string;
  accumulatedDepreciationAccountId: string;
  depreciationExpenseAccountId: string;
  clearingAccountId: string;
  assetAccount?: AccountRef;
  accumulatedDepreciationAccount?: AccountRef;
  depreciationExpenseAccount?: AccountRef;
  clearingAccount?: AccountRef;
  isActive: boolean;
  remarks?: string | null;
  _count?: { assets: number };
}
export type AssetClassPayload = Partial<Omit<AssetClass, 'id' | 'assetAccount' | 'accumulatedDepreciationAccount' | 'depreciationExpenseAccount' | 'clearingAccount' | '_count'>>;

const classesBase = createCrudApi<AssetClass, AssetClassPayload>('/financials/asset-classes');
export const assetClassesApi = {
  ...classesBase,
  lookups: () =>
    api.get<{ accounts: (AccountRef & { subtype?: string | null })[]; depreciationMethods: DepreciationMethodOption[] }>(
      '/financials/asset-classes/lookups',
    ).then((r) => r.data),
};

export interface DepreciationArea extends Auditable {
  code: string;
  name: string;
  postsToGl: boolean;
  ordering: number;
  isActive: boolean;
  _count?: { values: number };
}
export type DepreciationAreaPayload = Partial<Pick<DepreciationArea, 'code' | 'name' | 'postsToGl' | 'ordering' | 'isActive'>>;
export const depreciationAreasApi = createCrudApi<DepreciationArea, DepreciationAreaPayload>('/financials/depreciation-areas');

// ─── ASSET MASTER DATA ────────────────────────────────────────────────────────
export type FixedAssetStatus = 'NEW' | 'CAPITALIZED' | 'RETIRED' | 'SOLD';

export interface AreaRef { id: string; code: string; name: string; postsToGl: boolean; ordering?: number; isActive?: boolean }

export interface FixedAssetAreaValue {
  id: string;
  areaId: string;
  area: AreaRef;
  depreciationMethod: DepreciationMethod;
  usefulLifeMonths: number;
  depreciationStartDate: string | null;
  salvageValue: string;
  acquisitionCost: string;
  accumulatedDepreciation: string;
  netBookValue: string;
  /** Computed by the server on the detail read: the last day of the life. */
  endDate?: string | null;
  /** Months of the life not yet covered by posted depreciation. */
  remainingLifeMonths?: number;
  lastDepreciationDate?: string | null;
}

export interface FixedAssetTransaction {
  id: string;
  areaId: string | null;
  area: { id: string; code: string } | null;
  type: 'CAPITALIZATION' | 'CAPITALIZATION_CREDIT_MEMO' | 'DEPRECIATION' | 'MANUAL_DEPRECIATION' | 'REVALUATION' | 'TRANSFER' | 'RETIREMENT';
  postingDate: string;
  amount: string;
  remarks: string | null;
  journalEntry: { id: string; number: string; status: string } | null;
  capitalization: { id: string; number: string; kind: CapitalizationKind; status: CapitalizationStatus } | null;
}

export interface FixedAsset extends Auditable {
  code: string;
  name: string;
  foreignName: string | null;
  barCode: string | null;
  assetClassId: string;
  assetClass: {
    id: string; code: string; name: string; depreciationMethod: DepreciationMethod; usefulLifeMonths: number;
    assetAccount: CodedRef; accumulatedDepreciationAccount: CodedRef; depreciationExpenseAccount: CodedRef; clearingAccount: CodedRef;
  };
  status: FixedAssetStatus;
  isActive: boolean;
  capitalizedAt: string | null;
  retiredAt: string | null;
  /** Whole units in service (FA-D15). */
  quantity: number;
  serialNumber: string | null;
  inventoryNo: string | null;
  manufacturer: string | null;
  additionalIdentifier: string | null;
  vendorId: string | null;
  vendor: { id: string; cardCode: string; cardName: string } | null;
  mfrCatalogNo: string | null;
  purchaseDate: string | null;
  purchaseCost: string | null;
  branchId: string | null;
  branch: { id: string; code: string | null; name: string } | null;
  employeeId: string | null;
  employee: { id: string; employeeNumber: string | null; name: string } | null;
  technicianId: string | null;
  technician: { id: string; employeeNumber: string | null; name: string } | null;
  costCenterId: string | null;
  costCenter: CodedRef | null;
  projectId: string | null;
  project: CodedRef | null;
  distributionRuleId: string | null;
  distributionRule: CodedRef | null;
  remarks: string | null;
  areaValues: FixedAssetAreaValue[];
  /** Only on the detail read (GET /:id). */
  transactions?: FixedAssetTransaction[];
  /** Detail read: class, number and depreciation parameters are fixed (capitalized). */
  locked?: boolean;
  /** Detail read: New with no postings — Delete is offered, otherwise Deactivate (FA-D10). */
  deletable?: boolean;
}

export interface AssetAreaParams {
  areaId: string;
  depreciationMethod?: DepreciationMethod;
  usefulLifeMonths?: number;
  depreciationStartDate?: string | null;
  salvageValue?: number;
}

export interface FixedAssetPayload {
  code?: string;
  seriesId?: string;
  name?: string;
  foreignName?: string;
  barCode?: string;
  assetClassId?: string;
  isActive?: boolean;
  serialNumber?: string;
  inventoryNo?: string;
  manufacturer?: string;
  additionalIdentifier?: string;
  mfrCatalogNo?: string;
  branchId?: string;
  employeeId?: string;
  technicianId?: string;
  vendorId?: string;
  purchaseDate?: string | null;
  purchaseCost?: number | null;
  costCenterId?: string;
  projectId?: string;
  distributionRuleId?: string;
  remarks?: string;
  areas?: AssetAreaParams[];
}

export interface NumberingSeriesOption { id: string; name: string; prefix: string | null; nextNumber: number; digits: number; isDefault: boolean }

export interface FixedAssetLookups {
  assetClasses: { id: string; code: string; name: string; depreciationMethod: DepreciationMethod; usefulLifeMonths: number }[];
  depreciationAreas: AreaRef[];
  vendors: { id: string; cardCode: string; cardName: string }[];
  branches: { id: string; code: string | null; name: string }[];
  employees: { id: string; employeeNumber: string | null; name: string }[];
  costCenters: CodedRef[];
  projects: CodedRef[];
  distributionRules: CodedRef[];
  series: NumberingSeriesOption[];
  /** From Posting Periods, plus the current one. */
  fiscalYears: number[];
  currentFiscalYear: number;
  currency: string | null;
  depreciationMethods: DepreciationMethodOption[];
}

export interface AssetValuesYear {
  fiscalYear: number;
  apcFirstDay: string;
  /** Net of capitalization credit memos. */
  acquisition: string;
  retirement: string;
  transfer: string;
  writeUp: string;
  ordinaryDepreciation: string;
  unplannedDepreciation: string;
  apcLastDay: string;
  accumulatedLastDay: string;
  nbvLastDay: string;
}

export interface AssetForecast {
  assetId: string; code: string; name: string; area: AreaRef | null;
  rows: { month: number; date: string; charge: string; accumulated: string; netBookValue: string }[];
}

const assetsBase = createCrudApi<FixedAsset, FixedAssetPayload>('/financials/fixed-assets');
export const fixedAssetsApi = {
  ...assetsBase,
  lookups: () => api.get<FixedAssetLookups>('/financials/fixed-assets/lookups').then((r) => r.data),
  values: (id: string) =>
    api.get<{ area: AreaRef; years: AssetValuesYear[] }[]>(`/financials/fixed-assets/${id}/values`).then((r) => r.data),
  forecast: (id: string, months = 12, areaId?: string) =>
    api.get<AssetForecast>(`/financials/fixed-assets/${id}/forecast`, { params: { months, areaId } }).then((r) => r.data),
};

// ─── CAPITALIZATION / CAPITALIZATION CREDIT MEMO ──────────────────────────────
export type CapitalizationKind = 'CAPITALIZATION' | 'CREDIT_MEMO';
export type CapitalizationOrigin = 'MANUAL' | 'AP_INVOICE';
export type CapitalizationStatus = 'POSTED' | 'CANCELLED';

export interface CapitalizationListRow extends Auditable {
  kind: CapitalizationKind;
  number: string;
  origin: CapitalizationOrigin;
  status: CapitalizationStatus;
  postingDate: string;
  documentDate: string;
  assetValueDate: string;
  total: string;
  currency: string;
  reference: string | null;
  apBill: { id: string; number: string } | null;
  depreciationArea: { id: string; code: string } | null;
  journalEntry: { id: string; number: string } | null;
  _count: { lines: number };
}

export interface CapitalizationDetail extends CapitalizationListRow {
  journalRemark: string;
  remarks: string | null;
  cancelledAt: string | null;
  lines: {
    id: string;
    assetId: string;
    asset: { id: string; code: string; name: string; assetClass: CodedRef };
    apBillLineId: string | null;
    apBillLine: { id: string; description: string; lineTotal: string; account: CodedRef | null } | null;
    amount: string;
    quantity: number;
    remarks: string | null;
  }[];
  apBill: { id: string; number: string; issueDate: string; bp: { id: string; cardCode: string; cardName: string } } | null;
  baseCapitalization: { id: string; number: string } | null;
  creditMemos: { id: string; number: string }[];
  depreciationArea: { id: string; code: string; name: string; postsToGl: boolean } | null;
  journalEntry: {
    id: string; number: string; status: string; date: string;
    lines: { id: string; debit: string; credit: string; description: string | null; account: CodedRef }[];
  } | null;
  cancellationJournalEntry: { id: string; number: string; date: string } | null;
}

export interface CapitalizationLookups {
  series: NumberingSeriesOption[];
  depreciationAreas: { id: string; code: string; name: string; postsToGl: boolean }[];
  assets: {
    id: string; code: string; name: string; status: FixedAssetStatus; purchaseCost: string | null; quantity: number;
    assetClass: { id: string; code: string; name: string; assetAccount: CodedRef; clearingAccount: CodedRef };
    areaValues: { areaId: string; acquisitionCost: string; accumulatedDepreciation: string; netBookValue: string }[];
  }[];
  apBills: {
    id: string; number: string; issueDate: string; total: string;
    bp: { id: string; cardCode: string; cardName: string };
    lines: { id: string; description: string; lineTotal: string; accountId: string; account: CodedRef | null; capitalized: string }[];
  }[];
  baseDocuments: {
    id: string; number: string; postingDate: string; origin: CapitalizationOrigin; apBillId: string | null; total: string;
    lines: { assetId: string; amount: string; apBillLineId: string | null; credited: string }[];
  }[];
  currency: string | null;
  /** The default Journal Remark for this kind. */
  journalRemark: string;
}

export interface CapitalizationPayload {
  kind: CapitalizationKind;
  origin: CapitalizationOrigin;
  apBillId?: string;
  baseCapitalizationId?: string;
  depreciationAreaId?: string;
  seriesId?: string;
  reference?: string;
  postingDate: string;
  documentDate?: string;
  assetValueDate?: string;
  journalRemark?: string;
  remarks?: string;
  lines: { assetId: string; amount: number; quantity?: number; apBillLineId?: string; remarks?: string }[];
}

export const assetCapitalizationsApi = {
  list: (kind: CapitalizationKind) =>
    api.get<CapitalizationListRow[]>('/financials/asset-capitalizations', { params: { kind } }).then((r) => r.data),
  getOne: (id: string) => api.get<CapitalizationDetail>(`/financials/asset-capitalizations/${id}`).then((r) => r.data),
  lookups: (kind: CapitalizationKind) =>
    api.get<CapitalizationLookups>('/financials/asset-capitalizations/lookups', { params: { kind } }).then((r) => r.data),
  /**
   * Posts on Add. The idempotency key is made once per document being entered
   * and sent again on a retry, so a request that timed out after the server
   * posted it is answered with that document instead of posting a second one.
   */
  create: (payload: CapitalizationPayload, idempotencyKey: string) =>
    api.post<CapitalizationDetail>('/financials/asset-capitalizations', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
      timeout: 60_000,
    }).then((r) => r.data),
  cancel: (id: string, reason?: string) =>
    api.post<CapitalizationDetail>(`/financials/asset-capitalizations/${id}/cancel`, { reason }, { timeout: 60_000 })
      .then((r) => r.data),
};
