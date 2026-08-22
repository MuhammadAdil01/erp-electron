import api from '../lib/axios';
import type { Auditable, ListParams } from './crud';

/**
 * A/R invoices and A/P bills.
 *
 * These are not plain catalogs, so they do not use `createCrudApi`: a document
 * has a lifecycle. Create and update only apply while it is a draft; `post`,
 * `pay` and `void` are the transitions, and each of them moves money in the
 * ledger. They are separate calls precisely so the UI has to be explicit about
 * which one it is asking for.
 */

export type ARInvoiceStatus =
  | 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID' | 'WRITTEN_OFF';
export type APBillStatus =
  | 'DRAFT' | 'APPROVED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID' | 'ON_HOLD';

interface PartnerRef {
  id: string;
  cardCode: string;
  cardName: string;
  cardType: 'CUSTOMER' | 'VENDOR' | 'LEAD';
}
interface JournalRef {
  id: string;
  number: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
}
interface AccountRef {
  id: string;
  code: string;
  name: string;
}

export interface DocumentLine {
  id: string;
  description: string;
  /** Decimals cross the wire as strings so no cent is lost to a float. */
  quantity: string;
  unitPrice: string;
  lineTotal: string;
  taxPercent?: string | null;
  tax: string;
  accountId?: string | null;
  account?: AccountRef | null;
  ordering: number;
}

export interface ARInvoiceLine extends DocumentLine {
  productId?: string | null;
}
export type APBillLine = DocumentLine;

export interface ARPayment {
  id: string;
  amount: string;
  currency: string;
  method?: string | null;
  reference?: string | null;
  receivedAt: string;
  journalEntryId?: string | null;
}

export interface APPayment {
  id: string;
  amount: string;
  currency: string;
  method?: string | null;
  reference?: string | null;
  paidAt: string;
  journalEntryId?: string | null;
}

export interface ARInvoice extends Auditable {
  bpId: string;
  bp?: PartnerRef;
  number: string;
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  subtotal: string;
  tax: string;
  total: string;
  paid: string;
  status: ARInvoiceStatus;
  paymentTermsId?: string | null;
  orderId?: string | null;
  notes?: string | null;
  journalEntryId?: string | null;
  journalEntry?: JournalRef | null;
  voidedAt?: string | null;
  lines: ARInvoiceLine[];
  payments: ARPayment[];
}

export interface APBill extends Auditable {
  bpId: string;
  bp?: PartnerRef;
  number: string;
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  subtotal: string;
  tax: string;
  total: string;
  paid: string;
  status: APBillStatus;
  paymentTermsId?: string | null;
  notes?: string | null;
  journalEntryId?: string | null;
  journalEntry?: JournalRef | null;
  voidedAt?: string | null;
  lines: APBillLine[];
  payments: APPayment[];
}

/**
 * What the window sends. Only quantity, price and tax rate — the server prices
 * the lines and computes the totals, so a rounding difference in the browser
 * can never become the number of record.
 */
export interface DocumentLineInput {
  description: string;
  quantity?: number;
  unitPrice: number;
  taxPercent?: number;
  accountId?: string;
  productId?: string;
}

export interface CreateARInvoiceInput {
  bpId: string;
  issueDate: string;
  dueDate?: string;
  currency?: string;
  paymentTermsId?: string;
  orderId?: string;
  notes?: string;
  lines: DocumentLineInput[];
}

export interface CreateAPBillInput {
  bpId: string;
  /** The vendor's own number — the platform does not generate this one. */
  number: string;
  issueDate: string;
  dueDate?: string;
  currency?: string;
  paymentTermsId?: string;
  notes?: string;
  lines: DocumentLineInput[];
}

export interface RecordPaymentInput {
  amount: number;
  date?: string;
  method?: string;
  reference?: string;
  /** Cash or bank account; falls back to G/L account determination. */
  accountId?: string;
}

export interface AgeingBucketRow {
  bp: { id: string; cardCode: string; cardName: string };
  current: string;
  d1_30: string;
  d31_60: string;
  d61_90: string;
  d90_plus: string;
  total: string;
}

export interface AgeingReport {
  asOf: string;
  buckets: string[];
  rows: AgeingBucketRow[];
}

export interface DocumentListParams extends ListParams {
  status?: string;
  bpId?: string;
  from?: string;
  to?: string;
}

const AR = '/financials/ar-invoices';
const AP = '/financials/ap-bills';

export const arInvoicesApi = {
  path: AR,
  getAll: (params?: DocumentListParams) =>
    api.get<ARInvoice[]>(AR, { params }).then((r) => r.data),
  getOne: (id: string) => api.get<ARInvoice>(`${AR}/${id}`).then((r) => r.data),
  create: (payload: CreateARInvoiceInput) =>
    api.post<ARInvoice>(AR, payload).then((r) => r.data),
  update: (id: string, payload: Partial<CreateARInvoiceInput>) =>
    api.put<ARInvoice>(`${AR}/${id}`, payload).then((r) => r.data),
  /** Issues the invoice and posts it to the ledger. Drafts only. */
  post: (id: string) => api.post<ARInvoice>(`${AR}/${id}/post`).then((r) => r.data),
  pay: (id: string, payload: RecordPaymentInput) =>
    api.post<ARInvoice>(`${AR}/${id}/payments`, payload).then((r) => r.data),
  /** Reverses the posting; the original entry stays in the ledger. */
  void: (id: string, payload: { reason?: string } = {}) =>
    api.post<ARInvoice>(`${AR}/${id}/void`, payload).then((r) => r.data),
  remove: (id: string) =>
    api.delete<{ id: string; message: string }>(`${AR}/${id}`).then((r) => r.data),
  ageing: (asOf?: string) =>
    api.get<AgeingReport>(`${AR}/ageing`, { params: { asOf } }).then((r) => r.data),
};

export const apBillsApi = {
  path: AP,
  getAll: (params?: DocumentListParams) => api.get<APBill[]>(AP, { params }).then((r) => r.data),
  getOne: (id: string) => api.get<APBill>(`${AP}/${id}`).then((r) => r.data),
  create: (payload: CreateAPBillInput) => api.post<APBill>(AP, payload).then((r) => r.data),
  update: (id: string, payload: Partial<CreateAPBillInput>) =>
    api.put<APBill>(`${AP}/${id}`, payload).then((r) => r.data),
  /** Approves the bill and posts it to the ledger. Drafts only. */
  post: (id: string) => api.post<APBill>(`${AP}/${id}/post`).then((r) => r.data),
  pay: (id: string, payload: RecordPaymentInput) =>
    api.post<APBill>(`${AP}/${id}/payments`, payload).then((r) => r.data),
  void: (id: string, payload: { reason?: string } = {}) =>
    api.post<APBill>(`${AP}/${id}/void`, payload).then((r) => r.data),
  remove: (id: string) =>
    api.delete<{ id: string; message: string }>(`${AP}/${id}`).then((r) => r.data),
  ageing: (asOf?: string) =>
    api.get<AgeingReport>(`${AP}/ageing`, { params: { asOf } }).then((r) => r.data),
};
