import api from '../lib/axios';
import { createCrudApi, type Auditable, type CodedRef, type Ref } from './crud';

// ─── ENUMS ────────────────────────────────────────────────────────────────────
export type BpCardType = 'CUSTOMER' | 'VENDOR' | 'LEAD';
export type BpAddressType = 'BILL_TO' | 'SHIP_TO';
export type ActivityKind = 'MEETING' | 'PHONE_CALL' | 'TASK' | 'NOTE' | 'CAMPAIGN' | 'OTHER';
export type ActivityStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';
export type ActivityPriority = 'LOW' | 'NORMAL' | 'HIGH';
export type OpportunityStatus = 'OPEN' | 'WON' | 'LOST';
export type CampaignStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// ─── BUSINESS PARTNER ─────────────────────────────────────────────────────────
export interface BpContactPerson {
  id?: string; name: string; position?: string | null; title?: string | null;
  address?: string | null; phone1?: string | null; phone2?: string | null;
  mobile?: string | null; fax?: string | null; email?: string | null; pager?: string | null;
  profession?: string | null; birthDate?: string | null; gender?: string | null;
  remarks1?: string | null; remarks2?: string | null; isDefault?: boolean; isActive?: boolean;
}

export interface BpAddress {
  id?: string; addressName: string; addressType: BpAddressType;
  street?: string | null; streetNo?: string | null; block?: string | null;
  building?: string | null; city?: string | null; zipCode?: string | null;
  county?: string | null; state?: string | null; country?: string | null;
  gln?: string | null; taxCode?: string | null; isDefault?: boolean;
}

export interface BpBankAccount {
  id?: string; bankCode?: string | null; bankName?: string | null; branch?: string | null;
  accountNo?: string | null; accountName?: string | null; iban?: string | null;
  swift?: string | null; controlKey?: string | null; isDefault?: boolean;
}

export interface BusinessPartner extends Auditable {
  cardCode: string;
  cardName: string;
  cardType: BpCardType;
  foreignName?: string | null;
  groupId?: string | null;
  group?: (CodedRef & { type: BpCardType }) | null;
  currency: string;
  federalTaxId?: string | null;
  phone1?: string | null; phone2?: string | null; mobile?: string | null;
  fax?: string | null; email?: string | null; website?: string | null;
  shippingType?: string | null;
  territoryId?: string | null; territory?: Ref | null;
  salesEmployeeId?: string | null; salesEmployee?: CodedRef | null;
  paymentTermsId?: string | null;
  paymentTerms?: (CodedRef & { netDays: number }) | null;
  paymentMethodId?: string | null;
  dunningTermId?: string | null;
  creditLimit?: string | null;
  commitmentLimit?: string | null;
  discountPercent?: string | null;
  interestOnArrears?: string | null;
  priceListId?: string | null;
  controlAccountId?: string | null;
  downPaymentAccountId?: string | null;
  accountBalance: string;
  ordersBalance: string;
  deliveriesBalance: string;
  opportunitiesAmount: string;
  properties?: Record<string, unknown> | null;
  industry?: string | null;
  businessType?: string | null;
  priority?: string | null;
  blockDunning: boolean;
  isActive: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  remarks?: string | null;
  contacts: BpContactPerson[];
  addresses: BpAddress[];
  bankAccounts: BpBankAccount[];
}

export interface CreateBusinessPartnerPayload {
  cardCode?: string;
  cardName: string;
  cardType: BpCardType;
  foreignName?: string;
  groupId?: string;
  currency?: string;
  federalTaxId?: string;
  phone1?: string; phone2?: string; mobile?: string; fax?: string;
  email?: string; website?: string; shippingType?: string;
  territoryId?: string; salesEmployeeId?: string;
  paymentTermsId?: string; paymentMethodId?: string; dunningTermId?: string;
  creditLimit?: number; commitmentLimit?: number; discountPercent?: number;
  interestOnArrears?: number; priceListId?: string;
  controlAccountId?: string; downPaymentAccountId?: string;
  properties?: Record<string, unknown>;
  industry?: string; businessType?: string; priority?: string;
  blockDunning?: boolean; isActive?: boolean;
  validFrom?: string; validTo?: string; remarks?: string;
  contacts?: BpContactPerson[];
  addresses?: BpAddress[];
  bankAccounts?: BpBankAccount[];
}

