export type FulfillmentShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'returned';

export interface FulfillmentShipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  customerName: string;
  customerPhone: string;
  address: string;
  district: string;
  city: string;
  products: string[];
  weight: number;
  codAmount: number;
  shippingFee: number;
  status: FulfillmentShipmentStatus;
  createdAt: string;
  estimatedDelivery: string;
  notes: string;
}

export interface OrderToShip {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  district: string;
  city: string;
  products: string[];
  total: number;
  paymentMethod: 'cod' | 'paid';
  notes: string;
}

export interface CarrierOption {
  id: string;
  name: string;
}

export const fulfillmentStatusConfig: Record<
  FulfillmentShipmentStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className: string;
  }
> = {
  pending: { label: 'Chờ lấy hàng', variant: 'secondary', className: '' },
  picked_up: { label: 'Đã lấy hàng', variant: 'outline', className: '' },
  in_transit: {
    label: 'Đang vận chuyển',
    variant: 'default',
    className: 'bg-primary hover:bg-primary/90',
  },
  delivered: {
    label: 'Đã giao',
    variant: 'default',
    className: 'bg-success hover:bg-success/90',
  },
  failed: { label: 'Giao thất bại', variant: 'destructive', className: '' },
  returned: { label: 'Hoàn hàng', variant: 'destructive', className: '' },
};

export const carriers: CarrierOption[] = [
  { id: 'ghn', name: 'GHN - Giao Hàng Nhanh' },
  { id: 'ghtk', name: 'GHTK - Giao Hàng Tiết Kiệm' },
  { id: 'viettelpost', name: 'Viettel Post' },
  { id: 'jt', name: 'J&T Express' },
  { id: 'ninja', name: 'Ninja Van' },
  { id: 'best', name: 'BEST Express' },
];
