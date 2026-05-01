import api from '../lib/axios';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  categoryId?: number;
}

export interface CreateProductPayload extends Omit<Product, 'id'> {}
export interface UpdateProductPayload extends Partial<Omit<Product, 'id'>> {}

export const productsApi = {
  getAll: () =>
    api.get<Product[]>('/products').then((r) => r.data),

  getOne: (id: number) =>
    api.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (payload: CreateProductPayload) =>
    api.post<Product>('/products', payload).then((r) => r.data),

  update: (id: number, payload: UpdateProductPayload) =>
    api.patch<Product>(`/products/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete<{ message: string }>(`/products/${id}`).then((r) => r.data),
};
