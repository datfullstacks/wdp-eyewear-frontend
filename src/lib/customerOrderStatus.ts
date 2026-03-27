import type { OrderRecord } from '@/api/orders';

type BadgeType = 'info' | 'warning' | 'success' | 'error' | 'default';

export type CustomerOrderStatusMeta = {
  category: OrderRecord['status'];
  label: string;
  type: BadgeType;
};

export type CustomerShippingStatusMeta = {
  label: string;
  type: BadgeType;
  rawStatus: string;
};

function normalize(value?: string): string {
  return String(value || '')
    .trim()
    .toLowerCase();
}

export function getCustomerOrderStatusMeta(
  order: Pick<OrderRecord, 'status' | 'rawStatus' | 'opsStage' | 'shipment'>
): CustomerOrderStatusMeta {
  const rawStatus = normalize(order.rawStatus);
  const opsStage = normalize(order.opsStage);
  const shipmentStatus = normalize(order.shipment?.latestStatus);

  if (rawStatus === 'cancelled') {
    return { category: 'cancelled', label: 'Da huy don', type: 'error' };
  }

  if (rawStatus === 'returned') {
    return { category: 'cancelled', label: 'Da hoan hang', type: 'error' };
  }

  if (
    rawStatus === 'delivered' ||
    opsStage === 'delivered' ||
    opsStage === 'closed'
  ) {
    return {
      category: 'completed',
      label: 'Đã giao thành công',
      type: 'success',
    };
  }

  if (opsStage === 'return_in_transit') {
    return { category: 'processing', label: 'Đang hoàn hàng', type: 'warning' };
  }

  if (opsStage === 'return_pending') {
    return {
      category: 'processing',
      label: 'Đang chờ hoàn hàng',
      type: 'warning',
    };
  }

  if (opsStage === 'waiting_redelivery') {
    return {
      category: 'processing',
      label: 'Chờ giao lại / hoàn hàng',
      type: 'warning',
    };
  }

  if (opsStage === 'delivery_failed' || shipmentStatus === 'delivery_fail') {
    return { category: 'processing', label: 'Giao thất bại', type: 'error' };
  }

  if (opsStage === 'picking') {
    return {
      category: 'processing',
      label: 'Ops đang lấy hàng',
      type: 'warning',
    };
  }

  if (opsStage === 'waiting_lab') {
    return {
      category: 'processing',
      label: 'Chờ vào gia công tròng',
      type: 'info',
    };
  }

  if (opsStage === 'lens_processing') {
    return {
      category: 'processing',
      label: 'Đang cắt mài tròng',
      type: 'warning',
    };
  }

  if (opsStage === 'lens_fitting') {
    return {
      category: 'processing',
      label: 'Đang lắp tròng vào gọng',
      type: 'warning',
    };
  }

  if (opsStage === 'qc_check') {
    return {
      category: 'processing',
      label: 'Đang QC sau gia công',
      type: 'info',
    };
  }

  if (opsStage === 'ready_to_pack') {
    return {
      category: 'processing',
      label: 'Đã gia công xong, chờ đóng gói',
      type: 'success',
    };
  }

  if (opsStage === 'packing') {
    return {
      category: 'processing',
      label: 'Ops đang đóng gói',
      type: 'warning',
    };
  }

  if (opsStage === 'ready_to_ship') {
    return {
      category: 'processing',
      label: 'Sẵn sàng tạo vận đơn',
      type: 'info',
    };
  }

  if (
    opsStage === 'in_transit' ||
    [
      'transporting',
      'sorting',
      'delivering',
      'money_collect_delivering',
    ].includes(shipmentStatus)
  ) {
    return { category: 'processing', label: 'Đang vận chuyển', type: 'info' };
  }

  if (
    opsStage === 'handover_to_carrier' ||
    ['picking', 'money_collect_picking', 'picked', 'storing'].includes(
      shipmentStatus
    )
  ) {
    return {
      category: 'processing',
      label: 'GHN đang nhận hàng',
      type: 'info',
    };
  }

  if (opsStage === 'shipment_created' || shipmentStatus === 'ready_to_pick') {
    return { category: 'processing', label: 'Đã tạo vận đơn', type: 'info' };
  }

  if (opsStage === 'packing' || rawStatus === 'processing') {
    return { category: 'processing', label: 'Đang xử lý đơn', type: 'warning' };
  }

  if (rawStatus === 'confirmed') {
    return { category: 'processing', label: 'Đã xác nhận đơn', type: 'info' };
  }

  if (
    opsStage === 'waiting_customer_info' ||
    opsStage === 'on_hold' ||
    opsStage === 'exception_hold'
  ) {
    return {
      category: 'processing',
      label: 'Đơn đang cần xử lý bổ sung',
      type: 'warning',
    };
  }

  return { category: 'pending', label: 'Chờ xác nhận', type: 'info' };
}

