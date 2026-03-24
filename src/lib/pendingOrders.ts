import type { PaymentStatus, PendingOrder } from '@/types/pending';

export const PENDING_ORDER_APPROVAL_MESSAGE =
  'Chi don da thanh toan day du moi duoc duyet.';
export const PENDING_ORDER_MANAGER_MESSAGE =
  'Case nay can manager xac nhan.';
export const PENDING_ORDER_MANAGER_APPROVAL_MESSAGE =
  'Manager chi duoc duyet don da thanh toan day du hoac COD.';
export const PENDING_ORDER_SENT_BACK_MESSAGE =
  'Manager da tra lai sale de xu ly tiep.';

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
