import apiClient from './client';
import type {
  CheckoutData,
  OrderDetailData,
  QuoteData,
  SaleCheckoutPayload,
  SaleProduct,
} from '@/types/saleCheckout';

interface BackendEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractRows(payload: unknown): SaleProduct[] {
  if (Array.isArray(payload)) return payload as SaleProduct[];
  if (!isRecord(payload)) return [];

  if (Array.isArray(payload.data)) return payload.data as SaleProduct[];
  if (isRecord(payload.data) && Array.isArray((payload.data as any).data)) {
    return (payload.data as any).data as SaleProduct[];
  }
  if (Array.isArray((payload as any).products)) {
    return (payload as any).products as SaleProduct[];
  }

  return [];
}

function extractData<T>(payload: unknown): T {
  if (isRecord(payload) && 'data' in payload) {
    return (payload as BackendEnvelope<T>).data as T;
  }
  return payload as T;
}

export async function getProducts(): Promise<SaleProduct[]> {
  const response = await apiClient.get('/api/products', {
    params: {
      sort: '-createdAt',
    },
  });

  const rows = extractRows(response.data);
  return rows.filter((product) => Boolean(product?._id));
}

export async function createQuote(
  payload: SaleCheckoutPayload
): Promise<QuoteData> {
  const response = await apiClient.post('/api/checkout/quote', payload);
  return extractData<QuoteData>(response.data);
}

export async function createCheckout(
  payload: SaleCheckoutPayload
): Promise<CheckoutData> {
  const response = await apiClient.post('/api/checkout', payload);
  return extractData<CheckoutData>(response.data);
}

export async function getOrderDetail(orderId: string): Promise<OrderDetailData> {
  const response = await apiClient.get(`/api/orders/${orderId}`);
  return extractData<OrderDetailData>(response.data);
}
