import api from '../lib/axios';

/**
 * Mirror of the backend's TenantCrudController.
 *
 * The Administration / Financials / CRM surface exposes ~40 catalogs that all
 * speak the same five routes. Declaring each one by hand would be forty chances
 * to typo a path or forget that PUT (not PATCH) is what the backend maps.
 * `createCrudApi` binds one base path and hands back a typed client.
 */
export interface ListParams {
  search?: string;
  skip?: number;
  take?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface CrudApi<T, TCreate = Partial<T>, TUpdate = Partial<TCreate>> {
  getAll: (params?: ListParams) => Promise<T[]>;
  count: (params?: ListParams) => Promise<number>;
  getOne: (id: string) => Promise<T>;
  create: (payload: TCreate) => Promise<T>;
  update: (id: string, payload: TUpdate) => Promise<T>;
  remove: (id: string) => Promise<{ id: string; message: string }>;
  /** Escape hatch for the bespoke routes a resource adds on top. */
  path: string;
}

export function createCrudApi<T, TCreate = Partial<T>, TUpdate = Partial<TCreate>>(
  path: string,
): CrudApi<T, TCreate, TUpdate> {
  return {
    path,
    getAll: (params) => api.get<T[]>(path, { params }).then((r) => r.data),
    count: (params) =>
      api.get<{ total: number }>(`${path}/count`, { params }).then((r) => r.data.total),
    getOne: (id) => api.get<T>(`${path}/${id}`).then((r) => r.data),
    create: (payload) => api.post<T>(path, payload).then((r) => r.data),
    // The backend maps PUT, not PATCH — sending PATCH gets a 404, which is easy
    // to misread as "the record is missing".
    update: (id, payload) => api.put<T>(`${path}/${id}`, payload).then((r) => r.data),
    remove: (id) =>
      api.delete<{ id: string; message: string }>(`${path}/${id}`).then((r) => r.data),
  };
}

/** Shared field shapes the backend returns on most records. */
export interface Auditable {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ref {
  id: string;
  name: string;
}

export interface CodedRef extends Ref {
  code: string;
}
