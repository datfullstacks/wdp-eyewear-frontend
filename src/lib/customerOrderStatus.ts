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
      label: 'Da giao thanh cong',
      type: 'success',
    };
  }

  if (opsStage === 'return_in_transit') {
    return { category: 'processing', label: 'Dang hoan hang', type: 'warning' };
  }

  if (opsStage === 'return_pending') {
    return {
      category: 'processing',
      label: 'Dang cho hoan hang',
      type: 'warning',
    };
  }

  if (opsStage === 'waiting_redelivery') {
    return {
      category: 'processing',
      label: 'Cho giao lai / hoan hang',
      type: 'warning',
    };
  }

  if (opsStage === 'delivery_failed' || shipmentStatus === 'delivery_fail') {
    return { category: 'processing', label: 'Giao that bai', type: 'error' };
  }

  if (opsStage === 'picking') {
    return {
      category: 'processing',
      label: 'Ops dang lay hang',
      type: 'warning',
    };
  }

  if (opsStage === 'waiting_lab') {
    return {
      category: 'processing',
      label: 'Cho vao gia cong trong',
      type: 'info',
    };
  }

  if (opsStage === 'lens_processing') {
    return {
      category: 'processing',
      label: 'Dang cat mai trong',
      type: 'warning',
    };
  }

  if (opsStage === 'lens_fitting') {
    return {
      category: 'processing',
      label: 'Dang lap trong vao gong',
      type: 'warning',
    };
  }

  if (opsStage === 'qc_check') {
    return {
      category: 'processing',
      label: 'Dang QC sau gia cong',
      type: 'info',
    };
  }

  if (opsStage === 'ready_to_pack') {
    return {
      category: 'processing',
      label: 'Da gia cong xong, cho dong goi',
      type: 'success',
    };
  }

  if (opsStage === 'packing') {
    return {
      category: 'processing',
      label: 'Ops dang dong goi',
      type: 'warning',
    };
  }

  if (opsStage === 'ready_to_ship') {
    return {
      category: 'processing',
      label: 'San sang tao van don',
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
    return { category: 'processing', label: 'Dang van chuyen', type: 'info' };
  }

  if (
    opsStage === 'handover_to_carrier' ||
    ['picking', 'money_collect_picking', 'picked', 'storing'].includes(
      shipmentStatus
    )
  ) {
    return {
      category: 'processing',
      label: 'GHN dang nhan hang',
      type: 'info',
    };
  }

  if (opsStage === 'shipment_created' || shipmentStatus === 'ready_to_pick') {
    return { category: 'processing', label: 'Da tao van don', type: 'info' };
  }

  if (opsStage === 'packing' || rawStatus === 'processing') {
    return { category: 'processing', label: 'Dang xu ly don', type: 'warning' };
  }

  if (rawStatus === 'confirmed') {
    return { category: 'processing', label: 'Da xac nhan don', type: 'info' };
  }

  if (
    opsStage === 'waiting_customer_info' ||
    opsStage === 'on_hold' ||
    opsStage === 'exception_hold'
  ) {
    return {
      category: 'processing',
      label: 'Don dang can xu ly bo sung',
      type: 'warning',
    };
  }

  return { category: 'pending', label: 'Cho xac nhan', type: 'info' };
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
      label: 'Da giao hang',
      type: 'success',
      rawStatus: shipmentStatus,
    };
  }

  if (shipmentStatus === 'returned') {
    return { label: 'Da hoan hang', type: 'error', rawStatus: shipmentStatus };
  }

  if (
    ['return', 'return_transporting', 'return_sorting', 'returning'].includes(
      shipmentStatus
    ) ||
    opsStage === 'return_pending' ||
    opsStage === 'return_in_transit'
  ) {
    return {
      label: 'Dang hoan hang',
      type: 'warning',
      rawStatus: shipmentStatus,
    };
  }

  if (
    shipmentStatus === 'waiting_to_return' ||
    opsStage === 'waiting_redelivery'
  ) {
    return {
      label: 'Cho giao lai / hoan hang',
      type: 'warning',
      rawStatus: shipmentStatus,
    };
  }

  if (shipmentStatus === 'delivery_fail' || opsStage === 'delivery_failed') {
    return { label: 'Giao that bai', type: 'error', rawStatus: shipmentStatus };
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
      label: 'Dang van chuyen',
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
      label: 'GHN dang nhan hang',
      type: 'info',
      rawStatus: shipmentStatus,
    };
  }

  if (
    shipmentStatus === 'ready_to_pick' ||
    opsStage === 'shipment_created' ||
    shipmentCode
  ) {
    return { label: 'Da tao van don', type: 'info', rawStatus: shipmentStatus };
  }

  if (opsStage === 'ready_to_ship') {
    return {
      label: 'San sang tao van don',
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
      label: 'Van don can xu ly thu cong',
      type: 'error',
      rawStatus: shipmentStatus,
    };
  }

  return {
    label: 'Dang xu ly van chuyen',
    type: 'default',
    rawStatus: shipmentStatus,
  };
}
