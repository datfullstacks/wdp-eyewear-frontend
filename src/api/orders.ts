import apiClient from './client';
import type {
  ReadyStockChecklistKey,
  ReadyStockItemOpsState,
  ReadyStockIssueType,
  ReadyStockOrderOpsState,
  ReadyStockOpsStatus,
} from '@/types/readyStockOps';

export type UiOrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'cancelled';
export type UiPaymentStatus = 'paid' | 'pending' | 'partial' | 'cod';
export type PrescriptionMode = 'none' | 'manual' | 'upload';
export type OrderShippingAction =
  | 'view_tracking'
  | 'create_shipment'
  | 'sync_shipment'
  | 'update_test_status'
  | 'print_label'
  | 'cancel_shipment'
  | 'return_shipment'
  | 'delivery_again';
export type OrderShippingTestStatus =
  | 'ready_to_pick'
  | 'picking'
  | 'transporting'
  | 'delivered'
  | 'returned';
export type OrderOpsStage =
  | 'none'
  | 'pending_operations'
  | 'picking'
  | 'waiting_customer_info'
  | 'on_hold'
  | 'waiting_arrival'
  | 'arrived'
  | 'stocked'
  | 'ready_to_pack'
  | 'waiting_lab'
  | 'lens_processing'
  | 'lens_fitting'
  | 'qc_check'
  | 'packing'
  | 'ready_to_ship'
  | 'shipment_created'
  | 'handover_to_carrier'
  | 'in_transit'
  | 'delivery_failed'
  | 'waiting_redelivery'
  | 'return_pending'
  | 'return_in_transit'
  | 'exception_hold'
  | 'delivered'
  | 'closed'
  | 'returned'
  | 'cancelled';

interface BackendEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface BackendShippingAddress {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  ward?: string;
  wardCode?: string;
  district?: string;
  districtId?: number;
  province?: string;
  provinceId?: number;
}

interface BackendShipment {
  provider?: string;
  state?: string;
  orderCode?: string;
  clientOrderCode?: string;
  shopId?: number;
  serviceId?: number;
  serviceTypeId?: number;
  serviceName?: string;
  latestStatus?: string;
  latestFailCode?: string;
  latestFailReason?: string;
  labelToken?: string;
  leadtime?: string;
  shippingFee?: number;
  codAmount?: number;
  trackingCode?: string;
  trackingUrl?: string;
  lastAction?: string;
  lastActionAt?: string;
  lastSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  latestSnapshot?: unknown;
}

interface BackendOpsExecutionItemState {
  picked?: boolean;
  warehouseLocation?: string;
  issueType?: string | null;
  issueNote?: string;
  internalNote?: string;
}

interface BackendOpsExecution {
  lastUpdatedAt?: string;
  assignee?: string;
  salesApprovedAt?: string;
  salesApprovedBy?: string;
  salesHandoffNote?: string;
  approvalState?: string;
  managerReviewRequestedAt?: string;
  managerReviewRequestedBy?: string;
  managerReviewReason?: string;
  internalNote?: string;
  holdReason?: string | null;
  holdNote?: string;
  paymentFailed?: boolean;
  checklist?: Partial<Record<ReadyStockChecklistKey, boolean>>;
  carrierId?: string;
  trackingCode?: string;
  issueType?: string | null;
  issueNote?: string;
  itemStates?: Record<string, BackendOpsExecutionItemState>;
}

interface BackendItemCustomization {
  orderMadeFromPrescriptionImage?: boolean;
  prescription?: {
    mode?: PrescriptionMode | string;
    isMyopic?: boolean;
    rightEye?: {
      sphere?: string;
      cyl?: string;
      axis?: string;
      add?: string;
    };
    leftEye?: {
      sphere?: string;
      cyl?: string;
      axis?: string;
      add?: string;
    };
    pd?: string;
    lensType?: string;
    coating?: string;
    note?: string;
    attachmentUrls?: string[];
  };
}

interface BackendProductRef {
  _id?: string;
  id?: string;
  fulfillment?: {
    supplier?: string;
  };
  variants?: Array<{
    _id?: string;
    id?: string;
    sku?: string;
    warehouseLocation?: string;
  }>;
}

interface BackendStoreRef {
  _id?: string;
  id?: string;
  name?: string;
}

interface BackendOrderItem {
  _id?: string;
  productId?: string | BackendProductRef;
  variantId?: string;
  name?: string;
  type?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  preOrder?: boolean;
  variantOptions?: {
    color?: string;
    size?: string;
  };
  customization?: BackendItemCustomization;
}

interface BackendRefundBreakdown {
  itemAmount?: number;
  shippingFeeAmount?: number;
  returnShippingFeeAmount?: number;
  total?: number;
}

interface BackendRefundBankAccount {
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  note?: string;
}

interface BackendRefundHistoryEntry {
  action?: string;
  fromStatus?: string;
  toStatus?: string;
  actorUserId?: string;
  actorRole?: string;
  actorName?: string;
  note?: string;
  meta?: unknown;
  createdAt?: string;
}

