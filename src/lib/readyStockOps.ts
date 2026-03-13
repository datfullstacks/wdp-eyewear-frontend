import type { OrderItem, OrderRecord } from '@/api/orders';
import type {
  ReadyStockItemOpsState,
  ReadyStockOrderOpsState,
  ReadyStockOpsStatus,
} from '@/types/readyStockOps';

export const READY_STOCK_OPS_STATUS_LABEL: Record<ReadyStockOpsStatus, string> =
  {
    pending_operations: 'Chờ nhận xử lý',
    awaiting_picking: 'Chờ nhận xử lý',
    picking: 'Đang lấy hàng',
    packed: 'Đang đóng gói',
    ready_to_ship: 'Chờ tạo vận đơn',
    shipped: 'Đã bàn giao vận chuyển',
    blocked: 'Hold',
    in_transit: 'Đang vận chuyển',
    delivered: 'Đã giao',
    delivery_failed: 'Giao thất bại',
    returned: 'Hoàn hàng',
  };

export function getReadyStockOpsStatusLabel(
  ops: Pick<ReadyStockOrderOpsState, 'opsStatus' | 'trackingCode'>
): string {
  if (
    ops.opsStatus === 'ready_to_ship' &&
    String(ops.trackingCode || '').trim()
  ) {
    return 'Chá» bÃ n giao váº­n chuyá»ƒn';
  }

  return READY_STOCK_OPS_STATUS_LABEL[ops.opsStatus];
}

export function inferReadyStockOpsStatus(
  order: OrderRecord
): ReadyStockOpsStatus {
  const raw = String(order.rawStatus || '')
    .trim()
    .toLowerCase();
  if (order.status === 'cancelled') return 'blocked';
  if (raw === 'returned') return 'returned';
  if (raw === 'delivered') return 'delivered';
  if (raw === 'shipped') return 'shipped';
  if (raw === 'processing') return 'picking';
  return 'pending_operations';
}

