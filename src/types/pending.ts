import type { PrescriptionData } from '@/types/rxPrescription';

export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'cod';

export type PendingPrescriptionSource =
  | 'customer_upload'
  | 'customer_input'
  | 'pending';

export interface PendingPrescriptionSummary {
  source: PendingPrescriptionSource;
  attachmentUrl?: string;
  prescription?: PrescriptionData;
}

export interface PendingOrderProduct {
  name: string;
  variant: string;
  qty: number;
  price: number;
}

export interface PendingOrder {
  id: string;
  orderDbId?: string;
  customer: string;
  phone: string;
  address: string;
  products: PendingOrderProduct[];
  total: number;
  status: string;
  orderType?: string;
  createdAt: string;
  note: string;
  hasPrescription: boolean;
  prescriptionSummary?: PendingPrescriptionSummary;
  paymentStatus: PaymentStatus;
  approvalState: 'none' | 'manager_review_requested' | 'sent_back_to_sale';
  managerReviewRequestedAt?: string;
  managerReviewRequestedBy?: string;
  managerReviewReason?: string;
}

export interface PaymentStatusConfig {
  label: string;
  color: 'success' | 'warning' | 'info' | 'default';
}