export interface BpLookupRow {
  id: string; cardCode: string; cardName: string; cardType: BpCardType;
  currency: string; accountBalance: string; phone1: string | null; email: string | null;
}

const bpBase = createCrudApi<BusinessPartner, CreateBusinessPartnerPayload>('/crm/business-partners');
export const businessPartnersApi = {
  ...bpBase,
  lookup: (params: { search?: string; cardType?: BpCardType; take?: number } = {}) =>
    api.get<BpLookupRow[]>('/crm/business-partners/lookup', { params }).then((r) => r.data),
  refreshBalances: (id: string) =>
    api.post<BusinessPartner>(`/crm/business-partners/${id}/refresh-balances`).then((r) => r.data),
};

// ─── SALES ORGANISATION ───────────────────────────────────────────────────────
export interface Territory extends Auditable {
  name: string; parentId?: string | null; parent?: Ref | null; isActive: boolean;
  _count?: { children: number; partners: number; salesEmployees: number };
}
export interface TerritoryNode {
  id: string; name: string; isActive: boolean; children: TerritoryNode[];
}
const territoriesBase = createCrudApi<Territory>('/crm/territories');
export const territoriesApi = {
  ...territoriesBase,
  tree: () => api.get<TerritoryNode[]>('/crm/territories/tree').then((r) => r.data),
};

export interface CommissionGroup extends Auditable {
  code: string; name: string; commissionPercent: string; isActive: boolean;
  _count?: { salesEmployees: number };
}
/** Decimals come back as strings but are sent as numbers, so the payload differs. */
export interface CommissionGroupPayload {
  code: string; name: string; commissionPercent?: number; isActive?: boolean;
}
export const commissionGroupsApi =
  createCrudApi<CommissionGroup, CommissionGroupPayload, Partial<CommissionGroupPayload>>(
    '/crm/commission-groups',
  );

export interface SalesEmployee extends Auditable {
  code: string; name: string; jobTitle?: string | null;
  commissionGroupId?: string | null;
  commissionGroup?: (CodedRef & { commissionPercent: string }) | null;
  commissionPercent?: string | null;
  territoryId?: string | null; territory?: Ref | null;
  telephone?: string | null; mobile?: string | null; fax?: string | null;
  email?: string | null; remarks?: string | null; isActive: boolean;
  userId?: string | null; user?: { id: string; name: string; email: string } | null;
  employeeId?: string | null;
  employee?: { id: string; firstName: string; lastName: string } | null;
  _count?: { partners: number; opportunities: number };
}
export const salesEmployeesApi = createCrudApi<SalesEmployee>('/crm/sales-employees');

// ─── SETUP CATALOGS ───────────────────────────────────────────────────────────
export interface BpGroup extends Auditable {
  type: BpCardType; code: string; name: string; isActive: boolean;
  _count?: { partners: number };
}
export const bpGroupsApi = createCrudApi<BpGroup>('/crm/bp-groups');

export interface OpportunityStageDef extends Auditable {
  stageNo: number; name: string; closingPercent: string; isActive: boolean;
}
export const opportunityStagesApi = createCrudApi<OpportunityStageDef>('/crm/opportunity-stages');

export interface Competitor extends Auditable {
  code: string; name: string; threatLevel?: string | null;
  remarks?: string | null; isActive: boolean;
}
export const competitorsApi = createCrudApi<Competitor>('/crm/competitors');

export interface CrmPartner extends Auditable {
  code: string; name: string; type?: string | null; isActive: boolean;
}
export const crmPartnersApi = createCrudApi<CrmPartner>('/crm/partners');

export interface InformationSource extends Auditable {
  code: string; name: string; isActive: boolean;
}
export const informationSourcesApi = createCrudApi<InformationSource>('/crm/information-sources');

export interface BpRelationshipType extends Auditable { code: string; name: string }
export const relationshipTypesApi = createCrudApi<BpRelationshipType>('/crm/relationship-types');