function safeDate(dateValue?: string): Date | null {
  if (!dateValue) return null;
  const dt = new Date(dateValue);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function addMinutes(base: Date, minutes: number): Date {
  const next = new Date(base.getTime());
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

export function inferSalesApprovedAt(order: OrderRecord): string {
  const created = safeDate(order.createdAt) ?? new Date();
  return addMinutes(created, 20).toISOString();
}

export function getReadyStockItemKey(
  orderId: string,
  item: OrderItem,
  index: number
): string {
  const raw = String(item.id || '').trim();
  if (raw) return raw;
  return `${orderId}:item:${index + 1}`;
}

function warehouseLocationForType(itemType: string): string {
  const t = String(itemType || '')
    .trim()
    .toLowerCase();
  if (t === 'frame') return 'KHO-HCM-FRAME-A1';
  if (t === 'lens') return 'KHO-HCM-LENS-B2';
  if (t === 'accessory') return 'KHO-HCM-ACC-C3';
  return 'KHO-HCM-OTHER-Z9';
}

export function createDefaultReadyStockItemState(
  item: OrderItem
): ReadyStockItemOpsState {
  return {
    picked: false,
    warehouseLocation: warehouseLocationForType(item.type),
    issueType: null,
    issueNote: '',
    internalNote: '',
  };
}

export function createDefaultReadyStockOpsState(
  order: OrderRecord
): ReadyStockOrderOpsState {
  const salesApprovedAt = inferSalesApprovedAt(order);
  const itemStates: Record<string, ReadyStockItemOpsState> = {};

  order.items.forEach((item, index) => {
    itemStates[getReadyStockItemKey(order.id, item, index)] =
      createDefaultReadyStockItemState(item);
  });

  return {
    opsStatus: inferReadyStockOpsStatus(order),
    lastUpdatedAt: new Date().toISOString(),
    assignee: '',
    salesApprovedAt,
    salesApprovedBy: 'Sales/Support',
    salesHandoffNote:
      'Sales đã kiểm tra thông tin giao hàng, xác nhận đơn đủ điều kiện xử lý vận hành.\n' +
      'Route vào queue Ready Stock vì: không phải pre-order, không phải prescription.',
    internalNote: '',
    holdReason: null,
    holdNote: '',
    paymentFailed: false,
    checklist: {
      skuQuantityChecked: false,
      productConditionChecked: false,
      addressChecked: false,
      packageReady: false,
    },
    carrierId: '',
    trackingCode: '',
    issueType: null,
    issueNote: '',
    itemStates,
  };
}

export function getReadyStockSlaHours(order: OrderRecord): number {
  const note = String(order.note || '').toLowerCase();
  if (note.includes('gap')) return 8;
  if (note.includes('vip') || note.includes('gấp')) return 8;
  if (order.paymentStatus === 'pending' && order.paymentMethod !== 'cod')
    return 24;
  return 24;
}

export function getReadyStockDueAt(order: OrderRecord): Date | null {
  const createdAt = safeDate(order.createdAt);
  if (!createdAt) return null;
  const dueAt = new Date(createdAt.getTime());
  dueAt.setHours(dueAt.getHours() + getReadyStockSlaHours(order));
  return dueAt;
}

export function formatCurrencyVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function toInvoiceCode(order: OrderRecord): string {
  const created = safeDate(order.createdAt) ?? new Date();
  const yyyy = String(created.getFullYear());
  const mm = String(created.getMonth() + 1).padStart(2, '0');
  const dd = String(created.getDate()).padStart(2, '0');
  const suffix =
    String(order.code || order.id)
      .replace(/[^0-9]/g, '')
      .slice(-8) || '00000000';
  return `INV-${yyyy}${mm}${dd}-${suffix}`;
}

export function toPaymentCode(order: OrderRecord): string {
  const created = safeDate(order.createdAt) ?? new Date();
  const yyyy = String(created.getFullYear());
  const mm = String(created.getMonth() + 1).padStart(2, '0');
  const dd = String(created.getDate()).padStart(2, '0');
  const suffix =
    String(order.code || order.id)
      .replace(/[^0-9]/g, '')
      .slice(-8) || '00000000';
  return `PAY-${yyyy}${mm}${dd}-${suffix}`;
}

export function toShortLocation(address: string): string {
  const parts = String(address || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return '-';
  if (parts.length === 1) return parts[0]!;
  return parts.slice(-2).join(', ');
}

export function summarizeItems(order: OrderRecord): {
  totalItems: number;
  byType: Record<string, number>;
  mainProduct: string;
} {
  const byType: Record<string, number> = {};
  order.items.forEach((item) => {
    const t = String(item.type || 'other').toLowerCase();
    byType[t] = (byType[t] || 0) + (item.quantity || 0);
  });
  return {
    totalItems: order.items.reduce((acc, i) => acc + (i.quantity || 0), 0),
    byType,
    mainProduct: order.items[0]?.name || '-',
  };
}

export type ReadyStockWarningKey =
  | 'missing_address'
  | 'payment_pending'
  | 'payment_failed'
  | 'special_note'
  | 'item_issue'
  | 'order_issue'
  | 'hold';

export function getReadyStockWarnings(
  order: OrderRecord,
  ops: ReadyStockOrderOpsState
): ReadyStockWarningKey[] {
  const warnings = new Set<ReadyStockWarningKey>();

  const address = String(order.customerAddress || '').trim();
  if (!address || address.length < 10) warnings.add('missing_address');

  if (order.paymentStatus === 'pending' && order.paymentMethod !== 'cod')
    warnings.add('payment_pending');
  if (ops.paymentFailed) warnings.add('payment_failed');

  if (
    String(order.note || '').trim() ||
    String(ops.salesHandoffNote || '').trim() ||
    String(ops.internalNote || '').trim()
  ) {
    warnings.add('special_note');
  }

  const hasItemIssue = Object.values(ops.itemStates || {}).some((s) =>
    Boolean(s.issueType)
  );
  if (hasItemIssue) warnings.add('item_issue');

  if (ops.issueType) warnings.add('order_issue');
  if (ops.opsStatus === 'blocked') warnings.add('hold');

  return Array.from(warnings);
}
