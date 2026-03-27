import { Banknote, CreditCard, DollarSign } from 'lucide-react';

import type {
  OrderRecord,
  RefundBankAccount,
  RefundBreakdown,
  RefundHistoryEntry,
  RefundInspectionStatus,
  RefundResponsibility,
  RefundStatus,
} from '@/api/orders';

export type RefundMethod = 'bank_transfer' | 'card' | 'cash' | 'wallet';

export interface RefundRequest {
  orderInternalId: string;
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  reason: string;
  method: RefundMethod;
  paymentMethod: string;
  status: Exclude<RefundStatus, 'none'>;
  createdAt: string;
  createdAtRaw?: string;
  processedAt?: string;
  processedAtRaw?: string;
  bankInfo?: RefundBankAccount;
  notes?: string;
  responsibility?: RefundResponsibility;
  requiresReturn: boolean;
  requestedBreakdown: RefundBreakdown;
  approvedBreakdown: RefundBreakdown;
  rejectReason: string;
  decisionNote: string;
  escalateReason: string;
  currentOwnerRole: string;
  currentOwnerUserId?: string;
  nextActionCode: string;
  inspectionStatus: RefundInspectionStatus;
  inspectionNote: string;
  inspectionAt?: string;
  returnShipmentCode: string;
  returnCarrier: string;
  returnReceivedAt?: string;
  transactionRef: string;
  payoutProofUrl: string;
  evidence: string[];
  history: RefundHistoryEntry[];
}

type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'default';

export const statusConfig: Record<
  RefundRequest['status'],
  { label: string; type: StatusTone }
> = {
  requested: { label: 'Mới tạo', type: 'warning' },
  reviewing: { label: 'Đang xem xét', type: 'info' },
  waiting_customer_info: { label: 'Chờ KH bổ sung', type: 'warning' },
  escalated_to_manager: { label: 'Cần quản lý', type: 'error' },
  approved: { label: 'Đã duyệt', type: 'success' },
  return_pending: { label: 'Chờ trả hàng', type: 'warning' },
  return_received: { label: 'Đã nhận hàng', type: 'info' },
  processing: { label: 'Đang hoàn tiền', type: 'info' },
  completed: { label: 'Hoàn tất', type: 'success' },
  rejected: { label: 'Từ chối', type: 'error' },
};

export const methodConfig: Record<
  RefundMethod,
  { label: string; icon: typeof CreditCard }
> = {
  bank_transfer: { label: 'Chuyển khoản', icon: Banknote },
  card: { label: 'Thẻ', icon: CreditCard },
  cash: { label: 'Tiền mặt', icon: DollarSign },
  wallet: { label: 'Ví điện tử', icon: CreditCard },
};

export const saleStatusFilterOptions: Array<{
  value: 'all' | RefundRequest['status'];
  label: string;
}> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'requested', label: statusConfig.requested.label },
  { value: 'reviewing', label: statusConfig.reviewing.label },
  {
    value: 'waiting_customer_info',
    label: statusConfig.waiting_customer_info.label,
  },
  {
    value: 'escalated_to_manager',
    label: statusConfig.escalated_to_manager.label,
  },
  { value: 'approved', label: statusConfig.approved.label },
  { value: 'return_pending', label: statusConfig.return_pending.label },
  { value: 'return_received', label: statusConfig.return_received.label },
  { value: 'processing', label: statusConfig.processing.label },
  { value: 'completed', label: statusConfig.completed.label },
  { value: 'rejected', label: statusConfig.rejected.label },
];

export const operationStatusFilterOptions: Array<{
  value: 'all' | RefundRequest['status'];
  label: string;
}> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'approved', label: statusConfig.approved.label },
  { value: 'return_pending', label: statusConfig.return_pending.label },
  { value: 'return_received', label: statusConfig.return_received.label },
  { value: 'processing', label: statusConfig.processing.label },
  { value: 'completed', label: statusConfig.completed.label },
];

export const refundMethodFilterOptions: Array<{
  value: 'all' | RefundMethod;
  label: string;
}> = [
  { value: 'all', label: 'Tất cả PT' },
  { value: 'bank_transfer', label: methodConfig.bank_transfer.label },
  { value: 'card', label: methodConfig.card.label },
  { value: 'cash', label: methodConfig.cash.label },
  { value: 'wallet', label: methodConfig.wallet.label },
];

function buildRefundReference(value: string) {
  const normalized = String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();

  if (!normalized) {
    return 'RF-UNKNOWN';
  }

  return `RF-${normalized.slice(-8)}`;
}

