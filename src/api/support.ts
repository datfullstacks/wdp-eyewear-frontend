import apiClient from './client';
import type { RefundRequest } from '@/types/refund';
import { formatDateTime } from '@/types/refund';

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

export type SupportTicketCategory =
  | 'general'
  | 'order'
  | 'prescription'
  | 'shipping'
  | 'refund'
  | 'return'
  | 'warranty';

export type SupportTicketStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'requested'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'in_service'
  | 'completed';

export type SupportPriority = 'low' | 'normal' | 'high';
export type SupportMessageSender = 'user' | 'staff';
export type SupportAttachmentType = 'image' | 'video';
export type WarrantyEligibility = 'eligible' | 'expired' | 'not_covered';
export type SupportTicketOwnerRole =
  | 'none'
  | 'customer'
  | 'sales'
  | 'operations'
  | 'manager';

interface RawSupportAttachment {
  _id?: string;
  url?: string;
  type?: SupportAttachmentType;
  mimeType?: string;
  name?: string;
  path?: string;
  size?: number | string | null;
}

interface RawSupportMessage {
  _id?: string;
  sender?: SupportMessageSender;
  message?: string;
  attachments?: RawSupportAttachment[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface RawSupportRef {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  paymentCode?: string;
  status?: string;
  orderType?: string;
  total?: number;
  storeId?: string | null;
  userId?: string | null;
  createdAt?: string | null;
  code?: string;
  type?: string;
  city?: string;
  district?: string;
}

interface RawWarrantyMetadata {
  orderItemId?: string | null;
  productId?: string | null;
  variantId?: string | null;
  itemName?: string;
  warrantyMonths?: number;
  referenceDate?: string | null;
  expiresAt?: string | null;
  eligibility?: WarrantyEligibility;
  decisionNote?: string;
  serviceNote?: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  completedBy?: string | null;
  completedAt?: string | null;
  serviceOrder?: RawWarrantyServiceOrder | null;
}

interface RawWarrantyServiceOrder {
  code?: string;
  status?: 'created' | 'in_service' | 'completed' | 'cancelled';
  note?: string;
  createdBy?: RawSupportRef | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface RawSupportTicket {
  _id?: string;
  id?: string;
  userId?: RawSupportRef | string | null;
  email?: string;
  subject?: string;
  category?: SupportTicketCategory;
  status?: SupportTicketStatus;
  priority?: SupportPriority;
  orderId?: RawSupportRef | string | null;
  storeId?: RawSupportRef | string | null;
  warranty?: RawWarrantyMetadata | null;
  currentOwnerRole?: SupportTicketOwnerRole;
  currentOwnerUserId?: RawSupportRef | string | null;
  nextActionCode?: string;
  messages?: RawSupportMessage[];
  lastMessageAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface SupportRefundCase {
  orderInternalId: string;
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  reason: string;
  method: RefundRequest['method'];
  paymentMethod: string;
  status: RefundRequest['status'];
  createdAt?: string | null;
  processedAt?: string | null;
  bankInfo?: RefundRequest['bankInfo'];
  notes?: string;
  responsibility?: RefundRequest['responsibility'];
  requiresReturn: boolean;
  requestedBreakdown: RefundRequest['requestedBreakdown'];
  approvedBreakdown: RefundRequest['approvedBreakdown'];
  rejectReason: string;
  decisionNote: string;
  escalateReason: string;
  currentOwnerRole: string;
  currentOwnerUserId?: string;
  nextActionCode: string;
  inspectionStatus: RefundRequest['inspectionStatus'];
  inspectionNote: string;
  inspectionAt?: string | null;
  returnShipmentCode: string;
  returnCarrier: string;
  returnReceivedAt?: string | null;
  transactionRef: string;
  payoutProofUrl: string;
  evidence: string[];
  history: RefundRequest['history'];
}

export interface SupportMessageRecord {
  id: string;
  sender: SupportMessageSender;
  message: string;
  attachments: SupportAttachmentRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportAttachmentRecord {
  id: string;
  url: string;
  type: SupportAttachmentType;
  mimeType: string;
  name: string;
  path: string;
  size: number | null;
}

export interface SupportUserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface SupportOrderSummary {
  id: string;
  paymentCode: string;
  status: string;
  orderType: string;
  total: number;
  storeId: string | null;
  userId: string | null;
  createdAt?: string;
}

export interface SupportStoreSummary {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  city: string;
  district: string;
}

export interface SupportWarrantyMetadata {
  orderItemId: string | null;
  productId: string | null;
  variantId: string | null;
  itemName: string;
  warrantyMonths: number;
  referenceDate?: string;
  expiresAt?: string;
  eligibility: WarrantyEligibility;
  decisionNote: string;
  serviceNote: string;
  approvedBy: string | null;
  approvedAt?: string;
  completedBy: string | null;
  completedAt?: string;
  serviceOrder: SupportWarrantyServiceOrder | null;
}

export interface SupportWarrantyServiceOrder {
  code: string;
  status: 'created' | 'in_service' | 'completed' | 'cancelled';
  note: string;
  createdBy: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportTicketRecord {
  id: string;
  user: SupportUserSummary | null;
  email: string;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  priority: SupportPriority;
  orderId: string | null;
  order: SupportOrderSummary | null;
  storeId: string | null;
  store: SupportStoreSummary | null;
  warranty: SupportWarrantyMetadata | null;
  currentOwnerRole: SupportTicketOwnerRole;
  currentOwnerUserId: string | null;
  nextActionCode: string;
  messages: SupportMessageRecord[];
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportTicketsResponse {
  items: SupportTicketRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SupportRefundCasesResponse {
  items: RefundRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListSupportTicketsParams {
  page?: number;
  limit?: number;
  status?: string;
  ownerRole?: SupportTicketOwnerRole;
  userId?: string;
  category?: SupportTicketCategory;
  eligibility?: WarrantyEligibility;
  q?: string;
  orderId?: string;
}

export interface CreateSupportTicketInput {
  subject: string;
  message: string;
  email?: string;
  category?: SupportTicketCategory;
  priority?: SupportPriority;
  orderId?: string;
  orderItemId?: string;
  storeId?: string;
}

export interface UpdateSupportTicketStatusInput {
  status: SupportTicketStatus;
  note?: string;
  decisionNote?: string;
  serviceNote?: string;
}

export interface CreateWarrantyOrderInput {
  note?: string;
  decisionNote?: string;
  serviceNote?: string;
}

export interface CreateWarrantyRefundInput {
  note?: string;
  decisionNote?: string;
  serviceNote?: string;
}

function toId(value?: string | { _id?: string; id?: string } | null): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value._id || value.id || '');
}

function toSupportAttachment(
  raw?: RawSupportAttachment | null
): SupportAttachmentRecord | null {
  if (!raw) return null;

  const url = String(raw.url || '').trim();
  if (!url) return null;

  const normalizedType =
    raw.type === 'video' ? 'video' : 'image';
  const normalizedSize = Number(raw.size);

  return {
    id: String(raw._id || raw.url || Math.random()),
    url,
    type: normalizedType,
    mimeType: String(raw.mimeType || ''),
    name: String(raw.name || ''),
    path: String(raw.path || ''),
    size:
      Number.isFinite(normalizedSize) && normalizedSize >= 0
        ? normalizedSize
        : null,
  };
}

function toSupportMessage(raw: RawSupportMessage): SupportMessageRecord {
  return {
    id: String(raw._id || raw.createdAt || Math.random()),
    sender: raw.sender === 'staff' ? 'staff' : 'user',
    message: String(raw.message || ''),
    attachments: Array.isArray(raw.attachments)
      ? raw.attachments
          .map(toSupportAttachment)
          .filter((value): value is SupportAttachmentRecord => value !== null)
      : [],
    createdAt: raw.createdAt || undefined,
    updatedAt: raw.updatedAt || undefined,
  };
}

function toSupportUser(
  raw?: RawSupportRef | string | null
): SupportUserSummary | null {
  if (!raw || typeof raw === 'string') return null;
  return {
    id: toId(raw),
    name: String(raw.name || ''),
    email: String(raw.email || ''),
    role: String(raw.role || ''),
  };
}

function toSupportOrder(
  raw?: RawSupportRef | string | null
): SupportOrderSummary | null {
  if (!raw || typeof raw === 'string') return null;
  return {
    id: toId(raw),
    paymentCode: String(raw.paymentCode || ''),
    status: String(raw.status || ''),
    orderType: String(raw.orderType || ''),
    total: Number(raw.total || 0),
    storeId: raw.storeId ? String(raw.storeId) : null,
    userId: raw.userId ? String(raw.userId) : null,
    createdAt: raw.createdAt || undefined,
  };
}

function toSupportStore(
  raw?: RawSupportRef | string | null
): SupportStoreSummary | null {
  if (!raw || typeof raw === 'string') return null;
  return {
    id: toId(raw),
    name: String(raw.name || ''),
    code: String(raw.code || ''),
    type: String(raw.type || ''),
    status: String(raw.status || ''),
    city: String(raw.city || ''),
    district: String(raw.district || ''),
  };
}

function toWarrantyMetadata(
  raw?: RawWarrantyMetadata | null
): SupportWarrantyMetadata | null {
  if (!raw) return null;
  return {
    orderItemId: raw.orderItemId ? String(raw.orderItemId) : null,
    productId: raw.productId ? String(raw.productId) : null,
    variantId: raw.variantId ? String(raw.variantId) : null,
    itemName: String(raw.itemName || ''),
    warrantyMonths: Number(raw.warrantyMonths || 0),
    referenceDate: raw.referenceDate || undefined,
    expiresAt: raw.expiresAt || undefined,
    eligibility: raw.eligibility || 'not_covered',
    decisionNote: String(raw.decisionNote || ''),
    serviceNote: String(raw.serviceNote || ''),
    approvedBy: raw.approvedBy ? String(raw.approvedBy) : null,
    approvedAt: raw.approvedAt || undefined,
    completedBy: raw.completedBy ? String(raw.completedBy) : null,
    completedAt: raw.completedAt || undefined,
    serviceOrder: toWarrantyServiceOrder(raw.serviceOrder),
  };
}

function toWarrantyServiceOrder(
  raw?: RawWarrantyServiceOrder | null
): SupportWarrantyServiceOrder | null {
  if (!raw) return null;

  const code = String(raw.code || '').trim();
  if (!code) return null;

  const status =
    raw.status === 'in_service' ||
    raw.status === 'completed' ||
    raw.status === 'cancelled'
      ? raw.status
      : 'created';

  return {
    code,
    status,
    note: String(raw.note || ''),
    createdBy: toId(raw.createdBy) || null,
    createdAt: raw.createdAt || undefined,
    updatedAt: raw.updatedAt || undefined,
  };
}

function mapSupportTicket(raw: RawSupportTicket): SupportTicketRecord {
  const orderId =
    raw.orderId && typeof raw.orderId !== 'string'
      ? toId(raw.orderId)
      : toId(raw.orderId);
  const storeId =
    raw.storeId && typeof raw.storeId !== 'string'
      ? toId(raw.storeId)
      : toId(raw.storeId);

  return {
    id: toId(raw) || String(raw.subject || raw.createdAt || Math.random()),
    user: toSupportUser(raw.userId),
    email: String(raw.email || ''),
    subject: String(raw.subject || ''),
    category: (raw.category || 'general') as SupportTicketCategory,
    status: (raw.status || 'open') as SupportTicketStatus,
    priority: (raw.priority || 'normal') as SupportPriority,
    orderId: orderId || null,
    order: toSupportOrder(raw.orderId),
    storeId: storeId || null,
    store: toSupportStore(raw.storeId),
    warranty: toWarrantyMetadata(raw.warranty),
    currentOwnerRole: (raw.currentOwnerRole ||
      'none') as SupportTicketOwnerRole,
    currentOwnerUserId: toId(raw.currentOwnerUserId) || null,
    nextActionCode: String(raw.nextActionCode || ''),
    messages: Array.isArray(raw.messages)
      ? raw.messages.map(toSupportMessage)
      : [],
    lastMessageAt: raw.lastMessageAt || undefined,
    createdAt: raw.createdAt || undefined,
    updatedAt: raw.updatedAt || undefined,
  };
}

function mapSupportRefundCase(raw: SupportRefundCase): RefundRequest {
  return {
    orderInternalId: raw.orderInternalId,
    id: raw.id,
    orderId: raw.orderId,
    customerName: raw.customerName,
    customerPhone: raw.customerPhone,
    amount: Number(raw.amount || 0),
    reason: raw.reason,
    method: raw.method,
    paymentMethod: raw.paymentMethod,
    status: raw.status,
    createdAt: formatDateTime(raw.createdAt || undefined),
    createdAtRaw: raw.createdAt || undefined,
    processedAt: formatDateTime(raw.processedAt || undefined),
    processedAtRaw: raw.processedAt || undefined,
    bankInfo: raw.bankInfo,
    notes: raw.notes,
    responsibility: raw.responsibility,
    requiresReturn: Boolean(raw.requiresReturn),
    requestedBreakdown: raw.requestedBreakdown,
    approvedBreakdown: raw.approvedBreakdown,
    rejectReason: raw.rejectReason,
    decisionNote: raw.decisionNote,
    escalateReason: raw.escalateReason,
    currentOwnerRole: raw.currentOwnerRole,
    currentOwnerUserId: raw.currentOwnerUserId,
    nextActionCode: raw.nextActionCode,
    inspectionStatus: raw.inspectionStatus,
    inspectionNote: raw.inspectionNote,
    inspectionAt: raw.inspectionAt || undefined,
    returnShipmentCode: raw.returnShipmentCode,
    returnCarrier: raw.returnCarrier,
    returnReceivedAt: raw.returnReceivedAt || undefined,
    transactionRef: raw.transactionRef,
    payoutProofUrl: raw.payoutProofUrl,
    evidence: Array.isArray(raw.evidence) ? raw.evidence : [],
    history: Array.isArray(raw.history) ? raw.history : [],
  };
}

function toPagination<T>(
  payload: BackendEnvelope<T>,
  params?: { page?: number; limit?: number },
  fallbackLength = 0
) {
  return {
    page: payload?.pagination?.page || params?.page || 1,
    limit: payload?.pagination?.limit || params?.limit || fallbackLength || 20,
    total: payload?.pagination?.total || fallbackLength,
    totalPages: payload?.pagination?.totalPages || 1,
  };
}

function normalizeSupportListParams<
  T extends { page?: number; limit?: number },
>(params?: T): T | undefined {
  if (!params) return undefined;

  const normalizedLimit = Number(params.limit);
  return {
    ...params,
    limit:
      Number.isFinite(normalizedLimit) && normalizedLimit > 0
        ? Math.min(normalizedLimit, 100)
        : params.limit,
  };
}

const supportApi = {
  async getTickets(
    params?: ListSupportTicketsParams
  ): Promise<SupportTicketsResponse> {
    const requestParams = normalizeSupportListParams(params);
    const { data } = await apiClient.get<BackendEnvelope<RawSupportTicket[]>>(
      '/api/support',
      { params: requestParams }
    );

    const rows = Array.isArray(data?.data) ? data.data : [];

    return {
      items: rows.map(mapSupportTicket),
      pagination: toPagination(data || {}, requestParams, rows.length),
    };
  },

  async getWarrantyCases(
    params?: Omit<ListSupportTicketsParams, 'category'>
  ): Promise<SupportTicketsResponse> {
    const requestParams = normalizeSupportListParams(params);
    const { data } = await apiClient.get<BackendEnvelope<RawSupportTicket[]>>(
      '/api/support/warranties',
      { params: requestParams }
    );

    const rows = Array.isArray(data?.data) ? data.data : [];

    return {
      items: rows.map(mapSupportTicket),
      pagination: toPagination(data || {}, requestParams, rows.length),
    };
  },

  async getTicket(id: string): Promise<SupportTicketRecord> {
    const { data } = await apiClient.get<BackendEnvelope<RawSupportTicket>>(
      `/api/support/${id}`
    );

    return mapSupportTicket((data?.data || {}) as RawSupportTicket);
  },

  async createTicket(
    payload: CreateSupportTicketInput
  ): Promise<SupportTicketRecord> {
    const { data } = await apiClient.post<BackendEnvelope<RawSupportTicket>>(
      '/api/support',
      payload
    );

    return mapSupportTicket((data?.data || {}) as RawSupportTicket);
  },

  async replyTicket(
    id: string,
    payload: { message: string; attachments?: RawSupportAttachment[] }
  ): Promise<SupportTicketRecord> {
    const { data } = await apiClient.post<BackendEnvelope<RawSupportTicket>>(
      `/api/support/${id}/replies`,
      payload
    );

    return mapSupportTicket((data?.data || {}) as RawSupportTicket);
  },

  async updateTicketStatus(
    id: string,
    payload: UpdateSupportTicketStatusInput
  ): Promise<SupportTicketRecord> {
    const { data } = await apiClient.put<BackendEnvelope<RawSupportTicket>>(
      `/api/support/${id}/status`,
      payload
    );

    return mapSupportTicket((data?.data || {}) as RawSupportTicket);
  },

  async createWarrantyOrder(
    id: string,
    payload: CreateWarrantyOrderInput = {}
  ): Promise<SupportTicketRecord> {
    const { data } = await apiClient.post<BackendEnvelope<RawSupportTicket>>(
      `/api/support/${id}/warranty-order`,
      payload
    );

    return mapSupportTicket((data?.data || {}) as RawSupportTicket);
  },

  async createWarrantyRefund(
    id: string,
    payload: CreateWarrantyRefundInput = {}
  ): Promise<SupportTicketRecord> {
    const { data } = await apiClient.post<BackendEnvelope<RawSupportTicket>>(
      `/api/support/${id}/warranty-refund`,
      payload
    );

    return mapSupportTicket((data?.data || {}) as RawSupportTicket);
  },

  async getRefundCases(params?: {
    page?: number;
    limit?: number;
    status?: string;
    ownerRole?: string;
    q?: string;
  }): Promise<SupportRefundCasesResponse> {
    const requestParams = normalizeSupportListParams(params);
    const { data } = await apiClient.get<BackendEnvelope<SupportRefundCase[]>>(
      '/api/support/refunds',
      {
        params: requestParams,
      }
    );

    const rows = Array.isArray(data?.data) ? data.data : [];

    return {
      items: rows.map(mapSupportRefundCase),
      pagination: toPagination(data || {}, requestParams, rows.length),
    };
  },
};

export default supportApi;
