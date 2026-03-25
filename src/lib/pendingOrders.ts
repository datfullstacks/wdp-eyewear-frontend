import type { PaymentStatus, PendingOrder } from '@/types/pending';

export const PENDING_ORDER_APPROVAL_MESSAGE =
  'Chỉ đơn đã thanh toán đầy đủ mới được duyệt.';
export const PENDING_ORDER_MANAGER_MESSAGE =
  'Case này cần manager xác nhận.';
export const PENDING_ORDER_MANAGER_APPROVAL_MESSAGE =
  'Manager chỉ được duyệt đơn đã thanh toán đầy đủ hoặc COD.';
export const PENDING_ORDER_SENT_BACK_MESSAGE =
  'Manager đã trả lại sale để xử lý tiếp.';

const PENDING_ORDER_TYPE_LABELS: Record<string, string> = {
  ready_stock: 'Hàng có sẵn',
  pre_order: 'Đặt trước',
  preorder: 'Đặt trước',
  prescription: 'Làm theo đơn',
  made_to_order: 'Làm theo đơn',
  'made-to-order': 'Làm theo đơn',
  custom: 'Làm theo đơn',
};

export function getPendingOrderTypeLabel(
  order: Pick<PendingOrder, 'orderType' | 'hasPrescription'>
): string {
  const normalized = String(order.orderType || '')
    .trim()
    .toLowerCase();

  if (normalized && PENDING_ORDER_TYPE_LABELS[normalized]) {
    return PENDING_ORDER_TYPE_LABELS[normalized];
  }

  if (order.hasPrescription) {
    return 'Làm theo đơn';
  }

  return order.orderType || '-';
}

export function canApprovePendingPaymentStatus(
  paymentStatus: PaymentStatus
): boolean {
  return paymentStatus === 'paid';
}

export function canApprovePendingOrder(
  order: Pick<PendingOrder, 'paymentStatus'>
): boolean {
  return canApprovePendingPaymentStatus(order.paymentStatus);
}

export function needsManagerReview(
  order: Pick<PendingOrder, 'approvalState'>
): boolean {
  return order.approvalState === 'manager_review_requested';
}

export function wasSentBackToSale(
  order: Pick<PendingOrder, 'approvalState'>
): boolean {
  return order.approvalState === 'sent_back_to_sale';
}

export function canSaleHandlePendingOrder(
  order: Pick<PendingOrder, 'paymentStatus' | 'approvalState'>
): boolean {
  return canApprovePendingOrder(order) && !needsManagerReview(order);
}

export function canManagerHandlePendingOrder(
  order: Pick<PendingOrder, 'approvalState'>
): boolean {
  return needsManagerReview(order);
}

export function canManagerApprovePendingPaymentStatus(
  paymentStatus: PaymentStatus
): boolean {
  return paymentStatus === 'paid' || paymentStatus === 'cod';
}

export function canManagerApprovePendingOrder(
  order: Pick<PendingOrder, 'paymentStatus' | 'approvalState'>
): boolean {
  return (
    needsManagerReview(order) &&
    canManagerApprovePendingPaymentStatus(order.paymentStatus)
  );
}