// ─── ACTIVITIES ───────────────────────────────────────────────────────────────
export interface Activity extends Auditable {
  docNumber?: number | null;
  kind: ActivityKind;
  subject: string;
  activityType?: string | null;
  bpId?: string | null;
  bp?: { id: string; cardCode: string; cardName: string } | null;
  contactPersonId?: string | null;
  contactPerson?: { id: string; name: string; email?: string | null; phone1?: string | null } | null;
  priority: ActivityPriority;
  status: ActivityStatus;
  startDate: string;
  startTime?: string | null;
  endDate?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  location?: string | null;
  reminderEnabled: boolean;
  reminderMinutesBefore?: number | null;
  recurrence?: Record<string, unknown> | null;
  linkedDocType?: string | null;
  linkedDocId?: string | null;
  linkedDocNumber?: string | null;
  content?: string | null;
  remarks?: string | null;
  ownerId?: string | null; owner?: Ref | null;
  assignedToUserId?: string | null; assignedTo?: Ref | null;
  closedAt?: string | null;
}

export interface CreateActivityPayload {
  kind: ActivityKind;
  subject: string;
  activityType?: string;
  bpId?: string;
  contactPersonId?: string;
  priority?: ActivityPriority;
  status?: ActivityStatus;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  durationMinutes?: number;
  location?: string;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  recurrence?: Record<string, unknown>;
  linkedDocType?: string;
  linkedDocId?: string;
  linkedDocNumber?: string;
  content?: string;
  remarks?: string;
  assignedToUserId?: string;
}

const activitiesBase = createCrudApi<Activity, CreateActivityPayload>('/crm/activities');
export const activitiesApi = {
  ...activitiesBase,
  mine: (openOnly = true) =>
    api.get<Activity[]>('/crm/activities/mine', { params: { openOnly } }).then((r) => r.data),
  calendar: (from: string, to: string, mine = false) =>
    api.get<Activity[]>('/crm/activities/calendar', { params: { from, to, mine } })
      .then((r) => r.data),
  overview: (from?: string, to?: string) =>
    api.get<{
      total: number;
      byStatus: { status: ActivityStatus; count: number }[];
      byKind: { kind: ActivityKind; count: number }[];
      byAssignee: { userId: string | null; name: string; count: number }[];
    }>('/crm/activities/overview', { params: { from, to } }).then((r) => r.data),
};

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────────
export interface OpportunityStageEntry {
  id?: string;
  stageDefId: string;
  stageDef?: { id: string; stageNo: number; name: string };
  ordering?: number;
  startDate?: string | null;
  closingDate?: string | null;
  closePercent: string | number;
  potentialAmount: string | number;
  weightedAmount?: string;
  salesEmployeeId?: string | null;
  activityId?: string | null;
  docType?: string | null;
  docNumber?: string | null;
  remarks?: string | null;
}

export interface OpportunityCompetitorRow {
  id?: string; competitorId: string; competitor?: CodedRef;
  threatLevel?: string | null; strengths?: string | null;
  weaknesses?: string | null; remarks?: string | null;
}

export interface OpportunityPartnerRow {
  id?: string; partnerId: string; partner?: CodedRef;
  role?: string | null; remarks?: string | null;
}

export interface Opportunity extends Auditable {
  docNumber?: number | null;
  name: string;
  bpId: string;
  bp?: { id: string; cardCode: string; cardName: string };
  contactPersonId?: string | null; contactPerson?: Ref | null;
  salesEmployeeId?: string | null; salesEmployee?: CodedRef | null;
  territoryId?: string | null; territory?: Ref | null;
  currentStageId?: string | null;
  currentStage?: { id: string; stageNo: number; name: string; closingPercent: string } | null;
  status: OpportunityStatus;
  level: number;
  startDate: string;
  closingDate?: string | null;
  predictedClosingDate?: string | null;
  currency: string;
  potentialAmount: string;
  weightedAmount: string;
  closePercent: string;
  grossProfit?: string | null;
  informationSourceId?: string | null; informationSource?: CodedRef | null;
  industry?: string | null;
  interestField?: string | null;
  interestLevel?: string | null;
  wonLostReason?: string | null;
  remarks?: string | null;
  stages: OpportunityStageEntry[];
  competitors: OpportunityCompetitorRow[];
  partners: OpportunityPartnerRow[];
}

export interface CreateOpportunityPayload {
  name: string;
  bpId: string;
  contactPersonId?: string;
  salesEmployeeId?: string;
  territoryId?: string;
  currentStageId?: string;
  status?: OpportunityStatus;
  level?: number;
  startDate: string;
  closingDate?: string;
  predictedClosingDate?: string;
  currency?: string;
  potentialAmount?: number;
  closePercent?: number;
  grossProfit?: number;
  informationSourceId?: string;
  industry?: string;
  interestField?: string;
  interestLevel?: string;
  remarks?: string;
  stages?: Omit<OpportunityStageEntry, 'id' | 'stageDef' | 'weightedAmount'>[];
  competitors?: Omit<OpportunityCompetitorRow, 'id' | 'competitor'>[];
  partners?: Omit<OpportunityPartnerRow, 'id' | 'partner'>[];
}

