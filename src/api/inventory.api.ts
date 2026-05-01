import api from '../lib/axios';

export interface InventoryItem {
  id: number;
  productId: number;
  quantity: number;
  warehouseLocation?: string;
  lastUpdated?: string;
}

export interface UpdateInventoryPayload {
  quantity?: number;
  warehouseLocation?: string;
}

export const inventoryApi = {
  getAll: () =>
    api.get<InventoryItem[]>('/inventory').then((r) => r.data),

  getOne: (id: number) =>
    api.get<InventoryItem>(`/inventory/${id}`).then((r) => r.data),

  update: (id: number, payload: UpdateInventoryPayload) =>
    api.patch<InventoryItem>(`/inventory/${id}`, payload).then((r) => r.data),
};
