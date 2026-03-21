import apiClient from './client';

export type StoreStatus = 'active' | 'inactive';
export type StoreType = 'flagship' | 'branch' | 'kiosk' | 'warehouse';

export interface StoreRecord {
  id: string;
  name: string;
  code: string;
  status: StoreStatus;
  type: StoreType;
  phone?: string;
  email?: string;
  addressLine1?: string;
  ward?: string;
  district?: string;
  city?: string;
  openingHours?: string;
  note?: string;
  supportsTryOn?: boolean;
  supportsPickup?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
  updatedAt?: string;
  ghn?: {
    shopId?: number | null;
    clientId?: number | null;
    provinceId?: number | null;
    provinceName?: string;
    districtId?: number | null;
    districtName?: string;
    wardCode?: string;
    wardName?: string;
    address?: string;
    syncedAt?: string;
    lastSyncError?: string;
  };
}

export interface StoresResponse {
  stores: StoreRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StoreUpsertInput {
  name: string;
  code: string;
  status?: StoreStatus;
  type?: StoreType;
  phone?: string;
  email?: string;
  addressLine1?: string;
  ward?: string;
  district?: string;
  city?: string;
  openingHours?: string;
  note?: string;
  supportsTryOn?: boolean;
  supportsPickup?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
  ghn?: {
    autoCreate?: boolean;
    shopId?: number | null;
    clientId?: number | null;
    provinceId?: number | null;
    provinceName?: string;
    districtId?: number | null;
    districtName?: string;
    wardCode?: string;
    wardName?: string;
    address?: string;
  };
}

function mapStore(raw: any): StoreRecord {
  return {
    id: String(raw?._id || raw?.id || ''),
    name: String(raw?.name || ''),
    code: String(raw?.code || ''),
    status: String(raw?.status || 'active') as StoreStatus,
    type: String(raw?.type || 'branch') as StoreType,
    phone: String(raw?.phone || ''),
    email: String(raw?.email || ''),
    addressLine1: String(raw?.addressLine1 || ''),
    ward: String(raw?.ward || ''),
    district: String(raw?.district || ''),
    city: String(raw?.city || ''),
    openingHours: String(raw?.openingHours || ''),
    note: String(raw?.note || ''),
    supportsTryOn: Boolean(raw?.supportsTryOn),
    supportsPickup: raw?.supportsPickup !== false,
    isDefault: Boolean(raw?.isDefault),
    sortOrder: Number.isFinite(Number(raw?.sortOrder)) ? Number(raw.sortOrder) : 0,
    updatedAt: String(raw?.updatedAt || ''),
    ghn: raw?.ghn
      ? {
          shopId: Number.isFinite(Number(raw?.ghn?.shopId)) ? Number(raw.ghn.shopId) : null,
          clientId: Number.isFinite(Number(raw?.ghn?.clientId)) ? Number(raw.ghn.clientId) : null,
          provinceId: Number.isFinite(Number(raw?.ghn?.provinceId))
            ? Number(raw.ghn.provinceId)
            : null,
          provinceName: String(raw?.ghn?.provinceName || ''),
          districtId: Number.isFinite(Number(raw?.ghn?.districtId))
            ? Number(raw.ghn.districtId)
            : null,
          districtName: String(raw?.ghn?.districtName || ''),
          wardCode: String(raw?.ghn?.wardCode || ''),
          wardName: String(raw?.ghn?.wardName || ''),
          address: String(raw?.ghn?.address || ''),
          syncedAt: String(raw?.ghn?.syncedAt || ''),
          lastSyncError: String(raw?.ghn?.lastSyncError || ''),
        }
      : undefined,
  };
}

function extractList(payload: any) {
  if (Array.isArray(payload?.data)) {
    return { rows: payload.data, pagination: payload?.pagination };
  }
  if (Array.isArray(payload?.stores)) {
    return { rows: payload.stores, pagination: payload?.pagination };
  }
  throw new Error('Invalid stores response.');
}

function extractItem(payload: any) {
  if (payload?.data && typeof payload.data === 'object') return payload.data;
  if (payload && typeof payload === 'object' && (payload._id || payload.id)) return payload;
  throw new Error('Invalid store response.');
}

const storeApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: StoreStatus | 'all';
  }): Promise<StoresResponse> {
    const requestParams = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
      search: params?.search,
      status: params?.status ?? 'active',
    };
    const response = await apiClient.get('/api/stores', { params: requestParams });
    const { rows, pagination } = extractList(response.data);
    return {
      stores: rows.map(mapStore),
      total: pagination?.total ?? rows.length,
      page: pagination?.page ?? requestParams.page,
      pageSize: pagination?.limit ?? requestParams.limit,
    };
  },

  async getById(id: string): Promise<StoreRecord> {
    const response = await apiClient.get(`/api/stores/${id}`);
    return mapStore(extractItem(response.data));
  },

  async create(input: StoreUpsertInput): Promise<StoreRecord> {
    const response = await apiClient.post('/api/stores', input);
    return mapStore(extractItem(response.data));
  },

  async update(id: string, input: Partial<StoreUpsertInput>): Promise<StoreRecord> {
    const response = await apiClient.put(`/api/stores/${id}`, input);
    return mapStore(extractItem(response.data));
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/stores/${id}`);
  },
};

export default storeApi;
