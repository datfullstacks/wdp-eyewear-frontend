export interface Shipment {
  id: string;
  trackingCode: string;
  orderId: string;
  carrier: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: ShippingStatus;
  codAmount: number;
  shippingFee: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
  expectedDelivery: string;
  actualDelivery?: string;
  history: ShipmentHistoryEvent[];
}

export interface ShipmentHistoryEvent {
  time: string;
  status: string;
  location: string;
  note?: string;
}

export type ShippingStatus =
  | 'picking'
  | 'in_transit'
  | 'delivering'
  | 'delivered'
  | 'returned'
  | 'failed';

export interface CODReconciliation {
  id: string;
  carrier: string;
  period: string;
  totalOrders: number;
  totalCOD: number;
  shippingFee: number;
  netAmount: number;
  status: CODStatus;
  createdAt: string;
  paidAt?: string;
}

export type CODStatus = 'pending' | 'confirmed' | 'paid' | 'disputed';
