export interface PreorderProduct {
  sku: string;
  name: string;
  variant: string;
  quantity: number;
  batchCode: string | null;
  batchExpectedDate: string | null;
  status: 'waiting' | 'in_transit' | 'arrived' | 'partial';
}

export interface PreorderOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderDate: string;
  expectedDate: string;
  products: PreorderProduct[];
  totalAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'cod';
  depositAmount: number;
  status: 'waiting_stock' | 'partial_stock' | 'ready' | 'cancelled';
  notes: string;
  priority: 'normal' | 'high' | 'urgent';
}

export interface PreorderStats {
  total: number;
  waitingStock: number;
  partialStock: number;
  ready: number;
  urgent: number;
}