const oppBase = createCrudApi<Opportunity, CreateOpportunityPayload>('/crm/opportunities');
export const opportunitiesApi = {
  ...oppBase,
  pipeline: (salesEmployeeId?: string) =>
    api.get<{
      stage: { id: string | null; stageNo: number; name: string };
      count: number; potential: string; weighted: string;
    }[]>('/crm/opportunities/pipeline', { params: { salesEmployeeId } }).then((r) => r.data),

  statistics: (from?: string, to?: string) =>
    api.get<{
      byStatus: { status: OpportunityStatus; count: number; potential: string; weighted: string }[];
      winRatePercent: string | null;
      bySalesEmployee: {
        salesEmployeeId: string | null; name: string;
        status: OpportunityStatus; count: number; potential: string;
      }[];
    }>('/crm/opportunities/statistics', { params: { from, to } }).then((r) => r.data),

  close: (id: string, payload: { status: 'WON' | 'LOST'; closingDate?: string; reason?: string }) =>
    api.post<Opportunity>(`/crm/opportunities/${id}/close`, payload).then((r) => r.data),

  reopen: (id: string) =>
    api.post<Opportunity>(`/crm/opportunities/${id}/reopen`).then((r) => r.data),
};

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────
export interface Campaign extends Auditable {
  campaignNumber?: number | null;
  name: string; type?: string | null; status: CampaignStatus;
  startDate?: string | null; endDate?: string | null;
  salesEmployeeId?: string | null; salesEmployee?: CodedRef | null;
  targetGroup?: string | null;
  budgetAmount?: string | null; revenueAmount?: string | null;
  remarks?: string | null;
  targets?: {
    id: string;
    bp?: { id: string; cardCode: string; cardName: string } | null;
    contactPerson?: Ref | null;
    response?: string | null;
  }[];
  _count?: { targets: number };
}
export const campaignsApi = createCrudApi<Campaign>('/crm/campaigns');

// ─── CUSTOMER 360 & REPORTS ───────────────────────────────────────────────────
export interface Customer360 {
  partner: BusinessPartner;
  summary: {
    currency: string;
    openReceivables: string;
    openPayables: string;
    creditLimit: string | null;
    creditAvailable: string | null;
    overCreditLimit: boolean;
    ledgerDebit: string;
    ledgerCredit: string;
    ledgerBalance: string;
    openOpportunities: number;
    openOpportunityValue: string;
    wonOpportunities: number;
    lostOpportunities: number;
    openActivities: number;
    lastActivityAt: string | null;
    lastActivitySubject: string | null;
  };
  aging: Record<string, string>;
  arInvoices: {
    id: string; number: string; issueDate: string; dueDate: string | null;
    status: string; currency: string; total: string; paid: string; outstanding: string;
  }[];
  apBills: {
    id: string; number: string; issueDate: string; dueDate: string | null;
    status: string; currency: string; total: string; paid: string; outstanding: string;
  }[];
  activities: Activity[];
  opportunities: Opportunity[];
  opportunityTotals: Record<string, { count: number; potential: string; weighted: string }>;
}

export const customer360Api = {
  overview: (bpId: string) =>
    api.get<Customer360>(`/crm/customer-360/${bpId}`).then((r) => r.data),

  inactiveCustomers: (sinceDays = 90) =>
    api.get<{
      sinceDays: number; cutoff: string; count: number;
      rows: {
        id: string; cardCode: string; cardName: string;
        email: string | null; phone: string | null; currency: string; balance: string;
        salesEmployee: Ref | null;
        lastActivityAt: string | null; lastInvoiceAt: string | null;
      }[];
    }>('/crm/reports/inactive-customers', { params: { sinceDays } }).then((r) => r.data),

  creditLimitDeviation: () =>
    api.get<{
      count: number;
      rows: {
        id: string; cardCode: string; cardName: string; currency: string;
        creditLimit: string; openBalance: string; deviation: string; overLimit: boolean;
      }[];
    }>('/crm/reports/credit-limit-deviation').then((r) => r.data),
};
