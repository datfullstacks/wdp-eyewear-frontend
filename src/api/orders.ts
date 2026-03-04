import apiClient from './client';

export type UiOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type UiPaymentStatus = 'paid' | 'pending' | 'partial' | 'cod';

interface BackendEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface BackendShippingAddress {
  fullName?: string;
  phone?: string;
  line1?: string;
  district?: string;
  province?: string;
}

interface BackendItemCustomization {
  prescription?: {
    mode?: 'none' | 'manual' | 'upload' | string;
  };
}

interface BackendOrderItem {
  name?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  preOrder?: boolean;
  variantOptions?: {
    color?: string;
    size?: string;
  };
  customization?: BackendItemCustomization;
}

interface BackendOrder {
  _id?: string;
  id?: string;
  paymentCode?: string;
  items?: BackendOrderItem[];
  total?: number;
  payNowTotal?: number;
  payLaterTotal?: number;
  paidAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderType?: string;
  status?: string;
  note?: string;
  createdAt?: string;
  shippingAddress?: BackendShippingAddress;
}

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variant: string;
  preOrder: boolean;
  hasPrescription: boolean;
}

export interface OrderRecord {
  id: string;
  code: string;
  status: UiOrderStatus;
  rawStatus: string;
  paymentStatus: UiPaymentStatus;
  paymentMethod: string;
  orderType: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  payNowTotal: number;
  payLaterTotal: number;
  paidAmount: number;
  note: string;
  createdAt?: string;
}

export interface OrdersResponse {
  orders: OrderRecord[];
  total: number;
  page: number;
  pageSize: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mapOrderStatus(rawStatus?: string): UiOrderStatus {
  const normalized = String(rawStatus || '').trim().toLowerCase();

  if (normalized === 'delivered') return 'completed';
  if (normalized === 'cancelled' || normalized === 'returned') return 'cancelled';
  if (normalized === 'confirmed' || normalized === 'processing' || normalized === 'shipped') {
    return 'processing';
  }
  return 'pending';
}

function mapPaymentStatus(rawStatus?: string, paymentMethod?: string): UiPaymentStatus {
  const normalizedMethod = String(paymentMethod || '').trim().toLowerCase();
  if (normalizedMethod === 'cod') return 'cod';

  const normalized = String(rawStatus || '').trim().toLowerCase();
  if (normalized === 'paid') return 'paid';
  if (normalized === 'partial') return 'partial';
  return 'pending';
}

function toVariantLabel(item?: BackendOrderItem): string {
  const color = String(item?.variantOptions?.color || '').trim();
  const size = String(item?.variantOptions?.size || '').trim();
  if (color && size) return `${color} - ${size}`;
  return color || size || 'Mặc định';
}

function toAddressLabel(address?: BackendShippingAddress): string {
  const parts = [address?.line1, address?.district, address?.province]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return parts.join(', ');
}

function mapOrderItem(raw: BackendOrderItem): OrderItem {
  const mode = String(raw?.customization?.prescription?.mode || '')
    .trim()
    .toLowerCase();
  return {
    name: String(raw?.name || '').trim() || 'Sản phẩm',
    quantity: Number(raw?.quantity || 0),
    unitPrice: Number(raw?.unitPrice || 0),
    lineTotal: Number(raw?.lineTotal || 0),
    variant: toVariantLabel(raw),
    preOrder: Boolean(raw?.preOrder),
    hasPrescription: mode === 'manual' || mode === 'upload',
  };
}

function mapBackendOrder(raw: BackendOrder): OrderRecord {
  const id = String(raw._id || raw.id || '').trim();
  const code = String(raw.paymentCode || '').trim() || id;
  const items = (raw.items || []).map(mapOrderItem);

  return {
    id,
    code,
    status: mapOrderStatus(raw.status),
    rawStatus: String(raw.status || '').trim().toLowerCase() || 'pending',
    paymentStatus: mapPaymentStatus(raw.paymentStatus, raw.paymentMethod),
    paymentMethod: String(raw.paymentMethod || '').trim().toLowerCase(),
    orderType: String(raw.orderType || '').trim().toLowerCase(),
    customerName: String(raw.shippingAddress?.fullName || '').trim() || 'Khách hàng',
    customerPhone: String(raw.shippingAddress?.phone || '').trim(),
    customerAddress: toAddressLabel(raw.shippingAddress),
    items,
    total: Number(raw.total || 0),
    payNowTotal: Number(raw.payNowTotal || 0),
    payLaterTotal: Number(raw.payLaterTotal || 0),
    paidAmount: Number(raw.paidAmount || 0),
    note: String(raw.note || '').trim(),
    createdAt: raw.createdAt,
  };
}

function extractOrdersPayload(
  payload: unknown
): { rows: BackendOrder[]; pagination?: BackendEnvelope<unknown>['pagination'] } {
  if (typeof payload === 'string') {
    throw new Error('Invalid orders response (received string).');
  }

  if (Array.isArray(payload)) {
    return { rows: payload as BackendOrder[] };
  }

  if (!isRecord(payload)) {
    throw new Error('Invalid orders response.');
  }

  const pagination =
    (payload.pagination as BackendEnvelope<unknown>['pagination']) ||
    (isRecord(payload.data) ? ((payload.data as any).pagination as any) : undefined);

  const dataField = payload.data;
  if (Array.isArray(dataField)) {
    return { rows: dataField as BackendOrder[], pagination };
  }

  if (isRecord(dataField) && Array.isArray((dataField as any).data)) {
    return { rows: (dataField as any).data as BackendOrder[], pagination };
  }

  if (Array.isArray((payload as any).orders)) {
    return { rows: (payload as any).orders as BackendOrder[], pagination };
  }

  throw new Error('Invalid orders response shape.');
}

function extractOrderPayload(payload: unknown): BackendOrder {
  if (typeof payload === 'string') {
    throw new Error('Invalid order response (received string).');
  }

  if (!isRecord(payload)) {
    throw new Error('Invalid order response.');
  }

  const dataField = payload.data;

  if (isRecord(dataField)) {
    return dataField as BackendOrder;
  }

  if (isRecord((payload as any).order)) {
    return (payload as any).order as BackendOrder;
  }

  if (typeof (payload as any)._id === 'string' || typeof (payload as any).id === 'string') {
    return payload as BackendOrder;
  }

  throw new Error('Invalid order response shape.');
}

export const orderApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    refundStatus?: string;
    userId?: string;
  }): Promise<OrdersResponse> => {
    const response = await apiClient.get('/api/orders', { params });
    const { rows, pagination } = extractOrdersPayload(response.data);

    return {
      orders: rows.map(mapBackendOrder),
      total: pagination?.total ?? rows.length,
      page: pagination?.page ?? (params?.page || 1),
      pageSize: pagination?.limit ?? (params?.limit || rows.length || 10),
    };
  },

  getById: async (id: string): Promise<OrderRecord> => {
    const response = await apiClient.get(`/api/orders/${id}`);
    const raw = extractOrderPayload(response.data);
    return mapBackendOrder(raw);
  },
};

export default orderApi;
