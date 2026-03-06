import apiClient from './client';

export type UiOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type UiPaymentStatus = 'paid' | 'pending' | 'partial' | 'cod';
export type PrescriptionMode = 'none' | 'manual' | 'upload';

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
  orderMadeFromPrescriptionImage?: boolean;
  prescription?: {
    mode?: PrescriptionMode | string;
    isMyopic?: boolean;
    rightEye?: {
      sphere?: string;
      cyl?: string;
      axis?: string;
      add?: string;
    };
    leftEye?: {
      sphere?: string;
      cyl?: string;
      axis?: string;
      add?: string;
    };
    pd?: string;
    note?: string;
    attachmentUrls?: string[];
  };
}

interface BackendOrderItem {
  _id?: string;
  name?: string;
  type?: string;
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
  id: string;
  name: string;
  type: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variant: string;
  preOrder: boolean;
  hasPrescription: boolean;
  prescriptionMode: PrescriptionMode;
  orderMadeFromPrescriptionImage: boolean;
  prescription: {
    mode: PrescriptionMode;
    isMyopic: boolean;
    rightEye: {
      sphere: string;
      cyl: string;
      axis: string;
      add: string;
    };
    leftEye: {
      sphere: string;
      cyl: string;
      axis: string;
      add: string;
    };
    pd: string;
    note: string;
    attachmentUrls: string[];
  } | null;
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
  const mode = String(raw?.customization?.prescription?.mode || 'none')
    .trim()
    .toLowerCase();
  const normalizedMode: PrescriptionMode =
    mode === 'manual' || mode === 'upload' ? mode : 'none';
  const prescriptionPayload = raw?.customization?.prescription;
  const rightEye: NonNullable<BackendItemCustomization['prescription']>['rightEye'] =
    prescriptionPayload?.rightEye || {};
  const leftEye: NonNullable<BackendItemCustomization['prescription']>['leftEye'] =
    prescriptionPayload?.leftEye || {};
  const attachmentUrls = Array.isArray(prescriptionPayload?.attachmentUrls)
    ? prescriptionPayload?.attachmentUrls
        .map((url) => String(url || '').trim())
        .filter(Boolean)
    : [];
  const hasPrescription = normalizedMode === 'manual' || normalizedMode === 'upload';

  return {
    id: String(raw?._id || '').trim(),
    name: String(raw?.name || '').trim() || 'Sản phẩm',
    type: String(raw?.type || '').trim().toLowerCase(),
    quantity: Number(raw?.quantity || 0),
    unitPrice: Number(raw?.unitPrice || 0),
    lineTotal: Number(raw?.lineTotal || 0),
    variant: toVariantLabel(raw),
    preOrder: Boolean(raw?.preOrder),
    hasPrescription,
    prescriptionMode: normalizedMode,
    orderMadeFromPrescriptionImage: Boolean(
      raw?.customization?.orderMadeFromPrescriptionImage
    ),
    prescription: hasPrescription
      ? {
          mode: normalizedMode,
          isMyopic: Boolean(prescriptionPayload?.isMyopic),
          rightEye: {
            sphere: String(rightEye?.sphere || '').trim(),
            cyl: String(rightEye?.cyl || '').trim(),
            axis: String(rightEye?.axis || '').trim(),
            add: String(rightEye?.add || '').trim(),
          },
          leftEye: {
            sphere: String(leftEye?.sphere || '').trim(),
            cyl: String(leftEye?.cyl || '').trim(),
            axis: String(leftEye?.axis || '').trim(),
            add: String(leftEye?.add || '').trim(),
          },
          pd: String(prescriptionPayload?.pd || '').trim(),
          note: String(prescriptionPayload?.note || '').trim(),
          attachmentUrls,
        }
      : null,
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

  updateStatus: async (id: string, status: string): Promise<void> => {
    await apiClient.put(`/api/orders/${id}/status`, { status });
  },

  cancel: async (
    id: string,
    payload?: {
      reason?: string;
      contactChannels?: Array<'email' | 'phone'>;
      bankAccount?: {
        bankName?: string;
        accountNumber?: string;
        accountHolder?: string;
        note?: string;
      };
    }
  ): Promise<void> => {
    await apiClient.put(`/api/orders/${id}/cancel`, payload || {});
  },

  patchItem: async (
    orderId: string,
    itemId: string,
    payload: {
      quantity?: number;
      note?: string;
      customization?: {
        selectedColor?: string;
        selectedSize?: string;
        photochromic?: boolean;
        note?: string;
        prescription?: {
          mode?: PrescriptionMode;
          isMyopic?: boolean;
          rightEye?: {
            sphere?: string;
            cyl?: string;
            axis?: string;
            add?: string;
          };
          leftEye?: {
            sphere?: string;
            cyl?: string;
            axis?: string;
            add?: string;
          };
          pd?: string;
          note?: string;
          attachmentUrls?: string[];
        };
      };
    }
  ): Promise<void> => {
    await apiClient.patch(`/api/orders/${orderId}/items/${itemId}`, payload);
  },
};

export default orderApi;
