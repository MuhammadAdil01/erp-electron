import api from '../lib/axios';
import { createCrudApi, type Auditable, type Ref } from './crud';

// ─── ENUMS ────────────────────────────────────────────────────────────────────
export type AlertPriority = 'LOW' | 'NORMAL' | 'HIGH';
export type AlertFrequency =
  | 'ON_EVENT' | 'MINUTES' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type ApprovalRequestStatus =
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'GENERATED';
export type ApprovalDecisionValue = 'APPROVED' | 'REJECTED';

// ─── COMPANY DETAILS & SETTINGS ───────────────────────────────────────────────
export interface CompanyDetails {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  isActive: boolean;
  industry?: string | null;
  country?: string | null;
  currency?: string | null;
  locale?: string | null;
  timezone?: string | null;
  fiscalYearStart?: number | null;
  branding?: Record<string, unknown> | null;
  defaultArAccountId?: string | null;
  defaultApAccountId?: string | null;
  defaultCashAccountId?: string | null;
  defaultTaxPayableAccountId?: string | null;
  defaultTaxRecoverableAccountId?: string | null;
  defaultRevenueAccountId?: string | null;
  defaultExpenseAccountId?: string | null;
  createdAt: string;
  _count?: { users: number; employees: number; branches: number };
  companyModules?: { module: { id: string; name: string; slug: string } }[];
}

/**
 * Settings come back as group → key → value, with the backend's shipped
 * defaults already merged in. A window reads its own group and writes back only
 * the keys it owns; the backend merges rather than replacing, so two tabs
 * saving concurrently do not overwrite each other.
 */
export type SettingsGroups = Record<string, Record<string, unknown>>;

export const settingsApi = {
  getCompany: () =>
    api.get<CompanyDetails>('/administration/company-details').then((r) => r.data),

  updateCompany: (payload: Partial<CompanyDetails>) =>
    api.put<CompanyDetails>('/administration/company-details', payload).then((r) => r.data),

  getAll: () => api.get<SettingsGroups>('/administration/settings').then((r) => r.data),

  getGroup: (group: string) =>
    api.get<Record<string, unknown>>(`/administration/settings/${group}`).then((r) => r.data),

  saveGroup: (group: string, values: Record<string, unknown>) =>
    api.put<Record<string, unknown>>('/administration/settings', { group, values })
      .then((r) => r.data),

  resetGroup: (group: string, key?: string) =>
    api.delete<Record<string, unknown>>(`/administration/settings/${group}`, { params: { key } })
      .then((r) => r.data),

  getDocumentSettings: (documentType?: string) =>
    api.get<Record<string, unknown>>('/administration/document-settings', {
      params: { documentType },
    }).then((r) => r.data),

  saveDocumentSettings: (settings: Record<string, unknown>, documentType?: string) =>
    api.put('/administration/document-settings', { documentType, settings }).then((r) => r.data),
};

// ─── DOCUMENT NUMBERING ───────────────────────────────────────────────────────
export interface NumberingSeries extends Auditable {
  documentType: string;
  name: string;
  prefix?: string | null;
  suffix?: string | null;
  firstNumber: number;
  nextNumber: number;
  lastNumber?: number | null;
  digits: number;
  isDefault: boolean;
  isLocked: boolean;
  periodIndicator?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  remarks?: string | null;
}

const numberingBase = createCrudApi<NumberingSeries>('/administration/numbering-series');
export const numberingApi = {
  ...numberingBase,
  documentTypes: () =>
    api.get<{ documentType: string; seriesCount: number }[]>(
      '/administration/numbering-series/document-types',
    ).then((r) => r.data),

  check: () =>
    api.get<{
      checked: number;
      issueCount: number;
      issues: { seriesId: string; name: string; documentType: string; issue: string }[];
    }>('/administration/numbering-series/check').then((r) => r.data),

  setDefault: (id: string) =>
    api.post<NumberingSeries>(`/administration/numbering-series/${id}/set-default`)
      .then((r) => r.data),
};

// ─── SETUP CATALOGS ───────────────────────────────────────────────────────────
export interface PredefinedText extends Auditable {
  code: string; name?: string | null; text: string; isActive: boolean;
}
export const predefinedTextApi = createCrudApi<PredefinedText>('/administration/predefined-text');

