import api from '../lib/axios';

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  customerId?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  createdAt?: string;
}

export interface CreateOrderPayload {
  customerId?: number;
  items: OrderItem[];
}

export interface UpdateOrderPayload {
  status?: Order['status'];
}

export const ordersApi = {
  getAll: () =>
    api.get<Order[]>('/orders').then((r) => r.data),

  getOne: (id: number) =>
    api.get<Order>(`/orders/${id}`).then((r) => r.data),

  create: (payload: CreateOrderPayload) =>
    api.post<Order>('/orders', payload).then((r) => r.data),

  update: (id: number, payload: UpdateOrderPayload) =>
    api.patch<Order>(`/orders/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete<{ message: string }>(`/orders/${id}`).then((r) => r.data),
};