function resolveRefundMethod(
  paymentMethod: string,
  bankInfo?: RefundBankAccount
): RefundMethod {
  if (bankInfo?.accountNumber || bankInfo?.bankName) {
    return 'bank_transfer';
  }

  switch (
    String(paymentMethod || '')
      .trim()
      .toLowerCase()
  ) {
    case 'credit_card':
      return 'card';
    case 'cash':
    case 'cod':
      return 'cash';
    case 'e_wallet':
      return 'wallet';
    default:
      return 'bank_transfer';
  }
}

function hasBankInfo(bankInfo?: RefundBankAccount) {
  return Boolean(
    bankInfo?.bankName ||
    bankInfo?.accountNumber ||
    bankInfo?.accountHolder ||
    bankInfo?.note
  );
}

function toTimeValue(value?: string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

export const formatDateTime = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

export function toRefundRequest(order: OrderRecord): RefundRequest | null {
  const refund = order.refund;
  if (!refund || refund.status === 'none') {
    return null;
  }

  const bankInfo = hasBankInfo(refund.bankAccount)
    ? refund.bankAccount
    : undefined;
  const requestedBreakdown = refund.requestedBreakdown;
  const approvedBreakdown = refund.approvedBreakdown;
  const amount =
    approvedBreakdown.total ||
    requestedBreakdown.total ||
    refund.amount ||
    order.paidAmount ||
    order.total;

  return {
    orderInternalId: order.id,
    id: buildRefundReference(order.code || order.id),
    orderId: order.code || order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    amount,
    reason: refund.reason || 'Khách yêu cầu hoàn tiền',
    method: resolveRefundMethod(order.paymentMethod, bankInfo),
    paymentMethod: order.paymentMethod,
    status: refund.status,
    createdAt: formatDateTime(refund.requestedAt || order.createdAt),
    createdAtRaw: refund.requestedAt || order.createdAt,
    processedAt: formatDateTime(refund.processedAt),
    processedAtRaw: refund.processedAt,
    bankInfo,
    notes:
      refund.decisionNote ||
      refund.contactNote ||
      refund.rejectReason ||
      order.note,
    responsibility: refund.responsibility,
    requiresReturn: refund.requiresReturn,
    requestedBreakdown,
    approvedBreakdown,
    rejectReason: refund.rejectReason,
    decisionNote: refund.decisionNote,
    escalateReason: refund.escalateReason,
    currentOwnerRole: refund.currentOwnerRole,
    currentOwnerUserId: refund.currentOwnerUserId,
    nextActionCode: refund.nextActionCode,
    inspectionStatus: refund.inspectionStatus,
    inspectionNote: refund.inspectionNote,
    inspectionAt: refund.inspectionAt,
    returnShipmentCode: refund.returnShipmentCode,
    returnCarrier: refund.returnCarrier,
    returnReceivedAt: refund.returnReceivedAt,
    transactionRef: refund.transactionRef,
    payoutProofUrl: refund.payoutProofUrl,
    evidence: refund.evidence || [],
    history: refund.history || [],
  };
}

export const sortRefundsByCreatedAt = (refunds: RefundRequest[]) =>
  [...refunds].sort(
    (left, right) =>
      toTimeValue(right.createdAtRaw) - toTimeValue(left.createdAtRaw)
  );

export const getRefundStats = (refunds: RefundRequest[]) => {
  const openStatuses = new Set<RefundRequest['status']>([
    'requested',
    'reviewing',
    'waiting_customer_info',
    'escalated_to_manager',
  ]);
  const approvedStatuses = new Set<RefundRequest['status']>([
    'approved',
    'return_pending',
    'return_received',
    'processing',
  ]);

  return {
    open: refunds.filter((refund) => openStatuses.has(refund.status)).length,
    waitingCustomer: refunds.filter(
      (refund) => refund.status === 'waiting_customer_info'
    ).length,
    escalated: refunds.filter(
      (refund) => refund.status === 'escalated_to_manager'
    ).length,
    approved: refunds.filter((refund) => approvedStatuses.has(refund.status))
      .length,
    returnPending: refunds.filter((refund) => refund.status === 'return_pending')
      .length,
    processing: refunds.filter((refund) => refund.status === 'processing')
      .length,
    completed: refunds.filter((refund) => refund.status === 'completed').length,
    totalAmount: refunds
      .filter(
        (refund) =>
          refund.status !== 'completed' && refund.status !== 'rejected'
      )
      .reduce((sum, refund) => sum + refund.amount, 0),
  };
};
