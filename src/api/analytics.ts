import apiClient from "./client";

export interface ManagerOverview {
  monthlyRevenue: number;
  monthlyOrders: number;
  collectedThisMonth: number;
  totalOrders: number;
  cancelledOrders: number;
  activeProducts: number;
  activeCustomers: number;
  activePromotions: number;
  monthOverMonthGrowth: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  collected: number;
  orders: number;
}

export interface RevenueGroup {
  type?: string;
  method?: string;
  revenue: number;
  orders: number;
  payNow?: number;
  payLater?: number;
}

export interface RevenueSummary {
  summary: {
    monthlyRevenue: number;
    monthlyOrders: number;
    monthlyCollected: number;
    growth: number;
    yearlyRevenue: number;
  };
  monthly: RevenuePoint[];
  byOrderType: RevenueGroup[];
  byPaymentMethod: RevenueGroup[];
}

export interface RefundOwnerBucket {
  owner: string;
  count: number;
}

export interface RefundStatusBucket {
  status: string;
  count: number;
}

export interface RefundOpsCase {
  orderId: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  orderStatus: string;
  paymentStatus: string;
  refundStatus: string;
  currentOwnerRole: string;
  nextActionCode: string;
  paidAmount: number;
  requestedAmount: number;
  approvedAmount: number;
  settledAmount: number;
  invoiceStatus: string;
  transactionRef: string;
  payoutProofUrl: string;
  requiresReturn: boolean;
  updatedAt: string;
  ageHours: number;
  requiresAttention: boolean;
  attentionReason: string;
}

export interface AdminRefundOverview {
  summary: {
    totalCases: number;
    activeCases: number;
    waitingCustomer: number;
    escalated: number;
    payoutPending: number;
    flaggedCases: number;
    completedThisMonth: number;
    rejectedThisMonth: number;
  };
  filters: {
    status: string;
    ownerRole: string;
    q: string;
    attentionOnly: boolean;
    from: string | null;
    to: string | null;
  };
  byStatus: RefundStatusBucket[];
  byOwner: RefundOwnerBucket[];
  flaggedCases: RefundOpsCase[];
  recentCompleted: RefundOpsCase[];
}

export interface RefundReconciliationRow extends RefundOpsCase {
  discrepancyAmount: number;
  refundReason: string;
  invoiceCode: string;
  invoiceAmountDue: number;
  processedAt?: string | null;
  matchStatus: 'matched' | 'awaiting_payout' | 'mismatch' | 'pending' | 'closed';
}

export interface RefundReconciliation {
  summary: {
    requestedTotal: number;
    approvedTotal: number;
    settledTotal: number;
    totalPaidAmount: number;
    outstandingTotal: number;
    mismatchedCases: number;
    awaitingPayoutCases: number;
  };
  filters: {
    status: string;
    ownerRole: string;
    matchStatus: string;
    q: string;
    attentionOnly?: boolean;
    hasProof?: boolean;
    from: string | null;
    to: string | null;
  };
  rows: RefundReconciliationRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RefundAuditRow {
  id: string;
  orderId: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  refundStatus: string;
  currentOwnerRole: string;
  nextActionCode: string;
  action: string;
  actorRole: string;
  actorName: string;
  fromStatus: string;
  toStatus: string;
  note: string;
  createdAt?: string | null;
  transactionRef: string;
  attentionReason: string;
}

export interface RefundAuditBucket {
  action?: string;
  role?: string;
  count: number;
}

export interface RefundAuditTrail {
  summary: {
    totalEvents: number;
    uniqueOrders: number;
  };
  filters: {
    status: string;
    ownerRole: string;
    actorRole: string;
    action: string;
    q: string;
    from: string | null;
    to: string | null;
  };
  byAction: Array<{ action: string; count: number }>;
  byActorRole: Array<{ role: string; count: number }>;
  rows: RefundAuditRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminRefundFilters {
  status?: string;
  ownerRole?: string;
  q?: string;
  attentionOnly?: boolean;
  from?: string;
  to?: string;
}

export interface RefundReconciliationFilters extends AdminRefundFilters {
  matchStatus?: string;
  hasProof?: boolean;
}

export interface RefundAuditFilters extends AdminRefundFilters {
  action?: string;
  actorRole?: string;
}

function extractData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && (payload as any).data) {
    return (payload as any).data as T;
  }

  return payload as T;
}

export const analyticsApi = {
  async getManagerOverview() {
    const response = await apiClient.get("/api/analytics/manager/overview");
    return extractData<ManagerOverview>(response.data);
  },

  async getRevenueSummary() {
    const response = await apiClient.get("/api/analytics/manager/revenue");
    return extractData<RevenueSummary>(response.data);
  },

  async getAdminRefundOverview(limit = 8, filters?: AdminRefundFilters) {
    const response = await apiClient.get("/api/analytics/admin/refunds/overview", {
      params: { limit, ...filters },
    });
    return extractData<AdminRefundOverview>(response.data);
  },

  async getRefundReconciliation(
    page = 1,
    limit = 20,
    filters?: RefundReconciliationFilters,
  ) {
    const response = await apiClient.get(
      "/api/analytics/admin/refunds/reconciliation",
      {
        params: { page, limit, ...filters },
      },
    );
    return extractData<RefundReconciliation>(response.data);
  },

  async exportRefundReconciliation(filters?: RefundReconciliationFilters) {
    const response = await apiClient.get(
      "/api/analytics/admin/refunds/reconciliation/export",
      {
        params: filters,
        responseType: "blob",
      },
    );
    return response.data as Blob;
  },

  async getRefundAudit(
    page = 1,
    limit = 20,
    filters?: RefundAuditFilters,
  ) {
    const response = await apiClient.get("/api/analytics/admin/refunds/audit", {
      params: { page, limit, ...filters },
    });
    return extractData<RefundAuditTrail>(response.data);
  },
};

export default analyticsApi;
