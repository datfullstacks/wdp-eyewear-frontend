import type { OrderRecord } from '@/api/orders';
import { toPrescriptionOrder, toSupplementOrder } from '@/lib/orderAdapters';
import type { DelayedOrder, DelayType, SeverityLevel } from '@/types/delayed';

export type OrderMenuCounts = {
  needsAction: number;
  readyStock: number;
  preorder: number;
  prescription: number;
  prescriptionNeeded: number;
  processing: number;
  alerts: number;
};

export const DEFAULT_ORDER_ALERT_THRESHOLDS = {
  confirmationDeadlineHours: 24,
  paymentPendingHours: 24,
  rxSupplementHours: 72,
  preorderEtaDays: 14,
  processingSlaDays: 5,
} as const;

function toTimestamp(dateValue?: string): number | null {
  if (!dateValue) return null;
  const ts = new Date(dateValue).getTime();
  if (Number.isNaN(ts)) return null;
  return ts;
}

export function getOrderAgeHours(order: Pick<OrderRecord, 'createdAt'>): number {
  const createdTs = toTimestamp(order.createdAt);
  if (!createdTs) return 0;
  return Math.max(0, (Date.now() - createdTs) / (1000 * 60 * 60));
}

export function getOrderAgeDays(order: Pick<OrderRecord, 'createdAt'>): number {
  return getOrderAgeHours(order) / 24;
}

export function isPreorderOrder(order: Pick<OrderRecord, 'orderType' | 'items'>): boolean {
  return (
    String(order.orderType || '').toLowerCase() === 'pre_order' ||
    order.items.some((item) => item.preOrder)
  );
}

export function isPrescriptionOrder(order: OrderRecord): boolean {
  return toPrescriptionOrder(order) !== null;
}

export function needsPrescriptionSupplement(order: OrderRecord): boolean {
  return toSupplementOrder(order) !== null;
}

export function isReadyStockOrder(order: OrderRecord): boolean {
  const orderType = String(order.orderType || '').toLowerCase();
  if (orderType !== 'ready_stock') return false;
  if (isPreorderOrder(order)) return false;
  if (isPrescriptionOrder(order)) return false;
  if (order.status === 'cancelled') return false;
  return true;
}

export function isProcessingPrescriptionOrder(order: OrderRecord): boolean {
  const rx = toPrescriptionOrder(order);
  if (!rx) return false;
  if (rx.prescriptionStatus !== 'approved') return false;

  const raw = String(order.rawStatus || '').toLowerCase();
  return raw === 'confirmed' || raw === 'processing';
}

export function needsActionOrder(order: OrderRecord): boolean {
  const raw = String(order.rawStatus || '').toLowerCase();
  if (order.status === 'cancelled') return false;

  if (raw === 'returned') return true;

  if (order.status === 'pending') return true;

  if (order.paymentStatus === 'pending' && order.paymentMethod !== 'cod') return true;

  if (needsPrescriptionSupplement(order)) return true;

  const rx = toPrescriptionOrder(order);
  if (rx && rx.prescriptionStatus !== 'approved') return true;

  return false;
}

export function getOrderAlertTypes(
  order: OrderRecord,
  thresholds: typeof DEFAULT_ORDER_ALERT_THRESHOLDS = DEFAULT_ORDER_ALERT_THRESHOLDS
): DelayType[] {
  if (order.status === 'cancelled') return [];

  const alerts = new Set<DelayType>();
  const ageHours = getOrderAgeHours(order);
  const ageDays = ageHours / 24;

  if (order.status === 'pending' && ageHours > thresholds.confirmationDeadlineHours) {
    alerts.add('pending_too_long');
  }

  if (
    order.paymentStatus === 'pending' &&
    order.paymentMethod !== 'cod' &&
    ageHours > thresholds.paymentPendingHours
  ) {
    alerts.add('pending_too_long');
  }

  if (needsPrescriptionSupplement(order) && ageHours > thresholds.rxSupplementHours) {
    alerts.add('stuck_processing');
  }

  if (isPreorderOrder(order) && ageDays > thresholds.preorderEtaDays) {
    alerts.add('delivery_delay');
  }

  if (isProcessingPrescriptionOrder(order) && ageDays > thresholds.processingSlaDays) {
    alerts.add('lab_delay');
  }

  return Array.from(alerts);
}

function formatDelayDuration(ageHours: number): string {
  if (ageHours < 1) return '<1 giờ';
  if (ageHours < 24) return `${Math.round(ageHours)} giờ`;
  return `${Math.round(ageHours / 24)} ngày`;
}

