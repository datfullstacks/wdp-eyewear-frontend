export interface PreorderProduct {
  sku: string;
  name: string;
  variant: string;
  supplier: string;
  warehouseLocation: string;
  quantity: number;
  batchCode: string | null;
  batchExpectedDate: string | null;
  status: 'waiting' | 'in_transit' | 'arrived' | 'partial';
}

export type PreorderOpsStatus =
  | 'waiting_arrival'
  | 'arrived'
  | 'stocked'
  | 'ready_to_pack'
  | 'packing'
  | 'shipment_created';

export interface PreorderOrder {
  id: string;
  rawOrderStatus?: string;
  orderCode: string;
  storeId: string;
  storeName: string;
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
  opsStatus: PreorderOpsStatus;
  carrierId: string;
  trackingCode: string;
  shipmentState?: string;
  shipmentStatus?: string;
  shipmentServiceName?: string;
}

export interface PreorderStats {
  total: number;
  waitingStock: number;
  partialStock: number;
  ready: number;
  urgent: number;
}
