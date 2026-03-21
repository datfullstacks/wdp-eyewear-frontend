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

export interface SupportRefundCasesResponse {
  items: RefundRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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

const supportApi = {
  async getRefundCases(params?: {
    page?: number;
    limit?: number;
    status?: string;
    ownerRole?: string;
    q?: string;
  }): Promise<SupportRefundCasesResponse> {
    const { data } = await apiClient.get<BackendEnvelope<SupportRefundCase[]>>(
      '/api/support/refunds',
      {
        params,
      },
    );

    const rows = Array.isArray(data?.data) ? data.data : [];

    return {
      items: rows.map(mapSupportRefundCase),
      pagination: {
        page: data?.pagination?.page || params?.page || 1,
        limit: data?.pagination?.limit || params?.limit || rows.length || 20,
        total: data?.pagination?.total || rows.length,
        totalPages: data?.pagination?.totalPages || 1,
      },
    };
  },
};

export default supportApi;
