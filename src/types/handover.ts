export type HandoverStatus = 'pending' | 'ready' | 'handed_over' | 'confirmed';
export type HandoverCarrierType =
  | 'GHN'
  | 'GHTK'
  | 'Viettel Post'
  | 'J&T'
  | 'Ninja Van';

export interface ShipmentForHandover {
  id: string;
  trackingNumber: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  carrier: HandoverCarrierType;
  weight: number;
  status: HandoverStatus;
  createdAt: string;
  packageCount: number;
}

export interface HandoverBatch {
  id: string;
  carrier: HandoverCarrierType;
  shipmentCount: number;
  totalPackages: number;
  totalWeight: number;
  createdAt: string;
  handoverTime: string | null;
  status: HandoverStatus;
  staffName: string;
  carrierStaffName: string | null;
  notes: string;
}

export const handoverCarrierColors: Record<HandoverCarrierType, string> = {
  GHN: 'bg-warning/10 text-warning border-warning/20',
  GHTK: 'bg-success/10 text-success border-success/20',
  'Viettel Post': 'bg-destructive/10 text-destructive border-destructive/20',
  'J&T': 'bg-destructive/10 text-destructive border-destructive/20',
  'Ninja Van': 'bg-destructive/10 text-destructive border-destructive/20',
};
