import type { PaymentStatus, PendingOrder } from '@/types/pending';

export const PENDING_ORDER_APPROVAL_MESSAGE =
  'Chi don da thu phan thanh toan truoc hoac chon COD moi duoc duyet.';

export function canApprovePendingPaymentStatus(
  paymentStatus: PaymentStatus
): boolean {
  return (
    paymentStatus === 'paid' ||
    paymentStatus === 'partial' ||
    paymentStatus === 'cod'
  );
}

export function canApprovePendingOrder(
  order: Pick<PendingOrder, 'paymentStatus'>
): boolean {
  return canApprovePendingPaymentStatus(order.paymentStatus);
}
