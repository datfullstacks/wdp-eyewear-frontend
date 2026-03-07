export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'cod';

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
  createdAt: string;
  note: string;
  hasPrescription: boolean;
  paymentStatus: PaymentStatus;
}

export interface PaymentStatusConfig {
  label: string;
  color: 'success' | 'warning' | 'info' | 'default';
}