interface BackendOrderRefund {
  status?: string;
  reason?: string;
  responsibility?: string;
  requiresReturn?: boolean;
  amount?: number;
  requestedBreakdown?: BackendRefundBreakdown | null;
  approvedBreakdown?: BackendRefundBreakdown | null;
  requestedAt?: string;
  approvedAt?: string;
  processedAt?: string;
  rejectReason?: string;
  decisionNote?: string;
  contactNote?: string;
  escalateReason?: string;
  contactChannels?: string[];
  bankAccount?: BackendRefundBankAccount | null;
  transactionRef?: string;
  currentOwnerRole?: string;
  currentOwnerUserId?: string;
  nextActionCode?: string;
  inspectionStatus?: string;
  inspectionNote?: string;
  inspectionAt?: string;
  returnShipmentCode?: string;
  returnCarrier?: string;
  returnReceivedAt?: string;
  payoutProofUrl?: string;
  evidence?: string[] | null;
  history?: BackendRefundHistoryEntry[] | null;
}

interface BackendOrder {
  _id?: string;
  id?: string;
  storeId?: string | BackendStoreRef | null;
  paymentCode?: string;
  items?: BackendOrderItem[];
  total?: number;
  payNowTotal?: number;
  payLaterTotal?: number;
  paidAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderType?: string;
  status?: string;
  opsStage?: string;
  note?: string;
  createdAt?: string;
  shippingAddress?: BackendShippingAddress;
  shipment?: BackendShipment | null;
  opsExecution?: BackendOpsExecution | null;
  refund?: BackendOrderRefund | null;
}

interface BackendShippingInfo {
  orderId?: string;
  orderStatus?: string;
  opsStage?: string;
  shippingMethod?: string;
  shipment?: BackendShipment | null;
  currentRole?: string;
  permissions?: Record<string, boolean>;
  roleMatrix?: Record<string, string[]>;
  testMode?: boolean;
  testStatusOptions?: string[];
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  type: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variant: string;
  supplier: string;
  warehouseLocation: string;
  preOrder: boolean;
  hasPrescription: boolean;
  prescriptionMode: PrescriptionMode;
  orderMadeFromPrescriptionImage: boolean;
  prescription: {
    mode: PrescriptionMode;
    isMyopic: boolean;
    rightEye: {
      sphere: string;
      cyl: string;
      axis: string;
      add: string;
    };
    leftEye: {
      sphere: string;
      cyl: string;
      axis: string;
      add: string;
    };
    pd: string;
    lensType: string;
    coating: string;
    note: string;
    attachmentUrls: string[];
  } | null;
}

export interface OrderShipment {
  provider: string;
  state: string;
  orderCode: string;
  clientOrderCode: string;
  shopId: number | null;
  serviceId: number | null;
  serviceTypeId: number | null;
  serviceName: string;
  latestStatus: string;
  latestFailCode: string;
  latestFailReason: string;
  labelToken: string;
  leadtime?: string;
  shippingFee: number;
  codAmount: number;
  trackingCode: string;
  trackingUrl: string;
  lastAction: string;
  lastActionAt?: string;
  lastSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  latestSnapshot?: unknown;
}

export interface OrderShippingInfo {
  orderId: string;
  orderStatus: string;
  opsStage?: OrderOpsStage;
  shippingMethod: string;
  shipment: OrderShipment | null;
  currentRole: string;
  permissions: Partial<Record<OrderShippingAction, boolean>>;
  roleMatrix: Record<string, string[]>;
  testMode: boolean;
  testStatusOptions: OrderShippingTestStatus[];
}

export interface OrderOpsExecutionPatch {
  assignee?: string;
  salesApprovedAt?: string;
  salesApprovedBy?: string;
  salesHandoffNote?: string;
  approvalState?: ReadyStockOrderOpsState['approvalState'];
  managerReviewRequestedAt?: string;
  managerReviewRequestedBy?: string;
  managerReviewReason?: string;
  internalNote?: string;
  holdReason?: ReadyStockOrderOpsState['holdReason'];
  holdNote?: string;
  paymentFailed?: boolean;
  checklist?: Partial<Record<ReadyStockChecklistKey, boolean>>;
  carrierId?: string;
  trackingCode?: string;
  issueType?: ReadyStockIssueType | null;
  issueNote?: string;
  itemStates?: Record<string, Partial<ReadyStockItemOpsState>>;
}

export type RefundResponsibility = 'customer' | 'system' | 'carrier' | 'mixed';

export type RefundStatus =
  | 'none'
  | 'requested'
  | 'reviewing'
  | 'waiting_customer_info'
  | 'escalated_to_manager'
  | 'approved'
  | 'return_pending'
  | 'return_received'
  | 'processing'
  | 'completed'
  | 'rejected';

export interface RefundBreakdown {
  itemAmount: number;
  shippingFeeAmount: number;
  returnShippingFeeAmount: number;
  total: number;
}

export interface RefundBankAccount {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  note: string;
}

export interface RefundHistoryEntry {
  action: string;
  fromStatus: string;
  toStatus: string;
  actorUserId: string;
  actorRole: string;
  actorName: string;
  note: string;
  meta?: unknown;
  createdAt?: string;
}

