import type { OrderRecord } from '@/api/orders';
import type { PendingOrder, PendingPriority, PaymentStatus } from '@/types/pending';
import type { PreorderOrder, PreorderProduct } from '@/types/preorder';

export type DashboardOrder = {
  id: string;
  customerName: string;
  products: string[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
};

function formatDate(dateValue?: string): string {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateValue?: string): string {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hour}:${minute}`;
}

function inferPendingPriority(order: OrderRecord): PendingPriority {
  const now = Date.now();
  const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : NaN;
  const ageHours = Number.isNaN(createdAt) ? 0 : (now - createdAt) / (1000 * 60 * 60);
  const note = (order.note || '').toLowerCase();

  if (note.includes('vip') || note.includes('gấp') || ageHours >= 48) return 'urgent';
  if (ageHours >= 24 || order.total >= 8_000_000) return 'high';
  if (order.total <= 1_500_000) return 'low';
  return 'normal';
}

function mapPaymentStatus(status: OrderRecord['paymentStatus']): PaymentStatus {
  if (status === 'paid') return 'paid';
  if (status === 'partial') return 'partial';
  if (status === 'cod') return 'cod';
  return 'pending';
}

function estimateExpectedDate(dateValue?: string): string {
  const base = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(base.getTime())) return new Date().toISOString().slice(0, 10);
  const next = new Date(base.getTime());
  next.setDate(next.getDate() + 14);
  return next.toISOString().slice(0, 10);
}

function mapPreorderStatus(order: OrderRecord): PreorderOrder['status'] {
  if (order.status === 'cancelled') return 'cancelled';
  if (order.status === 'processing' || order.status === 'completed') return 'ready';
  return 'waiting_stock';
}

function mapPreorderProductStatus(order: OrderRecord): PreorderProduct['status'] {
  if (order.status === 'processing' || order.status === 'completed') return 'arrived';
  return 'waiting';
}

function inferPreorderPriority(order: OrderRecord): PreorderOrder['priority'] {
  const now = Date.now();
  const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : NaN;
  const ageHours = Number.isNaN(createdAt) ? 0 : (now - createdAt) / (1000 * 60 * 60);
  const note = (order.note || '').toLowerCase();

  if (note.includes('vip') || note.includes('gấp') || ageHours >= 72) return 'urgent';
  if (ageHours >= 24 || order.total >= 10_000_000) return 'high';
  return 'normal';
}

export function toDashboardOrder(order: OrderRecord): DashboardOrder {
  return {
    id: order.code,
    customerName: order.customerName,
    products: order.items.map((item) => item.name),
    total: order.total,
    status: order.status,
    date: formatDate(order.createdAt),
  };
}

export function toPendingOrder(order: OrderRecord): PendingOrder {
  const products =
    order.items.length > 0
      ? order.items.map((item) => ({
          name: item.name,
          variant: item.variant,
          qty: item.quantity,
          price: item.unitPrice,
        }))
      : [
          {
            name: 'Sản phẩm',
            variant: 'Mặc định',
            qty: 1,
            price: order.total,
          },
        ];

  return {
    id: order.code,
    customer: order.customerName,
    phone: order.customerPhone || '-',
    address: order.customerAddress || '-',
    products,
    total: order.total,
    status: order.rawStatus || 'pending',
    priority: inferPendingPriority(order),
    createdAt: formatDateTime(order.createdAt),
    note: order.note || '',
    hasPrescription: order.items.some((item) => item.hasPrescription),
    paymentStatus: mapPaymentStatus(order.paymentStatus),
  };
}

export function toPreorderOrder(order: OrderRecord): PreorderOrder {
  const products: PreorderProduct[] =
    order.items.length > 0
      ? order.items.map((item, index) => ({
          sku: `${order.id.slice(-6).toUpperCase()}-${index + 1}`,
          name: item.name,
          variant: item.variant,
          quantity: item.quantity,
          batchCode: null,
          batchExpectedDate: null,
          status: mapPreorderProductStatus(order),
        }))
      : [
          {
            sku: `${order.id.slice(-6).toUpperCase()}-1`,
            name: 'Sản phẩm',
            variant: 'Mặc định',
            quantity: 1,
            batchCode: null,
            batchExpectedDate: null,
            status: mapPreorderProductStatus(order),
          },
        ];

  return {
    id: order.id,
    orderCode: order.code,
    customerName: order.customerName,
    customerPhone: order.customerPhone || '-',
    customerAddress: order.customerAddress || '-',
    orderDate: order.createdAt ? order.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    expectedDate: estimateExpectedDate(order.createdAt),
    products,
    totalAmount: order.total,
    paymentStatus: mapPaymentStatus(order.paymentStatus),
    depositAmount: Math.min(order.paidAmount, order.payNowTotal),
    status: mapPreorderStatus(order),
    notes: order.note || '',
    priority: inferPreorderPriority(order),
  };
}