export interface StateRegion { id: string; countryId: string; code: string; name: string; isActive: boolean }
export interface Country extends Auditable {
  code: string; name: string; addressFormat?: string | null; isActive: boolean;
  regions: StateRegion[];
}
const countriesBase = createCrudApi<Country>('/administration/countries');
export const countriesApi = {
  ...countriesBase,
  addRegion: (payload: { countryId: string; code: string; name: string }) =>
    api.post<StateRegion>('/administration/countries/regions', payload).then((r) => r.data),
  removeRegion: (regionId: string) =>
    api.delete<{ id: string; message: string }>(`/administration/countries/regions/${regionId}`)
      .then((r) => r.data),
};

// ─── USER GROUPS & DEFAULTS ───────────────────────────────────────────────────
export interface UserGroup extends Auditable {
  code: string; name: string; description?: string | null; isActive: boolean;
  members: { id: string; user: { id: string; name: string; email: string; roleType: string } }[];
}
export interface CreateUserGroupPayload {
  code: string; name: string; description?: string; isActive?: boolean; memberIds?: string[];
}
export const userGroupsApi =
  createCrudApi<UserGroup, CreateUserGroupPayload>('/administration/user-groups');

export interface UserDefaultsGroup extends Auditable {
  code: string; name: string; defaults: Record<string, unknown>;
  users: { id: string; name: string; email: string }[];
}
export interface CreateUserDefaultsPayload {
  code: string; name: string; defaults?: Record<string, unknown>; userIds?: string[];
}
const defaultsBase =
  createCrudApi<UserDefaultsGroup, CreateUserDefaultsPayload>('/administration/user-defaults');
export const userDefaultsApi = {
  ...defaultsBase,
  forUser: (userId: string) =>
    api.get<{
      userId: string; groupId: string | null; groupName: string | null;
      defaults: Record<string, unknown>;
    }>(`/administration/user-defaults/for-user/${userId}`).then((r) => r.data),
  assign: (id: string, userIds: string[]) =>
    api.post<{ groupId: string; assigned: number }>(
      `/administration/user-defaults/${id}/assign`, { userIds },
    ).then((r) => r.data),
};

// ─── ALERTS ───────────────────────────────────────────────────────────────────
export interface AlertDefinition extends Auditable {
  name: string; description?: string | null;
  priority: AlertPriority; frequency: AlertFrequency; frequencyValue?: number | null;
  eventKey?: string | null; savedQuery?: string | null;
  isActive: boolean; lastRunAt?: string | null;
  subscriptions: { id: string; user: { id: string; name: string; email: string } }[];
  _count?: { instances: number };
}
export interface CreateAlertPayload {
  name: string; description?: string;
  priority?: AlertPriority; frequency?: AlertFrequency; frequencyValue?: number;
  eventKey?: string; savedQuery?: string; isActive?: boolean; recipientIds?: string[];
}
export interface AlertInstance {
  id: string; subject: string; payload?: Record<string, unknown> | null;
  readAt: string | null; createdAt: string;
  alert: { id: string; name: string; priority: AlertPriority };
}

const alertsBase = createCrudApi<AlertDefinition, CreateAlertPayload>('/administration/alerts');
export const alertsApi = {
  ...alertsBase,
  inbox: (unreadOnly = false) =>
    api.get<AlertInstance[]>('/administration/alerts/inbox', { params: { unreadOnly } })
      .then((r) => r.data),
  markRead: (instanceIds: string[]) =>
    api.post<{ marked: number }>('/administration/alerts/inbox/mark-read', { instanceIds })
      .then((r) => r.data),
};

// ─── APPROVAL PROCESS ─────────────────────────────────────────────────────────
export interface ApprovalStage extends Auditable {
  name: string; description?: string | null; requiredApprovals: number;
  remarks?: string | null; isActive: boolean;
  approvers: { id: string; userId: string; user: { id: string; name: string; email: string } }[];
  _count?: { templateStages: number };
}
export interface CreateApprovalStagePayload {
  name: string; description?: string; requiredApprovals?: number;
  remarks?: string; isActive?: boolean; approverIds: string[];
}

export interface ApprovalTemplate extends Auditable {
  name: string; description?: string | null; isActive: boolean;
  documentTypes: string[];
  terms: Record<string, unknown>;
  validFrom?: string | null; validTo?: string | null;
  originators: { id: string; user: { id: string; name: string; email?: string } }[];
  stages: { id: string; stageId: string; ordering: number; stage: Ref }[];
  _count?: { requests: number };
}
export interface CreateApprovalTemplatePayload {
  name: string; description?: string; isActive?: boolean;
  documentTypes: string[];
  terms?: Record<string, unknown>;
  validFrom?: string; validTo?: string;
  originatorIds?: string[];
  stageIds: string[];
}

export interface ApprovalDecisionRow {
  id: string; approverId: string; decision: ApprovalDecisionValue;
  remarks: string | null; decidedAt: string;
  approver: { id: string; name: string; email: string };
}

