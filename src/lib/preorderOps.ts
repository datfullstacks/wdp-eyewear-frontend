import type { PreorderOpsStatus } from '@/types/preorder';

export type PreorderOpsTone =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default';

type PreorderOpsMeta = {
  label: string;
  tone: PreorderOpsTone;
};

export const PREORDER_OPS_STATUS_META: Record<
  PreorderOpsStatus,
  PreorderOpsMeta
> = {
  waiting_arrival: { label: 'Cho hang ve', tone: 'warning' },
  arrived: { label: 'Hang da ve', tone: 'success' },
  stocked: { label: 'Da nhap kho', tone: 'info' },
  ready_to_pack: { label: 'San sang dong goi', tone: 'info' },
  packing: { label: 'Dang dong goi', tone: 'warning' },
  ready_to_ship: { label: 'Cho tao van don', tone: 'info' },
  shipment_created: { label: 'Da tao van don', tone: 'info' },
  handover_to_carrier: { label: 'Da ban giao VC', tone: 'info' },
  in_transit: { label: 'Dang van chuyen', tone: 'info' },
  delivery_failed: { label: 'Giao that bai', tone: 'error' },
  waiting_redelivery: { label: 'Cho giao lai', tone: 'warning' },
  return_pending: { label: 'Cho hoan hang', tone: 'warning' },
  return_in_transit: { label: 'Dang hoan hang', tone: 'warning' },
  exception_hold: { label: 'Ngoai le giao van', tone: 'error' },
  delivered: { label: 'Da giao', tone: 'success' },
  returned: { label: 'Da hoan hang', tone: 'error' },
};

const SHIPMENT_MANAGED_STATUSES = new Set<PreorderOpsStatus>([
  'shipment_created',
  'handover_to_carrier',
  'in_transit',
  'delivery_failed',
  'waiting_redelivery',
  'return_pending',
  'return_in_transit',
  'exception_hold',
  'delivered',
  'returned',
]);

export const preorderOpsFilterOptions = [
  { value: 'all', label: 'Tat ca van hanh' },
  { value: 'waiting_arrival', label: PREORDER_OPS_STATUS_META.waiting_arrival.label },
  { value: 'arrived', label: PREORDER_OPS_STATUS_META.arrived.label },
  { value: 'stocked', label: PREORDER_OPS_STATUS_META.stocked.label },
  { value: 'ready_to_pack', label: PREORDER_OPS_STATUS_META.ready_to_pack.label },
  { value: 'packing', label: PREORDER_OPS_STATUS_META.packing.label },
  { value: 'ready_to_ship', label: PREORDER_OPS_STATUS_META.ready_to_ship.label },
  { value: 'shipment_created', label: PREORDER_OPS_STATUS_META.shipment_created.label },
  { value: 'handover_to_carrier', label: PREORDER_OPS_STATUS_META.handover_to_carrier.label },
  { value: 'in_transit', label: PREORDER_OPS_STATUS_META.in_transit.label },
  { value: 'delivery_failed', label: PREORDER_OPS_STATUS_META.delivery_failed.label },
  { value: 'waiting_redelivery', label: PREORDER_OPS_STATUS_META.waiting_redelivery.label },
  { value: 'return_pending', label: PREORDER_OPS_STATUS_META.return_pending.label },
  { value: 'return_in_transit', label: PREORDER_OPS_STATUS_META.return_in_transit.label },
  { value: 'exception_hold', label: PREORDER_OPS_STATUS_META.exception_hold.label },
  { value: 'delivered', label: PREORDER_OPS_STATUS_META.delivered.label },
  { value: 'returned', label: PREORDER_OPS_STATUS_META.returned.label },
] as const;

export function getPreorderOpsStatusMeta(
  status: PreorderOpsStatus
): PreorderOpsMeta {
  return PREORDER_OPS_STATUS_META[status];
}

export function isPreorderShipmentManagedStatus(
  status: PreorderOpsStatus
): boolean {
  return SHIPMENT_MANAGED_STATUSES.has(status);
}