function pickMostSevereType(types: DelayType[]): DelayType {
  const severityRank: Record<DelayType, number> = {
    sla_breach: 5,
    lab_delay: 4,
    stuck_processing: 3,
    delivery_delay: 2,
    pending_too_long: 1,
  };
  return types
    .slice()
    .sort((a, b) => (severityRank[b] ?? 0) - (severityRank[a] ?? 0))[0]!;
}

function estimateDeadline(
  order: OrderRecord,
  delayType: DelayType,
  thresholds: typeof DEFAULT_ORDER_ALERT_THRESHOLDS
): string {
  const createdTs = toTimestamp(order.createdAt) ?? Date.now();
  const base = new Date(createdTs);

  const hours =
    delayType === 'pending_too_long'
      ? thresholds.confirmationDeadlineHours
      : delayType === 'stuck_processing'
        ? thresholds.rxSupplementHours
        : delayType === 'lab_delay'
          ? thresholds.processingSlaDays * 24
          : delayType === 'delivery_delay'
            ? thresholds.preorderEtaDays * 24
            : thresholds.confirmationDeadlineHours;

  base.setHours(base.getHours() + hours);
  const dd = String(base.getDate()).padStart(2, '0');
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  const yyyy = String(base.getFullYear());
  const hh = String(base.getHours()).padStart(2, '0');
  const min = String(base.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function estimateSeverity(ageHours: number, thresholdHours: number): SeverityLevel {
  if (thresholdHours <= 0) return 'medium';
  const ratio = ageHours / thresholdHours;
  if (ratio >= 3) return 'critical';
  if (ratio >= 2) return 'high';
  if (ratio >= 1.25) return 'medium';
  return 'low';
}

function thresholdHoursForType(
  delayType: DelayType,
  thresholds: typeof DEFAULT_ORDER_ALERT_THRESHOLDS
): number {
  switch (delayType) {
    case 'pending_too_long':
      return Math.max(
        thresholds.confirmationDeadlineHours,
        thresholds.paymentPendingHours
      );
    case 'delivery_delay':
      return thresholds.preorderEtaDays * 24;
    case 'stuck_processing':
      return thresholds.rxSupplementHours;
    case 'lab_delay':
      return thresholds.processingSlaDays * 24;
    case 'sla_breach':
      return thresholds.processingSlaDays * 24;
    default:
      return thresholds.confirmationDeadlineHours;
  }
}

export function toDelayedOrdersFromApi(
  orders: OrderRecord[],
  thresholds: typeof DEFAULT_ORDER_ALERT_THRESHOLDS = DEFAULT_ORDER_ALERT_THRESHOLDS
): DelayedOrder[] {
  return orders
    .map((order) => {
      const types = getOrderAlertTypes(order, thresholds);
      if (types.length === 0) return null;

      const delayType = pickMostSevereType(types);
      const ageHours = getOrderAgeHours(order);
      const thresholdHours = thresholdHoursForType(delayType, thresholds);

      return {
        id: order.code,
        customerName: order.customerName,
        customerPhone: order.customerPhone || '-',
        orderDate: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString('vi-VN')
          : '-',
        delayType,
        severity: estimateSeverity(ageHours, thresholdHours),
        delayDuration: formatDelayDuration(ageHours),
        slaDeadline: estimateDeadline(order, delayType, thresholds),
        currentStatus: order.rawStatus || order.status,
        assignedTo: '-',
        lastAction: '-',
        notes:
          delayType === 'pending_too_long'
            ? 'Đơn chờ xác nhận/thanh toán quá lâu'
            : delayType === 'delivery_delay'
              ? 'Đơn pre-order quá ETA dự kiến'
              : delayType === 'stuck_processing'
                ? 'Prescription chờ bổ sung quá lâu'
                : delayType === 'lab_delay'
                  ? 'Đơn đang gia công quá SLA'
                  : 'Cảnh báo tiến độ',
      } satisfies DelayedOrder;
    })
    .filter((value): value is DelayedOrder => value !== null);
}

export function computeOrderMenuCounts(orders: OrderRecord[]): OrderMenuCounts {
  const counts: OrderMenuCounts = {
    needsAction: 0,
    readyStock: 0,
    preorder: 0,
    prescription: 0,
    prescriptionNeeded: 0,
    processing: 0,
    alerts: 0,
  };

  for (const order of orders) {
    if (needsActionOrder(order)) counts.needsAction += 1;
    if (isReadyStockOrder(order)) counts.readyStock += 1;
    if (isPreorderOrder(order)) counts.preorder += 1;
    if (isPrescriptionOrder(order)) counts.prescription += 1;
    if (needsPrescriptionSupplement(order)) counts.prescriptionNeeded += 1;
    if (isProcessingPrescriptionOrder(order)) counts.processing += 1;
    if (getOrderAlertTypes(order).length > 0) counts.alerts += 1;
  }

  return counts;
}