export type RefundInspectionStatus =
  | 'not_required'
  | 'pending'
  | 'passed'
  | 'failed';

export interface OrderRefund {
  status: RefundStatus;
  reason: string;
  responsibility?: RefundResponsibility;
  requiresReturn: boolean;
  amount: number;
  requestedBreakdown: RefundBreakdown;
  approvedBreakdown: RefundBreakdown;
  requestedAt?: string;
  approvedAt?: string;
  processedAt?: string;
  rejectReason: string;
  decisionNote: string;
  contactNote: string;
  escalateReason: string;
  contactChannels: Array<'email' | 'phone'>;
  bankAccount?: RefundBankAccount;
  transactionRef: string;
  currentOwnerRole: string;
  currentOwnerUserId?: string;
  nextActionCode: string;
  inspectionStatus: RefundInspectionStatus;
  inspectionNote: string;
  inspectionAt?: string;
  returnShipmentCode: string;
  returnCarrier: string;
  returnReceivedAt?: string;
  payoutProofUrl: string;
  evidence: string[];
  history: RefundHistoryEntry[];
}

export interface OrderRecord {
  id: string;
  code: string;
  storeId: string;
  storeName: string;
  status: UiOrderStatus;
  rawStatus: string;
  opsStage?: OrderOpsStage;
  paymentStatus: UiPaymentStatus;
  paymentMethod: string;
  orderType: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  payNowTotal: number;
  payLaterTotal: number;
  paidAmount: number;
  note: string;
  createdAt?: string;
  shipment?: OrderShipment | null;
  opsExecution?: Partial<ReadyStockOrderOpsState> | null;
  refund?: OrderRefund | null;
}

