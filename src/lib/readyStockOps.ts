import type { OrderItem, OrderRecord } from '@/api/orders';
import type {
  ReadyStockItemOpsState,
  ReadyStockOrderOpsState,
  ReadyStockOpsStatus,
} from '@/types/readyStockOps';

export const READY_STOCK_OPS_STATUS_LABEL: Record<ReadyStockOpsStatus, string> =
  {
    pending_operations: 'Cho nhan xu ly',
    picking: 'Dang lay hang',
    packing: 'Dang dong goi',
    ready_to_ship: 'San sang tao van don',
    shipment_created: 'Da tao van don',
    handover_to_carrier: 'Da ban giao VC',
    in_transit: 'Dang van chuyen',
    delivery_failed: 'Giao that bai',
    waiting_redelivery: 'Cho giao lai',
    return_pending: 'Cho hoan hang',
    return_in_transit: 'Dang hoan hang',
    waiting_customer_info: 'Cho staff bo sung thong tin',
    on_hold: 'Hold noi bo',
    exception_hold: 'Ngoai le giao van',
    delivered: 'Da giao',
    closed: 'Da dong ho so',
    returned: 'Hoan hang',
    // Legacy UI aliases kept temporarily for persisted local state compatibility.
    awaiting_picking: 'Cho nhan xu ly',
    packed: 'Dang dong goi',
    shipped: 'Da ban giao VC',
    blocked: 'Hold',
  };

export function getReadyStockOpsStatusLabel(
  ops: Pick<ReadyStockOrderOpsState, 'opsStatus' | 'trackingCode'>
): string {
  return READY_STOCK_OPS_STATUS_LABEL[ops.opsStatus];
}

export function inferReadyStockOpsStatus(
  order: OrderRecord
): ReadyStockOpsStatus {
  const opsStage = String(order.opsStage || '')
    .trim()
    .toLowerCase();
  const shipmentStatus = String(order.shipment?.latestStatus || '')
    .trim()
    .toLowerCase();
  const shipmentState = String(order.shipment?.state || '')
    .trim()
    .toLowerCase();
  const hasShipment = Boolean(
    String(
      order.shipment?.orderCode || order.shipment?.trackingCode || ''
    ).trim()
  );
  const raw = String(order.rawStatus || '')
    .trim()
    .toLowerCase();

  if (
    [
      'pending_operations',
      'picking',
      'packing',
      'ready_to_ship',
      'shipment_created',
      'handover_to_carrier',
      'in_transit',
      'delivery_failed',
      'waiting_redelivery',
      'return_pending',
      'return_in_transit',
      'waiting_customer_info',
      'on_hold',
      'exception_hold',
      'delivered',
      'closed',
      'returned',
    ].includes(opsStage)
  ) {
    return opsStage as ReadyStockOpsStatus;
  }

  if (shipmentStatus === 'returned') return 'returned';
  if (shipmentStatus === 'delivered') return 'delivered';
  if (shipmentStatus === 'delivery_fail') return 'delivery_failed';
  if (shipmentStatus === 'waiting_to_return') return 'waiting_redelivery';
  if (shipmentStatus === 'return') return 'return_pending';

  if (
    ['return_transporting', 'return_sorting', 'returning'].includes(
      shipmentStatus
    )
  ) {
    return 'return_in_transit';
  }

  if (
    [
      'return_fail',
      'exception',
      'damage',
      'lost',
      'cancel',
      'cancelled',
    ].includes(shipmentStatus)
  ) {
    return 'exception_hold';
  }

  if (
    [
      'transporting',
      'sorting',
      'delivering',
      'money_collect_delivering',
    ].includes(shipmentStatus)
  ) {
    return 'in_transit';
  }

  if (
    ['picking', 'money_collect_picking', 'picked', 'storing'].includes(
      shipmentStatus
    )
  ) {
    return 'handover_to_carrier';
  }

  if (shipmentStatus === 'ready_to_pick') return 'shipment_created';

  if (shipmentState === 'returned') return 'returned';
  if (shipmentState === 'delivered') return 'delivered';
  if (shipmentState === 'failed') return 'delivery_failed';
  if (shipmentState === 'returning') return 'return_in_transit';
  if (shipmentState === 'in_transit') return 'in_transit';
  if (shipmentState === 'created' || hasShipment) return 'shipment_created';

  if (raw === 'cancelled') return 'exception_hold';
  if (raw === 'returned') return 'returned';
  if (raw === 'delivered') return 'delivered';
  if (raw === 'shipped') return 'handover_to_carrier';
  if (raw === 'processing') return 'picking';
  if (raw === 'confirmed') return 'pending_operations';
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
  const backendOps = order.opsExecution || {};
  const salesApprovedAt = inferSalesApprovedAt(order);
  const itemStates: Record<string, ReadyStockItemOpsState> = {};

  order.items.forEach((item, index) => {
    const key = getReadyStockItemKey(order.id, item, index);
    itemStates[key] = {
      ...createDefaultReadyStockItemState(item),
      ...(backendOps.itemStates?.[key] || {}),
    };
  });

  return {
    opsStatus: inferReadyStockOpsStatus(order),
    lastUpdatedAt: backendOps.lastUpdatedAt || new Date().toISOString(),
    assignee: backendOps.assignee || '',
    salesApprovedAt: backendOps.salesApprovedAt || salesApprovedAt,
    salesApprovedBy: backendOps.salesApprovedBy || 'Sales/Support',
    salesHandoffNote:
      backendOps.salesHandoffNote ||
      'Sales da kiem tra thong tin giao hang, xac nhan don du dieu kien xu ly van hanh.\n' +
        'Route vao queue Ready Stock vi: khong phai pre-order, khong phai prescription.',
    internalNote: backendOps.internalNote || '',
    holdReason: backendOps.holdReason || null,
    holdNote: backendOps.holdNote || '',
    paymentFailed: Boolean(backendOps.paymentFailed),
    checklist: {
      skuQuantityChecked: Boolean(backendOps.checklist?.skuQuantityChecked),
      productConditionChecked: Boolean(
        backendOps.checklist?.productConditionChecked
      ),
      addressChecked: Boolean(backendOps.checklist?.addressChecked),
      packageReady: Boolean(backendOps.checklist?.packageReady),
    },
    carrierId: String(
      backendOps.carrierId || order.shipment?.provider || ''
    )
      .trim()
      .toLowerCase(),
    trackingCode: String(
      backendOps.trackingCode ||
        order.shipment?.orderCode ||
        order.shipment?.trackingCode ||
        ''
    ).trim(),
    issueType: backendOps.issueType || null,
    issueNote: backendOps.issueNote || '',
    itemStates,
  };
}

export function getReadyStockSlaHours(order: OrderRecord): number {
  const note = String(order.note || '').toLowerCase();
  if (note.includes('gap')) return 8;
  if (note.includes('vip') || note.includes('gap')) return 8;
  if (order.paymentStatus === 'pending' && order.paymentMethod !== 'cod') {
    return 24;
  }
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

  if (order.paymentStatus === 'pending' && order.paymentMethod !== 'cod') {
    warnings.add('payment_pending');
  }
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
  if (
    ['waiting_customer_info', 'on_hold', 'exception_hold', 'blocked'].includes(
      ops.opsStatus
    )
  ) {
    warnings.add('hold');
  }

  return Array.from(warnings);
}
