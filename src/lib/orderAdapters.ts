import type { OrderItem, OrderRecord } from '@/api/orders';
import type { PendingOrder, PaymentStatus } from '@/types/pending';
import type { PreorderOrder, PreorderProduct } from '@/types/preorder';
import type { MissingField, SupplementOrder } from '@/types/prescription';
import type {
  PrescriptionData,
  PrescriptionOrder,
} from '@/types/rxPrescription';

export type DashboardOrder = {
  id: string;
  customerName: string;
  products: string[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
};

const RX_RELEVANT_PRODUCT_TYPES = new Set(['lens']);
const RX_FINALIZED_ORDER_STATUSES = new Set([
  'processing',
  'shipped',
  'delivered',
  'completed',
]);
const RX_APPROVED_OPS_STAGES = new Set([
  'waiting_lab',
  'lens_processing',
  'lens_fitting',
  'qc_check',
  'ready_to_pack',
  'packing',
  'ready_to_ship',
  'shipment_created',
  'handover_to_carrier',
  'in_transit',
  'delivery_failed',
  'waiting_redelivery',
  'return_pending',
  'return_in_transit',
  'exception_hold',
  'delivered',
  'closed',
  'returned',
]);

const RX_WORKFLOW_STAGE_MAP = new Map([
  ['waiting_lab', 'waiting_lab'],
  ['lens_processing', 'lens_processing'],
  ['lens_fitting', 'lens_fitting'],
  ['qc_check', 'qc_check'],
  ['ready_to_pack', 'ready_to_pack'],
  ['packing', 'packing'],
  ['ready_to_ship', 'ready_to_ship'],
  ['shipment_created', 'shipment_created'],
  ['handover_to_carrier', 'handover_to_carrier'],
  ['in_transit', 'in_transit'],
  ['delivery_failed', 'delivery_failed'],
  ['waiting_redelivery', 'waiting_redelivery'],
  ['return_pending', 'return_pending'],
  ['return_in_transit', 'return_in_transit'],
  ['exception_hold', 'exception_hold'],
  ['returned', 'returned'],
  ['delivered', 'delivered'],
  ['closed', 'delivered'],
]);

function formatDate(dateValue?: string): string {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateValue?: string): string {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hour}:${minute}`;
}

function formatIsoDate(dateValue?: string): string {
  if (!dateValue) return new Date().toISOString().slice(0, 10);
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime()))
    return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function plusDaysIso(dateValue: string, days: number): string {
  const base = new Date(dateValue);
  if (Number.isNaN(base.getTime()))
    return new Date().toISOString().slice(0, 10);
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

function calculateDaysPending(dateValue?: string): number {
  if (!dateValue) return 0;
  const createdAt = new Date(dateValue).getTime();
  if (Number.isNaN(createdAt)) return 0;
  const diffMs = Date.now() - createdAt;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

function mapPaymentStatus(status: OrderRecord['paymentStatus']): PaymentStatus {
  if (status === 'paid') return 'paid';
  if (status === 'partial') return 'partial';
  if (status === 'cod') return 'cod';
  return 'pending';
}

function resolvePendingOrderType(order: OrderRecord): string {
  const normalized = String(order.orderType || '')
    .trim()
    .toLowerCase();

  if (normalized === 'pre_order' || normalized === 'preorder') {
    return 'pre_order';
  }

  if (normalized === 'ready_stock') {
    return 'ready_stock';
  }

  if (
    normalized === 'prescription' ||
    normalized === 'made_to_order' ||
    normalized === 'made-to-order' ||
    normalized === 'custom'
  ) {
    return 'prescription';
  }

  if (order.items.some((item) => item.preOrder)) {
    return 'pre_order';
  }

  if (order.items.some(requiresPrescription)) {
    return 'prescription';
  }

  return normalized;
}

function getRawOrderStatus(order: Pick<OrderRecord, 'rawStatus'>): string {
  return String(order.rawStatus || '')
    .trim()
    .toLowerCase();
}

function estimateExpectedDate(dateValue?: string): string {
  const base = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(base.getTime()))
    return new Date().toISOString().slice(0, 10);
  const next = new Date(base.getTime());
  next.setDate(next.getDate() + 14);
  return next.toISOString().slice(0, 10);
}

function mapPreorderStatus(order: OrderRecord): PreorderOrder['status'] {
  const rawStatus = getRawOrderStatus(order);
  if (rawStatus === 'cancelled') return 'cancelled';
  if (
    rawStatus === 'processing' ||
    rawStatus === 'shipped' ||
    rawStatus === 'delivered'
  ) {
    return 'ready';
  }
  return 'waiting_stock';
}

function mapPreorderProductStatus(
  order: OrderRecord
): PreorderProduct['status'] {
  const rawStatus = getRawOrderStatus(order);
  if (
    rawStatus === 'processing' ||
    rawStatus === 'shipped' ||
    rawStatus === 'delivered'
  ) {
    return 'arrived';
  }
  return 'waiting';
}

function mapPreorderOpsStatus(order: OrderRecord): PreorderOrder['opsStatus'] {
  const opsStage = String(order.opsStage || '')
    .trim()
    .toLowerCase();
  const shipmentState = String(order.shipment?.state || '')
    .trim()
    .toLowerCase();
  const hasShipment = Boolean(
    String(
      order.shipment?.orderCode || order.shipment?.trackingCode || ''
    ).trim()
  );
  const rawStatus = getRawOrderStatus(order);

  if (opsStage === 'waiting_arrival') return 'waiting_arrival';
  if (opsStage === 'arrived') return 'arrived';
  if (opsStage === 'stocked') return 'stocked';
  if (opsStage === 'ready_to_pack') return 'ready_to_pack';
  if (opsStage === 'packing') return 'packing';
  if (
    opsStage === 'shipment_created' ||
    opsStage === 'handover_to_carrier' ||
    opsStage === 'in_transit' ||
    opsStage === 'delivery_failed' ||
    opsStage === 'waiting_redelivery' ||
    opsStage === 'return_pending' ||
    opsStage === 'return_in_transit' ||
    opsStage === 'exception_hold' ||
    opsStage === 'returned' ||
    opsStage === 'delivered' ||
    opsStage === 'closed'
  ) {
    return 'shipment_created';
  }

  if (
    shipmentState === 'created' ||
    shipmentState === 'in_transit' ||
    hasShipment
  )
    return 'shipment_created';
  if (rawStatus === 'shipped' || rawStatus === 'delivered')
    return 'shipment_created';
  if (rawStatus === 'processing') return 'stocked';
  return 'waiting_arrival';
}

function inferPreorderPriority(order: OrderRecord): PreorderOrder['priority'] {
  const now = Date.now();
  const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : NaN;
  const ageHours = Number.isNaN(createdAt)
    ? 0
    : (now - createdAt) / (1000 * 60 * 60);
  const note = (order.note || '').toLowerCase();

  if (note.includes('vip') || note.includes('gấp') || ageHours >= 72)
    return 'urgent';
  if (ageHours >= 24 || order.total >= 10_000_000) return 'high';
  return 'normal';
}

function inferRxPriority(order: OrderRecord): PrescriptionOrder['priority'] {
  const now = Date.now();
  const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : NaN;
  const ageHours = Number.isNaN(createdAt)
    ? 0
    : (now - createdAt) / (1000 * 60 * 60);
  const note = (order.note || '').toLowerCase();

  if (note.includes('vip') || note.includes('gấp') || ageHours >= 72)
    return 'urgent';
  if (ageHours >= 24 || order.total >= 8_000_000) return 'high';
  return 'normal';
}

function requiresPrescription(item: OrderItem): boolean {
  return (
    item.prescriptionMode !== 'none' ||
    item.orderMadeFromPrescriptionImage ||
    item.hasPrescription ||
    RX_RELEVANT_PRODUCT_TYPES.has(item.type)
  );
}

function isOrderRelevantForRx(order: OrderRecord): boolean {
  return !['cancelled', 'returned'].includes(order.rawStatus);
}

function getRxItems(order: OrderRecord): OrderItem[] {
  return order.items.filter(requiresPrescription);
}

function getFirstPrescriptionAttachmentUrl(
  rxItems: OrderItem[]
): string | undefined {
  return rxItems.find((item) => (item.prescription?.attachmentUrls || []).length > 0)
    ?.prescription?.attachmentUrls?.[0];
}

function toProductFrame(item: OrderItem): string {
  const value = String(item.variant || '').trim();
  return value || 'Mặc định';
}

function toProductSku(orderId: string, item: OrderItem, index: number): string {
  if (item.id) return item.id.slice(-6).toUpperCase();
  const seed = orderId ? orderId.slice(-6).toUpperCase() : 'ITEM';
  return `${seed}-${index + 1}`;
}

function toPrescriptionData(item: OrderItem): PrescriptionData | undefined {
  if (!item.prescription || item.prescriptionMode === 'none') return undefined;
  return {
    sphereRight: item.prescription.rightEye.sphere || '',
    cylinderRight: item.prescription.rightEye.cyl || '',
    axisRight: item.prescription.rightEye.axis || '',
    sphereLeft: item.prescription.leftEye.sphere || '',
    cylinderLeft: item.prescription.leftEye.cyl || '',
    axisLeft: item.prescription.leftEye.axis || '',
    pd: item.prescription.pd || '',
    addRight: item.prescription.rightEye.add || '',
    addLeft: item.prescription.leftEye.add || '',
    lensType: item.prescription.lensType || '',
    coating: item.prescription.coating || '',
    notes: item.prescription.note || '',
  };
}

function isFilled(value?: string): boolean {
  return String(value || '').trim().length > 0;
}

function isManualPrescriptionComplete(item: OrderItem): boolean {
  const prescription = item.prescription;
  if (!prescription) return false;

  return (
    isFilled(prescription.rightEye.sphere) &&
    isFilled(prescription.rightEye.cyl) &&
    isFilled(prescription.rightEye.axis) &&
    isFilled(prescription.leftEye.sphere) &&
    isFilled(prescription.leftEye.cyl) &&
    isFilled(prescription.leftEye.axis) &&
    isFilled(prescription.pd)
  );
}

function getRxStatusByItem(
  item: OrderItem
): PrescriptionOrder['prescriptionStatus'] {
  if (item.prescriptionMode === 'none') return 'missing';

  if (item.prescriptionMode === 'manual') {
    return isManualPrescriptionComplete(item) ? 'pending_review' : 'incomplete';
  }

  if (item.prescriptionMode === 'upload') {
    const hasAttachment = (item.prescription?.attachmentUrls || []).length > 0;
    return hasAttachment ? 'pending_review' : 'missing';
  }

  return 'missing';
}

function resolveRxStatus(
  order: OrderRecord,
  rxItems: OrderItem[]
): PrescriptionOrder['prescriptionStatus'] {
  const itemStatuses = rxItems.map(getRxStatusByItem);

  if (itemStatuses.includes('missing')) return 'missing';
  if (itemStatuses.includes('incomplete')) return 'incomplete';

  const opsStage = String(order.opsStage || '')
    .trim()
    .toLowerCase();
  if (RX_APPROVED_OPS_STAGES.has(opsStage)) {
    return 'approved';
  }

  if (RX_FINALIZED_ORDER_STATUSES.has(order.rawStatus)) {
    return 'approved';
  }

  if (itemStatuses.includes('pending_review')) return 'pending_review';
  return 'approved';
}

function resolvePrescriptionWorkflowStage(
  order: OrderRecord,
  prescriptionStatus: PrescriptionOrder['prescriptionStatus']
): PrescriptionOrder['workflowStage'] {
  if (prescriptionStatus !== 'approved') {
    return 'waiting_review';
  }

  const opsStage = String(order.opsStage || '')
    .trim()
    .toLowerCase();
  const mapped = RX_WORKFLOW_STAGE_MAP.get(opsStage);
  if (mapped) {
    return mapped as PrescriptionOrder['workflowStage'];
  }

  const rawStatus = getRawOrderStatus(order);
  if (rawStatus === 'shipped') return 'in_transit';
  if (rawStatus === 'delivered' || rawStatus === 'completed') return 'delivered';
  if (rawStatus === 'returned') return 'returned';
  if (rawStatus === 'processing') return 'lens_processing';
  return 'waiting_lab';
}

function resolveRxSource(rxItems: OrderItem[]): PrescriptionOrder['source'] {
  if (rxItems.some((item) => item.prescriptionMode === 'upload')) {
    return 'customer_upload';
  }
  if (rxItems.some((item) => item.prescriptionMode === 'manual')) {
    return 'store_input';
  }
  return 'pending';
}

function buildMissingFieldsForIncomplete(item: OrderItem): MissingField[] {
  const prescription = item.prescription;
  if (!prescription) return [];

  const output: MissingField[] = [];

  if (!isFilled(prescription.rightEye.sphere)) {
    output.push({ field: 'sphere', label: 'SPH (Độ cầu)', eye: 'OD' });
  }
  if (!isFilled(prescription.leftEye.sphere)) {
    output.push({ field: 'sphere', label: 'SPH (Độ cầu)', eye: 'OS' });
  }
  if (!isFilled(prescription.rightEye.cyl)) {
    output.push({ field: 'cylinder', label: 'CYL (Độ loạn)', eye: 'OD' });
  }
  if (!isFilled(prescription.leftEye.cyl)) {
    output.push({ field: 'cylinder', label: 'CYL (Độ loạn)', eye: 'OS' });
  }
  if (!isFilled(prescription.rightEye.axis)) {
    output.push({ field: 'axis', label: 'AXIS (Trục)', eye: 'OD' });
  }
  if (!isFilled(prescription.leftEye.axis)) {
    output.push({ field: 'axis', label: 'AXIS (Trục)', eye: 'OS' });
  }
  if (!isFilled(prescription.pd)) {
    output.push({ field: 'pd', label: 'PD (Khoảng cách đồng tử)' });
  }

  return output;
}

function buildDefaultMissingFields(): MissingField[] {
  return [
    { field: 'sphere', label: 'SPH (Độ cầu)', eye: 'both' },
    { field: 'cylinder', label: 'CYL (Độ loạn)', eye: 'both' },
    { field: 'axis', label: 'AXIS (Trục)', eye: 'both' },
    { field: 'pd', label: 'PD (Khoảng cách đồng tử)' },
  ];
}

export function toDashboardOrder(order: OrderRecord): DashboardOrder {
  return {
    id: order.code,
    customerName: order.customerName,
    products: order.items.map((item) => item.name),
    total: order.total,
    status: order.status,
    date: formatDate(order.createdAt),
  };
}

export function toPendingOrder(order: OrderRecord): PendingOrder {
  const products =
    order.items.length > 0
      ? order.items.map((item) => ({
          name: item.name,
          variant: item.variant,
          qty: item.quantity,
          price: item.unitPrice,
        }))
      : [
          {
            name: 'Sản phẩm',
            variant: 'Mặc định',
            qty: 1,
            price: order.total,
          },
        ];

  return {
    id: order.code,
    orderDbId: order.id,
    customer: order.customerName,
    phone: order.customerPhone || '-',
    address: order.customerAddress || '-',
    products,
    total: order.total,
    status: order.rawStatus || 'pending',
    orderType: resolvePendingOrderType(order),
    createdAt: formatDateTime(order.createdAt),
    note: order.note || '',
    hasPrescription: order.items.some(requiresPrescription),
    paymentStatus: mapPaymentStatus(order.paymentStatus),
    approvalState:
      order.opsExecution?.approvalState === 'manager_review_requested'
        ? 'manager_review_requested'
        : order.opsExecution?.approvalState === 'sent_back_to_sale'
          ? 'sent_back_to_sale'
          : 'none',
    managerReviewRequestedAt: order.opsExecution?.managerReviewRequestedAt,
    managerReviewRequestedBy: order.opsExecution?.managerReviewRequestedBy,
    managerReviewReason: order.opsExecution?.managerReviewReason,
  };
}

export function toPrescriptionOrder(
  order: OrderRecord
): PrescriptionOrder | null {
  if (!isOrderRelevantForRx(order)) return null;

  const rxItems = getRxItems(order);
  if (rxItems.length === 0) return null;

  const createdDate = formatIsoDate(order.createdAt);
  const prescriptionStatus = resolveRxStatus(order, rxItems);
  const workflowStage = resolvePrescriptionWorkflowStage(
    order,
    prescriptionStatus
  );
  const source = resolveRxSource(rxItems);
  const itemForPrescription =
    rxItems.find((item) => item.prescriptionMode !== 'none') || rxItems[0];
  const attachmentUrl = getFirstPrescriptionAttachmentUrl(rxItems);
  const rxItemIds = rxItems.map((item) => item.id).filter(Boolean);

  return {
    id: order.id,
    orderId: order.code,
    rawOrderStatus: order.rawStatus,
    opsStage: order.opsStage,
    customer: order.customerName,
    phone: order.customerPhone || '-',
    email: '-',
    address: order.customerAddress || '-',
    orderDate: createdDate,
    products: rxItems.map((item, index) => ({
      name: item.name,
      sku: toProductSku(order.id, item, index),
      frame: toProductFrame(item),
      quantity: item.quantity,
    })),
    prescriptionStatus,
    prescription: toPrescriptionData(itemForPrescription),
    priority: inferRxPriority(order),
    dueDate: plusDaysIso(createdDate, 3),
    notes: order.note || '',
    source,
    attachmentUrl,
    workflowStage,
    trackingCode: order.shipment?.trackingCode || undefined,
    shipmentStatus: order.shipment?.latestStatus || undefined,
    rxItemIds,
    primaryRxItemId: rxItemIds[0],
  };
}

export function toSupplementOrder(order: OrderRecord): SupplementOrder | null {
  const rxOrder = toPrescriptionOrder(order);
  if (!rxOrder) return null;
  if (
    rxOrder.prescriptionStatus === 'approved' ||
    rxOrder.prescriptionStatus === 'pending_review'
  ) {
    return null;
  }

  const rxItems = getRxItems(order);
  const primaryItem = rxItems[0];
  const mode = primaryItem?.prescriptionMode || 'none';

  let missingType: SupplementOrder['missingType'];
  if (rxOrder.prescriptionStatus === 'missing') {
    missingType = mode === 'upload' ? 'unclear_image' : 'no_prescription';
  } else if (rxOrder.prescriptionStatus === 'incomplete') {
    missingType = 'incomplete_data';
  } else {
    missingType = mode === 'upload' ? 'unclear_image' : 'need_verification';
  }

  let missingFields: MissingField[] = [];
  if (missingType === 'no_prescription') {
    missingFields = buildDefaultMissingFields();
  } else if (missingType === 'incomplete_data' && primaryItem) {
    missingFields = buildMissingFieldsForIncomplete(primaryItem);
  } else if (missingType === 'unclear_image') {
    missingFields = [
      { field: 'all', label: 'Ảnh đơn thuốc chưa rõ, cần xác minh' },
    ];
  } else {
    missingFields = [
      { field: 'all', label: 'Cần xác nhận lại thông số mắt với khách' },
    ];
  }

  const attachmentUrl = getFirstPrescriptionAttachmentUrl(rxItems);

  return {
    id: rxOrder.id,
    orderId: rxOrder.orderId,
    customer: rxOrder.customer,
    phone: rxOrder.phone,
    email: rxOrder.email,
    orderDate: rxOrder.orderDate,
    products: rxOrder.products,
    missingType,
    missingFields,
    priority: rxOrder.priority,
    dueDate: rxOrder.dueDate,
    daysPending: calculateDaysPending(order.createdAt),
    contactAttempts: 0,
    contactHistory: [],
    prescriptionImage: attachmentUrl,
    notes: rxOrder.notes,
  };
}

export function toPreorderOrder(order: OrderRecord): PreorderOrder {
  const products: PreorderProduct[] =
    order.items.length > 0
      ? order.items.map((item, index) => ({
          sku: `${order.id.slice(-6).toUpperCase()}-${index + 1}`,
          name: item.name,
          variant: item.variant,
          supplier: item.supplier || '',
          warehouseLocation: item.warehouseLocation || '',
          quantity: item.quantity,
          batchCode: null,
          batchExpectedDate: null,
          status: mapPreorderProductStatus(order),
        }))
      : [
          {
            sku: `${order.id.slice(-6).toUpperCase()}-1`,
            name: 'Sản phẩm',
            variant: 'Mặc định',
            supplier: '',
            warehouseLocation: '',
            quantity: 1,
            batchCode: null,
            batchExpectedDate: null,
            status: mapPreorderProductStatus(order),
          },
        ];

  return {
    id: order.id,
    rawOrderStatus: order.rawStatus,
    orderCode: order.code,
    storeId: order.storeId,
    storeName: order.storeName,
    customerName: order.customerName,
    customerPhone: order.customerPhone || '-',
    customerAddress: order.customerAddress || '-',
    orderDate: order.createdAt
      ? order.createdAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    expectedDate: estimateExpectedDate(order.createdAt),
    products,
    totalAmount: order.total,
    paymentStatus: mapPaymentStatus(order.paymentStatus),
    depositAmount: Math.min(order.paidAmount, order.payNowTotal),
    status: mapPreorderStatus(order),
    notes: order.note || '',
    priority: inferPreorderPriority(order),
    opsStatus: mapPreorderOpsStatus(order),
    carrierId: String(order.shipment?.provider || '')
      .trim()
      .toLowerCase(),
    trackingCode: String(
      order.shipment?.orderCode || order.shipment?.trackingCode || ''
    ).trim(),
    shipmentState: String(order.shipment?.state || '')
      .trim()
      .toLowerCase(),
    shipmentStatus: String(order.shipment?.latestStatus || '')
      .trim()
      .toLowerCase(),
    shipmentServiceName: String(order.shipment?.serviceName || '').trim(),
  };
}
