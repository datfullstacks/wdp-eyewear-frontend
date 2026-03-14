import type { PaymentStatus, PendingOrder } from '@/types/pending';

export const PENDING_ORDER_APPROVAL_MESSAGE =
  'Chỉ đơn đã thanh toán đầy đủ mới được duyệt.';

export function canApprovePendingPaymentStatus(paymentStatus: PaymentStatus): boolean {
  return paymentStatus === 'paid';
}

export function canApprovePendingOrder(
  order: Pick<PendingOrder, 'paymentStatus'>
): boolean {
  return canApprovePendingPaymentStatus(order.paymentStatus);
}
