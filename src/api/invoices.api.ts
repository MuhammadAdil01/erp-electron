import api from '../lib/axios';

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: number;
  orderId?: number;
  customerId?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  lines: InvoiceLine[];
  total: number;
  dueDate?: string;
  createdAt?: string;
}

export interface CreateInvoicePayload {
  orderId?: number;
  customerId?: number;
  lines: InvoiceLine[];
  dueDate?: string;
}

export const invoicesApi = {
  getAll: () =>
    api.get<Invoice[]>('/invoices').then((r) => r.data),

  getOne: (id: number) =>
    api.get<Invoice>(`/invoices/${id}`).then((r) => r.data),

  create: (payload: CreateInvoicePayload) =>
    api.post<Invoice>('/invoices', payload).then((r) => r.data),

  update: (id: number, payload: Partial<CreateInvoicePayload & { status: Invoice['status'] }>) =>
    api.patch<Invoice>(`/invoices/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete<{ message: string }>(`/invoices/${id}`).then((r) => r.data),
};