export interface ApprovalRequest extends Auditable {
  templateId: string;
  template: { id: string; name: string; documentTypes: string[] };
  documentType: string;
  documentId?: string | null;
  documentNumber?: string | null;
  originatorId: string;
  originator: { id: string; name: string; email: string };
  status: ApprovalRequestStatus;
  currentStageOrder: number;
  remarks?: string | null;
  documentSnapshot?: Record<string, unknown> | null;
  resolvedAt?: string | null;
  stages: {
    id: string; stageId: string; ordering: number; status: ApprovalRequestStatus;
    resolvedAt: string | null;
    stage: ApprovalStage;
    decisions: ApprovalDecisionRow[];
  }[];
}

export const approvalsApi = {
  // Stages
  listStages: () => api.get<ApprovalStage[]>('/administration/approvals/stages').then((r) => r.data),
  getStage: (id: string) =>
    api.get<ApprovalStage>(`/administration/approvals/stages/${id}`).then((r) => r.data),
  createStage: (payload: CreateApprovalStagePayload) =>
    api.post<ApprovalStage>('/administration/approvals/stages', payload).then((r) => r.data),
  updateStage: (id: string, payload: Partial<CreateApprovalStagePayload>) =>
    api.put<ApprovalStage>(`/administration/approvals/stages/${id}`, payload).then((r) => r.data),
  removeStage: (id: string) =>
    api.delete<{ id: string; message: string }>(`/administration/approvals/stages/${id}`)
      .then((r) => r.data),

  // Templates
  listTemplates: () =>
    api.get<ApprovalTemplate[]>('/administration/approvals/templates').then((r) => r.data),
  getTemplate: (id: string) =>
    api.get<ApprovalTemplate>(`/administration/approvals/templates/${id}`).then((r) => r.data),
  createTemplate: (payload: CreateApprovalTemplatePayload) =>
    api.post<ApprovalTemplate>('/administration/approvals/templates', payload).then((r) => r.data),
  updateTemplate: (id: string, payload: Partial<CreateApprovalTemplatePayload>) =>
    api.put<ApprovalTemplate>(`/administration/approvals/templates/${id}`, payload)
      .then((r) => r.data),
  removeTemplate: (id: string) =>
    api.delete<{ id: string; message: string }>(`/administration/approvals/templates/${id}`)
      .then((r) => r.data),

  // Requests & decisions
  submit: (payload: {
    documentType: string;
    documentId?: string;
    documentNumber?: string;
    document: Record<string, unknown>;
    remarks?: string;
  }) =>
    api.post<{ required: boolean; requests: ApprovalRequest[] }>(
      '/administration/approvals/requests', payload,
    ).then((r) => r.data),

  listRequests: (params?: {
    status?: ApprovalRequestStatus; documentType?: string; originatorId?: string;
  }) =>
    api.get<ApprovalRequest[]>('/administration/approvals/requests', { params }).then((r) => r.data),

  myQueue: () =>
    api.get<ApprovalRequest[]>('/administration/approvals/requests/my-queue').then((r) => r.data),

  getRequest: (id: string) =>
    api.get<ApprovalRequest>(`/administration/approvals/requests/${id}`).then((r) => r.data),

  decide: (id: string, decision: ApprovalDecisionValue, remarks?: string) =>
    api.post<ApprovalRequest>(`/administration/approvals/requests/${id}/decide`, {
      decision, remarks,
    }).then((r) => r.data),

  cancel: (id: string) =>
    api.post<ApprovalRequest>(`/administration/approvals/requests/${id}/cancel`).then((r) => r.data),

  decisionReport: (params?: { approverId?: string; from?: string; to?: string }) =>
    api.get<{
      id: string; decision: ApprovalDecisionValue; remarks: string | null; decidedAt: string;
      approver: { id: string; name: string; email: string };
      request: {
        id: string; documentType: string; documentNumber: string | null;
        status: ApprovalRequestStatus; originator: Ref; template: Ref;
      };
      requestStage: { id: string; stage: Ref };
    }[]>('/administration/approvals/decisions/report', { params }).then((r) => r.data),
};

export interface SubstituteAuthorizer extends Auditable {
  templateId?: string | null; template?: Ref | null;
  originalUserId: string; original: { id: string; name: string; email: string };
  substituteUserId: string; substitute: { id: string; name: string; email: string };
  validFrom: string; validTo: string; isActive: boolean;
}
export const substituteAuthorizersApi =
  createCrudApi<SubstituteAuthorizer>('/administration/substitute-authorizers');
