import { CreditCard, Banknote, DollarSign } from 'lucide-react';

export type RefundStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected';
export type RefundMethod = 'bank_transfer' | 'card' | 'cash' | 'wallet';

export interface RefundRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  reason: string;
  method: RefundMethod;
  status: RefundStatus;
  createdAt: string;
  processedAt?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  notes?: string;
}

export const statusConfig: Record<
  RefundStatus,
  { label: string; type: 'success' | 'warning' | 'error' | 'info' | 'default' }
> = {
  pending: { label: 'Chờ xử lý', type: 'warning' },
  reviewing: { label: 'Đang xem xét', type: 'info' },
  approved: { label: 'Đã duyệt', type: 'success' },
  processing: { label: 'Đang hoàn tiền', type: 'info' },
  completed: { label: 'Hoàn thành', type: 'success' },
  rejected: { label: 'Từ chối', type: 'error' },
};

export const methodConfig: Record<
  RefundMethod,
  { label: string; icon: typeof CreditCard }
> = {
  bank_transfer: { label: 'Chuyển khoản', icon: Banknote },
  card: { label: 'Thẻ tín dụng', icon: CreditCard },
  cash: { label: 'Tiền mặt', icon: DollarSign },
  wallet: { label: 'Ví điện tử', icon: CreditCard },
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
