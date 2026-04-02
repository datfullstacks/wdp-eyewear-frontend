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
  waiting_arrival: { label: 'Chờ hàng về', tone: 'warning' },
  arrived: { label: 'àng đã về', tone: 'success' },
  stocked: { label: 'Đã nhập kho', tone: 'info' },
  ready_to_pack: { label: 'ẵn sàng đóng gói', tone: 'info' },
  packing: { label: 'Đang đóng gói', tone: 'warning' },
  ready_to_ship: { label: 'Chờ tạo vận đơn', tone: 'info' },
  shipment_created: { label: 'Đã tạo vận đơn', tone: 'info' },
  handover_to_carrier: { label: 'Đã bàn giao VC', tone: 'info' },
  in_transit: { label: 'Đang vận chuyển', tone: 'info' },
  delivery_failed: { label: 'Giao thất bại', tone: 'error' },
  waiting_redelivery: { label: 'Chờ giao lại', tone: 'warning' },
  return_pending: { label: 'Chờ hoàn hàng', tone: 'warning' },
  return_in_transit: { label: 'Đang hoàn hàng', tone: 'warning' },
  exception_hold: { label: 'Ngoài lệ giao vận', tone: 'error' },
  delivered: { label: 'Đã giao', tone: 'success' },
  returned: { label: 'Đã hoàn hàng', tone: 'error' },
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
  {
    value: 'waiting_arrival',
    label: PREORDER_OPS_STATUS_META.waiting_arrival.label,
  },
  { value: 'arrived', label: PREORDER_OPS_STATUS_META.arrived.label },
  { value: 'stocked', label: PREORDER_OPS_STATUS_META.stocked.label },
  {
    value: 'ready_to_pack',
    label: PREORDER_OPS_STATUS_META.ready_to_pack.label,
  },
  { value: 'packing', label: PREORDER_OPS_STATUS_META.packing.label },
  {
    value: 'ready_to_ship',
    label: PREORDER_OPS_STATUS_META.ready_to_ship.label,
  },
  {
    value: 'shipment_created',
    label: PREORDER_OPS_STATUS_META.shipment_created.label,
  },
  {
    value: 'handover_to_carrier',
    label: PREORDER_OPS_STATUS_META.handover_to_carrier.label,
  },
  { value: 'in_transit', label: PREORDER_OPS_STATUS_META.in_transit.label },
  {
    value: 'delivery_failed',
    label: PREORDER_OPS_STATUS_META.delivery_failed.label,
  },
  {
    value: 'waiting_redelivery',
    label: PREORDER_OPS_STATUS_META.waiting_redelivery.label,
  },
  {
    value: 'return_pending',
    label: PREORDER_OPS_STATUS_META.return_pending.label,
  },
  {
    value: 'return_in_transit',
    label: PREORDER_OPS_STATUS_META.return_in_transit.label,
  },
  {
    value: 'exception_hold',
    label: PREORDER_OPS_STATUS_META.exception_hold.label,
  },
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
