import apiClient from './client';

export type PreorderBatchStatus =
  | 'pending'
  | 'in_transit'
  | 'partial'
  | 'completed'
  | 'delayed';

export interface PreorderBatchItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variant: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
}

export interface PreorderBatchRecord {
  id: string;
  batchCode: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  status: PreorderBatchStatus;
  totalItems: number;
  receivedItems: number;
  items: PreorderBatchItem[];
  notes?: string;
  createdByName?: string;
}

interface BackendEnvelope<T> {
  success?: boolean;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface BackendBatchItem {
  _id?: string;
  productId?: string | { _id?: string };
  variantId?: string;
  sku?: string;
  productName?: string;
  variantLabel?: string;
  orderedQty?: number;
  receivedQty?: number;
  pendingQty?: number;
}

interface BackendBatch {
  _id?: string;
  batchCode?: string;
  supplier?: string;
  orderDate?: string;
  expectedDate?: string;
  status?: PreorderBatchStatus;
  totalItems?: number;
  receivedItems?: number;
  note?: string;
  createdBy?: {
    name?: string;
  };
  items?: BackendBatchItem[];
}

function extractBatchRows(payload: unknown): {
  rows: BackendBatch[];
  pagination?: BackendEnvelope<BackendBatch[]>['pagination'];
} {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid preorder response.');
  }

  const envelope = payload as BackendEnvelope<BackendBatch[]>;
  if (Array.isArray(envelope.data)) {
    return {
      rows: envelope.data,
      pagination: envelope.pagination,
    };
  }

  if (Array.isArray((payload as any).data?.data)) {
    return {
      rows: (payload as any).data.data as BackendBatch[],
      pagination: (payload as any).pagination,
    };
  }

  throw new Error('Invalid preorder response shape.');
}

function extractBatch(payload: unknown): BackendBatch {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid preorder batch response.');
  }

  const envelope = payload as BackendEnvelope<BackendBatch>;
  const raw = envelope.data ?? (payload as BackendBatch);
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid preorder batch response shape.');
  }

  return raw;
}

function mapBatchItem(item: BackendBatchItem): PreorderBatchItem {
  const productId =
    typeof item.productId === 'string'
      ? item.productId
      : String(item.productId?._id || '');

  return {
    id: String(item._id || ''),
    productId,
    variantId: String(item.variantId || ''),
    sku: String(item.sku || ''),
    productName: String(item.productName || ''),
    variant: String(item.variantLabel || '').trim() || 'Mac dinh',
    orderedQty: Number(item.orderedQty || 0),
    receivedQty: Number(item.receivedQty || 0),
    pendingQty: Number(item.pendingQty || 0),
  };
}

function mapBatch(batch: BackendBatch): PreorderBatchRecord {
  return {
    id: String(batch._id || ''),
    batchCode: String(batch.batchCode || ''),
    supplier: String(batch.supplier || ''),
    orderDate: String(batch.orderDate || ''),
    expectedDate: String(batch.expectedDate || batch.orderDate || ''),
    status: (batch.status || 'pending') as PreorderBatchStatus,
    totalItems: Number(batch.totalItems || 0),
    receivedItems: Number(batch.receivedItems || 0),
    notes: String(batch.note || ''),
    createdByName: String(batch.createdBy?.name || ''),
    items: Array.isArray(batch.items) ? batch.items.map(mapBatchItem) : [],
  };
}

export interface ListPreorderBatchesParams {
  page?: number;
  limit?: number;
  status?: PreorderBatchStatus | 'all';
  supplier?: string;
  search?: string;
}

export interface CreatePreorderBatchInput {
  batchCode: string;
  storeId?: string;
  supplier: string;
  orderDate: string;
  expectedDate?: string;
  note?: string;
  items: Array<{
    productId: string;
    variantId: string;
    orderedQty: number;
    sku?: string;
    variantLabel?: string;
  }>;
}

export interface ReceivePreorderBatchInput {
  receivedAt?: string;
  note?: string;
  items: Array<{
    batchItemId: string;
    quantity: number;
  }>;
}

export const preorderApi = {
  listBatches: async (params?: ListPreorderBatchesParams) => {
    const response = await apiClient.get('/api/preorders/batches', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 100,
        status: params?.status && params.status !== 'all' ? params.status : undefined,
        supplier: params?.supplier || undefined,
        search: params?.search || undefined,
      },
    });

    const { rows, pagination } = extractBatchRows(response.data);
    return {
      batches: rows.map(mapBatch),
      pagination: {
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? rows.length,
        total: pagination?.total ?? rows.length,
        totalPages: pagination?.totalPages ?? 1,
      },
    };
  },

  getBatchById: async (id: string): Promise<PreorderBatchRecord> => {
    const response = await apiClient.get(`/api/preorders/batches/${id}`);
    return mapBatch(extractBatch(response.data));
  },

  createBatch: async (
    payload: CreatePreorderBatchInput
  ): Promise<PreorderBatchRecord> => {
    const response = await apiClient.post('/api/preorders/batches', payload);
    return mapBatch(extractBatch(response.data));
  },

  receiveBatch: async (
    id: string,
    payload: ReceivePreorderBatchInput
  ): Promise<PreorderBatchRecord> => {
    const response = await apiClient.post(`/api/preorders/batches/${id}/receive`, payload);
    return mapBatch(extractBatch(response.data));
  },
};

export default preorderApi;