export interface OrdersResponse {
  orders: OrderRecord[];
  total: number;
  page: number;
  pageSize: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mapOrderStatus(rawStatus?: string): UiOrderStatus {
  const normalized = String(rawStatus || '')
    .trim()
    .toLowerCase();

  if (normalized === 'delivered') return 'completed';
  if (normalized === 'cancelled' || normalized === 'returned')
    return 'cancelled';
  if (
    normalized === 'confirmed' ||
    normalized === 'processing' ||
    normalized === 'shipped'
  ) {
    return 'processing';
  }
  return 'pending';
}

function mapPaymentStatus(
  rawStatus?: string,
  paymentMethod?: string
): UiPaymentStatus {
  const normalizedMethod = String(paymentMethod || '')
    .trim()
    .toLowerCase();
  if (normalizedMethod === 'cod') return 'cod';

  const normalized = String(rawStatus || '')
    .trim()
    .toLowerCase();
  if (normalized === 'paid') return 'paid';
  if (normalized === 'partial') return 'partial';
  return 'pending';
}

function mapShipment(raw?: BackendShipment | null): OrderShipment | null {
  if (!raw || !isRecord(raw)) return null;

  return {
    provider: String(raw.provider || '')
      .trim()
      .toLowerCase(),
    state: String(raw.state || '')
      .trim()
      .toLowerCase(),
    orderCode: String(raw.orderCode || '').trim(),
    clientOrderCode: String(raw.clientOrderCode || '').trim(),
    shopId: Number.isFinite(Number(raw.shopId)) ? Number(raw.shopId) : null,
    serviceId: Number.isFinite(Number(raw.serviceId))
      ? Number(raw.serviceId)
      : null,
    serviceTypeId: Number.isFinite(Number(raw.serviceTypeId))
      ? Number(raw.serviceTypeId)
      : null,
    serviceName: String(raw.serviceName || '').trim(),
    latestStatus: String(raw.latestStatus || '')
      .trim()
      .toLowerCase(),
    latestFailCode: String(raw.latestFailCode || '').trim(),
    latestFailReason: String(raw.latestFailReason || '').trim(),
    labelToken: String(raw.labelToken || '').trim(),
    leadtime: String(raw.leadtime || '').trim() || undefined,
    shippingFee: Number(raw.shippingFee || 0),
    codAmount: Number(raw.codAmount || 0),
    trackingCode:
      String(raw.trackingCode || '').trim() ||
      String(raw.orderCode || '').trim(),
    trackingUrl: String(raw.trackingUrl || '').trim(),
    lastAction: String(raw.lastAction || '').trim(),
    lastActionAt: String(raw.lastActionAt || '').trim() || undefined,
    lastSyncedAt: String(raw.lastSyncedAt || '').trim() || undefined,
    createdAt: String(raw.createdAt || '').trim() || undefined,
    updatedAt: String(raw.updatedAt || '').trim() || undefined,
    latestSnapshot: raw.latestSnapshot,
  };
}

function mapOpsExecutionItemState(
  raw?: BackendOpsExecutionItemState
): ReadyStockItemOpsState {
  return {
    picked: Boolean(raw?.picked),
    warehouseLocation: String(raw?.warehouseLocation || '').trim(),
    issueType: (String(raw?.issueType || '')
      .trim()
      .toLowerCase() || null) as ReadyStockIssueType | null,
    issueNote: String(raw?.issueNote || '').trim(),
    internalNote: String(raw?.internalNote || '').trim(),
  };
}

function mapOpsExecution(
  raw?: BackendOpsExecution | null
): Partial<ReadyStockOrderOpsState> | null {
  if (!raw || !isRecord(raw)) return null;

  const itemStates = isRecord(raw.itemStates)
    ? Object.fromEntries(
        Object.entries(raw.itemStates).map(([key, value]) => [
          key,
          mapOpsExecutionItemState(value as BackendOpsExecutionItemState),
        ])
      )
    : {};

  const checklist = isRecord(raw.checklist)
    ? {
        skuQuantityChecked: Boolean(raw.checklist.skuQuantityChecked),
        productConditionChecked: Boolean(raw.checklist.productConditionChecked),
        addressChecked: Boolean(raw.checklist.addressChecked),
        packageReady: Boolean(raw.checklist.packageReady),
      }
    : undefined;

  return {
    lastUpdatedAt:
      typeof raw.lastUpdatedAt === 'string' ? raw.lastUpdatedAt : undefined,
    assignee: String(raw.assignee || '').trim(),
    salesApprovedAt:
      typeof raw.salesApprovedAt === 'string' ? raw.salesApprovedAt : undefined,
    salesApprovedBy: String(raw.salesApprovedBy || '').trim(),
    salesHandoffNote: String(raw.salesHandoffNote || '').trim(),
    approvalState: (() => {
      const approvalState = String(raw.approvalState || '').trim().toLowerCase();
      if (approvalState === 'manager_review_requested') {
        return 'manager_review_requested';
      }
      if (approvalState === 'sent_back_to_sale') {
        return 'sent_back_to_sale';
      }
      return 'none';
    })(),
    managerReviewRequestedAt:
      typeof raw.managerReviewRequestedAt === 'string'
        ? raw.managerReviewRequestedAt
        : undefined,
    managerReviewRequestedBy: String(raw.managerReviewRequestedBy || '').trim(),
    managerReviewReason: String(raw.managerReviewReason || '').trim(),
    internalNote: String(raw.internalNote || '').trim(),
    holdReason: (String(raw.holdReason || '')
      .trim()
      .toLowerCase() || null) as ReadyStockOrderOpsState['holdReason'],
    holdNote: String(raw.holdNote || '').trim(),
    paymentFailed: Boolean(raw.paymentFailed),
    checklist,
    carrierId: String(raw.carrierId || '')
      .trim()
      .toLowerCase(),
    trackingCode: String(raw.trackingCode || '').trim(),
    issueType: (String(raw.issueType || '')
      .trim()
      .toLowerCase() || null) as ReadyStockIssueType | null,
    issueNote: String(raw.issueNote || '').trim(),
    itemStates,
  };
}

function mapRefundBreakdown(
  raw?: BackendRefundBreakdown | null
): RefundBreakdown {
  return {
    itemAmount: Number(raw?.itemAmount || 0),
    shippingFeeAmount: Number(raw?.shippingFeeAmount || 0),
    returnShippingFeeAmount: Number(raw?.returnShippingFeeAmount || 0),
    total: Number(raw?.total || 0),
  };
}

function mapRefundBankAccount(
  raw?: BackendRefundBankAccount | null
): RefundBankAccount | undefined {
  if (!raw || !isRecord(raw)) return undefined;

  const bankCode = String(raw.bankCode || '').trim().toUpperCase();
  const bankName = String(raw.bankName || '').trim();
  const accountNumber = String(raw.accountNumber || '').trim();
  const accountHolder = String(raw.accountHolder || '').trim();
  const note = String(raw.note || '').trim();

  if (!bankCode && !bankName && !accountNumber && !accountHolder && !note) {
    return undefined;
  }

  return {
    bankCode,
    bankName,
    accountNumber,
    accountHolder,
    note,
  };
}

function mapRefundHistoryEntry(raw?: BackendRefundHistoryEntry | null): RefundHistoryEntry {
  return {
    action: String(raw?.action || '').trim(),
    fromStatus: String(raw?.fromStatus || 'none')
      .trim()
      .toLowerCase(),
    toStatus: String(raw?.toStatus || 'none')
      .trim()
      .toLowerCase(),
    actorUserId: String(raw?.actorUserId || '').trim(),
    actorRole: String(raw?.actorRole || '').trim().toLowerCase(),
    actorName: String(raw?.actorName || '').trim(),
    note: String(raw?.note || '').trim(),
    meta: raw?.meta,
    createdAt: String(raw?.createdAt || '').trim() || undefined,
  };
}

function mapRefund(raw?: BackendOrderRefund | null): OrderRefund | null {
  if (!raw || !isRecord(raw)) return null;

  return {
    status: (String(raw.status || 'none')
      .trim()
      .toLowerCase() || 'none') as RefundStatus,
    reason: String(raw.reason || '').trim(),
    responsibility: (String(raw.responsibility || '')
      .trim()
      .toLowerCase() || undefined) as RefundResponsibility | undefined,
    requiresReturn: Boolean(raw.requiresReturn),
    amount: Number(raw.amount || 0),
    requestedBreakdown: mapRefundBreakdown(
      raw.requestedBreakdown as BackendRefundBreakdown | null | undefined
    ),
    approvedBreakdown: mapRefundBreakdown(
      raw.approvedBreakdown as BackendRefundBreakdown | null | undefined
    ),
    requestedAt: String(raw.requestedAt || '').trim() || undefined,
    approvedAt: String(raw.approvedAt || '').trim() || undefined,
    processedAt: String(raw.processedAt || '').trim() || undefined,
    rejectReason: String(raw.rejectReason || '').trim(),
    decisionNote: String(raw.decisionNote || '').trim(),
    contactNote: String(raw.contactNote || '').trim(),
    escalateReason: String(raw.escalateReason || '').trim(),
    contactChannels: Array.isArray(raw.contactChannels)
      ? raw.contactChannels
          .map((channel) =>
            String(channel || '')
              .trim()
              .toLowerCase()
          )
          .filter(
            (channel): channel is 'email' | 'phone' =>
              channel === 'email' || channel === 'phone'
          )
      : [],
    bankAccount: mapRefundBankAccount(
      raw.bankAccount as BackendRefundBankAccount | null | undefined
    ),
    transactionRef: String(raw.transactionRef || '').trim(),
    currentOwnerRole: String(raw.currentOwnerRole || 'none')
      .trim()
      .toLowerCase(),
    currentOwnerUserId: String(raw.currentOwnerUserId || '').trim() || undefined,
    nextActionCode: String(raw.nextActionCode || '').trim().toLowerCase(),
    inspectionStatus: (String(raw.inspectionStatus || 'not_required')
      .trim()
      .toLowerCase() || 'not_required') as RefundInspectionStatus,
    inspectionNote: String(raw.inspectionNote || '').trim(),
    inspectionAt: String(raw.inspectionAt || '').trim() || undefined,
    returnShipmentCode: String(raw.returnShipmentCode || '').trim(),
    returnCarrier: String(raw.returnCarrier || '').trim().toLowerCase(),
    returnReceivedAt: String(raw.returnReceivedAt || '').trim() || undefined,
    payoutProofUrl: String(raw.payoutProofUrl || '').trim(),
    evidence: Array.isArray(raw.evidence)
      ? raw.evidence
          .map((entry) => String(entry || '').trim())
          .filter(Boolean)
      : [],
    history: Array.isArray(raw.history)
      ? raw.history.map((entry) =>
          mapRefundHistoryEntry(entry as BackendRefundHistoryEntry)
        )
      : [],
  };
}

function mapOpsStage(rawStage?: string): OrderOpsStage | undefined {
  const normalized = String(rawStage || '')
    .trim()
    .toLowerCase();

  if (!normalized) return undefined;

  const knownStages: OrderOpsStage[] = [
    'none',
    'pending_operations',
    'picking',
    'waiting_customer_info',
    'on_hold',
    'waiting_arrival',
    'arrived',
    'stocked',
    'ready_to_pack',
    'waiting_lab',
    'lens_processing',
    'lens_fitting',
    'qc_check',
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
    'cancelled',
  ];

  return knownStages.includes(normalized as OrderOpsStage)
    ? (normalized as OrderOpsStage)
    : undefined;
}

function mapShippingPermissions(
  value: unknown
): Partial<Record<OrderShippingAction, boolean>> {
  if (!isRecord(value)) return {};

  const output: Partial<Record<OrderShippingAction, boolean>> = {};
  const keys: OrderShippingAction[] = [
    'view_tracking',
    'create_shipment',
    'sync_shipment',
    'update_test_status',
    'print_label',
    'cancel_shipment',
    'return_shipment',
    'delivery_again',
  ];

  for (const key of keys) {
    if (typeof value[key] === 'boolean') {
      output[key] = value[key] as boolean;
    }
  }

  return output;
}

function toVariantLabel(item?: BackendOrderItem): string {
  const color = String(item?.variantOptions?.color || '').trim();
  const size = String(item?.variantOptions?.size || '').trim();
  if (color && size) return `${color} - ${size}`;
  return color || size || 'Mặc định';
}

function toAddressLabel(address?: BackendShippingAddress): string {
  const parts = [
    address?.line1,
    address?.ward,
    address?.district,
    address?.province,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return parts.join(', ');
}

function toEntityId(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (isRecord(value)) {
    const id = value._id || value.id;
    return typeof id === 'string' ? id.trim() : '';
  }
  return '';
}

function mapOrderItem(raw: BackendOrderItem): OrderItem {
  const mode = String(raw?.customization?.prescription?.mode || 'none')
    .trim()
    .toLowerCase();
  const normalizedMode: PrescriptionMode =
    mode === 'manual' || mode === 'upload' ? mode : 'none';
  const prescriptionPayload = raw?.customization?.prescription;
  const rightEye: NonNullable<
    BackendItemCustomization['prescription']
  >['rightEye'] = prescriptionPayload?.rightEye || {};
  const leftEye: NonNullable<
    BackendItemCustomization['prescription']
  >['leftEye'] = prescriptionPayload?.leftEye || {};
  const attachmentUrls = Array.isArray(prescriptionPayload?.attachmentUrls)
    ? prescriptionPayload?.attachmentUrls
        .map((url) => String(url || '').trim())
        .filter(Boolean)
    : [];
  const hasPrescription =
    normalizedMode === 'manual' || normalizedMode === 'upload';
  const productRef = isRecord(raw?.productId)
    ? (raw.productId as BackendProductRef)
    : undefined;
  const variantId = toEntityId(raw?.variantId);
  const matchedVariant = Array.isArray(productRef?.variants)
    ? productRef?.variants.find((variant) => toEntityId(variant) === variantId)
    : undefined;
  const supplier = String(productRef?.fulfillment?.supplier || '').trim();
  const sku = String(matchedVariant?.sku || '').trim();
  const warehouseLocation = String(matchedVariant?.warehouseLocation || '').trim();

  return {
    id: String(raw?._id || '').trim(),
    productId: toEntityId(raw?.productId),
    variantId,
    sku,
    name: String(raw?.name || '').trim() || 'Sản phẩm',
    type: String(raw?.type || '')
      .trim()
      .toLowerCase(),
    quantity: Number(raw?.quantity || 0),
    unitPrice: Number(raw?.unitPrice || 0),
    lineTotal: Number(raw?.lineTotal || 0),
    variant: toVariantLabel(raw),
    supplier,
    warehouseLocation,
    preOrder: Boolean(raw?.preOrder),
    hasPrescription,
    prescriptionMode: normalizedMode,
    orderMadeFromPrescriptionImage: Boolean(
      raw?.customization?.orderMadeFromPrescriptionImage
    ),
    prescription: hasPrescription
      ? {
          mode: normalizedMode,
          isMyopic: Boolean(prescriptionPayload?.isMyopic),
          rightEye: {
            sphere: String(rightEye?.sphere || '').trim(),
            cyl: String(rightEye?.cyl || '').trim(),
            axis: String(rightEye?.axis || '').trim(),
            add: String(rightEye?.add || '').trim(),
          },
          leftEye: {
            sphere: String(leftEye?.sphere || '').trim(),
            cyl: String(leftEye?.cyl || '').trim(),
            axis: String(leftEye?.axis || '').trim(),
            add: String(leftEye?.add || '').trim(),
          },
          pd: String(prescriptionPayload?.pd || '').trim(),
          lensType: String(prescriptionPayload?.lensType || '').trim(),
          coating: String(prescriptionPayload?.coating || '').trim(),
          note: String(prescriptionPayload?.note || '').trim(),
          attachmentUrls,
        }
      : null,
  };
}

function mapBackendOrder(raw: BackendOrder): OrderRecord {
  const id = String(raw._id || raw.id || '').trim();
  const code = String(raw.paymentCode || '').trim() || id;
  const storeId = toEntityId(raw.storeId);
  const storeName =
    isRecord(raw.storeId) && typeof raw.storeId.name === 'string'
      ? raw.storeId.name.trim()
      : '';
  const items = (raw.items || []).map(mapOrderItem);

  return {
    id,
    code,
    storeId,
    storeName,
    status: mapOrderStatus(raw.status),
    rawStatus:
      String(raw.status || '')
        .trim()
        .toLowerCase() || 'pending',
    opsStage: mapOpsStage(raw.opsStage),
    paymentStatus: mapPaymentStatus(raw.paymentStatus, raw.paymentMethod),
    paymentMethod: String(raw.paymentMethod || '')
      .trim()
      .toLowerCase(),
    orderType: String(raw.orderType || '')
      .trim()
      .toLowerCase(),
    customerName:
      String(raw.shippingAddress?.fullName || '').trim() || 'Khách hàng',
    customerPhone: String(raw.shippingAddress?.phone || '').trim(),
    customerAddress: toAddressLabel(raw.shippingAddress),
    items,
    total: Number(raw.total || 0),
    payNowTotal: Number(raw.payNowTotal || 0),
    payLaterTotal: Number(raw.payLaterTotal || 0),
    paidAmount: Number(raw.paidAmount || 0),
    note: String(raw.note || '').trim(),
    createdAt: raw.createdAt,
    shipment: mapShipment(raw.shipment),
    opsExecution: mapOpsExecution(raw.opsExecution),
    refund: mapRefund(raw.refund),
  };
}

function extractOrdersPayload(payload: unknown): {
  rows: BackendOrder[];
  pagination?: BackendEnvelope<unknown>['pagination'];
} {
  if (typeof payload === 'string') {
    throw new Error('Invalid orders response (received string).');
  }

  if (Array.isArray(payload)) {
    return { rows: payload as BackendOrder[] };
  }

  if (!isRecord(payload)) {
    throw new Error('Invalid orders response.');
  }

  const pagination =
    (payload.pagination as BackendEnvelope<unknown>['pagination']) ||
    (isRecord(payload.data)
      ? ((payload.data as any).pagination as any)
      : undefined);

  const dataField = payload.data;
  if (Array.isArray(dataField)) {
    return { rows: dataField as BackendOrder[], pagination };
  }

  if (isRecord(dataField) && Array.isArray((dataField as any).data)) {
    return { rows: (dataField as any).data as BackendOrder[], pagination };
  }

  if (Array.isArray((payload as any).orders)) {
    return { rows: (payload as any).orders as BackendOrder[], pagination };
  }

  throw new Error('Invalid orders response shape.');
}

function extractOrderPayload(payload: unknown): BackendOrder {
  if (typeof payload === 'string') {
    throw new Error('Invalid order response (received string).');
  }

  if (!isRecord(payload)) {
    throw new Error('Invalid order response.');
  }

  const dataField = payload.data;

  if (isRecord(dataField)) {
    return dataField as BackendOrder;
  }

  if (isRecord((payload as any).order)) {
    return (payload as any).order as BackendOrder;
  }

  if (
    typeof (payload as any)._id === 'string' ||
    typeof (payload as any).id === 'string'
  ) {
    return payload as BackendOrder;
  }

  throw new Error('Invalid order response shape.');
}

function extractShippingPayload(payload: unknown): BackendShippingInfo {
  if (typeof payload === 'string') {
    throw new Error('Invalid shipping response (received string).');
  }

  if (!isRecord(payload)) {
    throw new Error('Invalid shipping response.');
  }

  if (isRecord(payload.data)) {
    return payload.data as BackendShippingInfo;
  }

  if (isRecord((payload as any).shipping)) {
    return (payload as any).shipping as BackendShippingInfo;
  }

  if (isRecord(payload)) {
    return payload as BackendShippingInfo;
  }

  throw new Error('Invalid shipping response shape.');
}

function mapShippingInfo(raw: BackendShippingInfo): OrderShippingInfo {
  const roleMatrix = isRecord(raw.roleMatrix)
    ? Object.fromEntries(
        Object.entries(raw.roleMatrix).map(([role, actions]) => [
          String(role || '')
            .trim()
            .toLowerCase(),
          Array.isArray(actions)
            ? actions
                .map((action) =>
                  String(action || '')
                    .trim()
                    .toLowerCase()
                )
                .filter(Boolean)
            : [],
        ])
      )
    : {};

  return {
    orderId: String(raw.orderId || '').trim(),
    orderStatus: String(raw.orderStatus || '')
      .trim()
      .toLowerCase(),
    opsStage: mapOpsStage(raw.opsStage),
    shippingMethod: String(raw.shippingMethod || '')
      .trim()
      .toLowerCase(),
    shipment: mapShipment(raw.shipment),
    currentRole: String(raw.currentRole || '')
      .trim()
      .toLowerCase(),
    permissions: mapShippingPermissions(raw.permissions),
    roleMatrix,
    testMode: Boolean(raw.testMode),
    testStatusOptions: Array.isArray(raw.testStatusOptions)
      ? raw.testStatusOptions
          .map((status) =>
            String(status || '')
              .trim()
              .toLowerCase()
          )
          .filter((status): status is OrderShippingTestStatus =>
            [
              'ready_to_pick',
              'picking',
              'transporting',
              'delivered',
              'returned',
            ].includes(status)
          )
      : [],
  };
}

export const orderApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    opsStage?: string;
    refundStatus?: string;
    userId?: string;
    storeId?: string;
  }): Promise<OrdersResponse> => {
    const response = await apiClient.get('/api/orders', { params });
    const { rows, pagination } = extractOrdersPayload(response.data);

    return {
      orders: rows.map(mapBackendOrder),
      total: pagination?.total ?? rows.length,
      page: pagination?.page ?? (params?.page || 1),
      pageSize: pagination?.limit ?? (params?.limit || rows.length || 10),
    };
  },

  getById: async (id: string): Promise<OrderRecord> => {
    const response = await apiClient.get(`/api/orders/${id}`);
    const raw = extractOrderPayload(response.data);
    return mapBackendOrder(raw);
  },

  getShipping: async (id: string): Promise<OrderShippingInfo> => {
    const response = await apiClient.get(`/api/orders/${id}/shipping`);
    return mapShippingInfo(extractShippingPayload(response.data));
  },

  createShipment: async (id: string): Promise<OrderShippingInfo> => {
    const response = await apiClient.post(`/api/orders/${id}/shipping/create`);
    return mapShippingInfo(extractShippingPayload(response.data));
  },

  syncShipment: async (id: string): Promise<OrderShippingInfo> => {
    const response = await apiClient.post(`/api/orders/${id}/shipping/sync`);
    return mapShippingInfo(extractShippingPayload(response.data));
  },

  updateShipmentTestStatus: async (
    id: string,
    status: OrderShippingTestStatus
  ): Promise<OrderShippingInfo> => {
    const response = await apiClient.post(
      `/api/orders/${id}/shipping/test-status`,
      {
        status,
      }
    );
    return mapShippingInfo(extractShippingPayload(response.data));
  },

  printShipmentLabel: async (id: string): Promise<OrderShippingInfo> => {
    const response = await apiClient.post(
      `/api/orders/${id}/shipping/print-label`
    );
    return mapShippingInfo(extractShippingPayload(response.data));
  },

  cancelShipment: async (id: string): Promise<OrderShippingInfo> => {
    const response = await apiClient.post(`/api/orders/${id}/shipping/cancel`);
    return mapShippingInfo(extractShippingPayload(response.data));
  },

  returnShipment: async (id: string): Promise<OrderShippingInfo> => {
    const response = await apiClient.post(`/api/orders/${id}/shipping/return`);
    return mapShippingInfo(extractShippingPayload(response.data));
  },

  requestDeliveryAgain: async (id: string): Promise<OrderShippingInfo> => {
    const response = await apiClient.post(
      `/api/orders/${id}/shipping/delivery-again`
    );
    return mapShippingInfo(extractShippingPayload(response.data));
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    await apiClient.put(`/api/orders/${id}/status`, { status });
  },

  updateOpsStage: async (
    id: string,
    opsStage: OrderOpsStage
  ): Promise<OrderRecord> => {
    const response = await apiClient.put(`/api/orders/${id}/ops-stage`, {
      opsStage,
    });
    return mapBackendOrder(extractOrderPayload(response.data));
  },

  updateOpsExecution: async (
    id: string,
    payload: OrderOpsExecutionPatch
  ): Promise<OrderRecord> => {
    const response = await apiClient.put(
      `/api/orders/${id}/ops-execution`,
      payload
    );
    return mapBackendOrder(extractOrderPayload(response.data));
  },

  cancel: async (
    id: string,
    payload?: {
      reason?: string;
      contactChannels?: Array<'email' | 'phone'>;
      bankAccount?: {
        bankName?: string;
        accountNumber?: string;
        accountHolder?: string;
        note?: string;
      };
    }
  ): Promise<void> => {
    await apiClient.put(`/api/orders/${id}/cancel`, payload || {});
  },

  createRefundRequest: async (
    id: string,
    payload: {
      reason: string;
      reasonCode?: string;
      requestShippingFee?: boolean;
      customerPaidReturnShippingFee?: number;
      responsibility?: RefundResponsibility;
      requiresReturn?: boolean;
      note?: string;
      requestedBreakdown?: Partial<RefundBreakdown>;
      bankAccount?: {
        bankName?: string;
        accountNumber?: string;
        accountHolder?: string;
        note?: string;
      };
    }
  ): Promise<OrderRecord> => {
    const response = await apiClient.post(
      `/api/orders/${id}/refund-request`,
      payload
    );
    return mapBackendOrder(extractOrderPayload(response.data));
  },

  updateRefund: async (
    id: string,
    payload: {
      action?:
        | 'start_review'
        | 'customer_submit_info'
        | 'request_customer_info'
        | 'approve'
        | 'reject'
        | 'escalate'
        | 'manager_approve'
        | 'manager_reject'
        | 'send_back_to_staff'
        | 'mark_return_pending'
        | 'confirm_return_received'
        | 'inspection_failed'
        | 'start_processing'
        | 'complete';
      status?: RefundStatus;
      responsibility?: RefundResponsibility;
      requiresReturn?: boolean;
      contactNote?: string;
      contactChannels?: Array<'email' | 'phone'>;
      decisionNote?: string;
      note?: string;
      rejectReason?: string;
      escalateReason?: string;
      transactionRef?: string;
      payoutProofUrl?: string;
      inspectionNote?: string;
      returnShipmentCode?: string;
      returnCarrier?: string;
      evidence?: string[];
      approvedBreakdown?: Partial<RefundBreakdown>;
    }
  ): Promise<OrderRecord> => {
    const response = await apiClient.put(`/api/orders/${id}/refund`, payload);
    return mapBackendOrder(extractOrderPayload(response.data));
  },

  overrideRefund: async (
    id: string,
    payload: {
      action:
        | 'reassign_sales'
        | 'reassign_manager'
        | 'reassign_operations'
        | 'reset_reviewing'
        | 'retry_customer_notification';
      reason: string;
    }
  ): Promise<OrderRecord> => {
    const response = await apiClient.post(`/api/orders/${id}/refund-override`, payload);
    return mapBackendOrder(extractOrderPayload(response.data));
  },

  patchItem: async (
    orderId: string,
    itemId: string,
    payload: {
      quantity?: number;
      note?: string;
      customization?: {
        selectedColor?: string;
        selectedSize?: string;
        photochromic?: boolean;
        note?: string;
        prescription?: {
          mode?: PrescriptionMode;
          isMyopic?: boolean;
          rightEye?: {
            sphere?: string;
            cyl?: string;
            axis?: string;
            add?: string;
          };
          leftEye?: {
            sphere?: string;
            cyl?: string;
            axis?: string;
            add?: string;
          };
          pd?: string;
          lensType?: string;
          coating?: string;
          note?: string;
          attachmentUrls?: string[];
        };
      };
    }
  ): Promise<void> => {
    await apiClient.patch(`/api/orders/${orderId}/items/${itemId}`, payload);
  },
};

export default orderApi;
