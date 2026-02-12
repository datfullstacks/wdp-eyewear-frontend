export type PendingPriority = 'urgent' | 'high' | 'normal' | 'low';
export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'cod';

export interface PendingOrderProduct {
  name: string;
  variant: string;
  qty: number;
  price: number;
}

export interface PendingOrder {
  id: string;
  customer: string;
  phone: string;
  address: string;
  products: PendingOrderProduct[];
  total: number;
  status: string;
  priority: PendingPriority;
  createdAt: string;
  note: string;
  hasPrescription: boolean;
  paymentStatus: PaymentStatus;
}

export interface PriorityConfig {
  label: string;
  color: 'error' | 'warning' | 'info' | 'default';
  icon: React.ComponentType<{ className?: string }>;
}

export interface PaymentStatusConfig {
  label: string;
  color: 'success' | 'warning' | 'info' | 'default';
}