export function getCustomerShippingStatusMeta(
  order: Pick<OrderRecord, 'shipment' | 'opsStage' | 'rawStatus'>
): CustomerShippingStatusMeta | null {
  const shipmentStatus = normalize(order.shipment?.latestStatus);
  const shipmentCode = normalize(
    order.shipment?.orderCode || order.shipment?.trackingCode
  );
  const opsStage = normalize(order.opsStage);
  const rawStatus = normalize(order.rawStatus);

  if (
    !shipmentStatus &&
    !shipmentCode &&
    rawStatus !== 'shipped' &&
    rawStatus !== 'delivered'
  ) {
    return null;
  }

  if (shipmentStatus === 'delivered') {
    return {
      label: 'Đã giao hàng',
      type: 'success',
      rawStatus: shipmentStatus,
    };
  }

  if (shipmentStatus === 'returned') {
    return { label: 'Đã hoàn hàng', type: 'error', rawStatus: shipmentStatus };
  }

  if (
    ['return', 'return_transporting', 'return_sorting', 'returning'].includes(
      shipmentStatus
    ) ||
    opsStage === 'return_pending' ||
    opsStage === 'return_in_transit'
  ) {
    return {
      label: 'Đang hoàn hàng',
      type: 'warning',
      rawStatus: shipmentStatus,
    };
  }

  if (
    shipmentStatus === 'waiting_to_return' ||
    opsStage === 'waiting_redelivery'
  ) {
    return {
      label: 'Chờ giao lại / hoàn hàng',
      type: 'warning',
      rawStatus: shipmentStatus,
    };
  }

  if (shipmentStatus === 'delivery_fail' || opsStage === 'delivery_failed') {
    return { label: 'Giao thất bại', type: 'error', rawStatus: shipmentStatus };
  }

  if (
    [
      'transporting',
      'sorting',
      'delivering',
      'money_collect_delivering',
    ].includes(shipmentStatus) ||
    opsStage === 'in_transit'
  ) {
    return {
      label: 'Đang vận chuyển',
      type: 'info',
      rawStatus: shipmentStatus,
    };
  }

  if (
    ['picking', 'money_collect_picking', 'picked', 'storing'].includes(
      shipmentStatus
    ) ||
    opsStage === 'handover_to_carrier'
  ) {
    return {
      label: 'GHN đang nhận hàng',
      type: 'info',
      rawStatus: shipmentStatus,
    };
  }

  if (
    shipmentStatus === 'ready_to_pick' ||
    opsStage === 'shipment_created' ||
    shipmentCode
  ) {
    return { label: 'Đã tạo vận đơn', type: 'info', rawStatus: shipmentStatus };
  }

  if (opsStage === 'ready_to_ship') {
    return {
      label: 'Sẵn sàng tạo vận đơn',
      type: 'info',
      rawStatus: shipmentStatus,
    };
  }

  if (
    [
      'return_fail',
      'exception',
      'damage',
      'lost',
      'cancel',
      'cancelled',
    ].includes(shipmentStatus) ||
    opsStage === 'exception_hold'
  ) {
    return {
      label: 'Vận đơn cần xử lý thủ công',
      type: 'error',
      rawStatus: shipmentStatus,
    };
  }

  return {
    label: 'Đang xử lý vận chuyển',
    type: 'default',
    rawStatus: shipmentStatus,
  };
}
