import apiClient from "./client";
import type { Discount } from "@/data/discountsData";

type PromotionStatus = "active" | "inactive" | "expired" | "scheduled";

export interface PromotionRecord extends Discount {
  cartType?: "all" | "ready_stock" | "pre_order";
  active?: boolean;
}

interface BackendEnvelope<T> {
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface BackendPromotion {
  id?: string;
  _id?: string;
  code?: string;
  name?: string;
  description?: string;
  type?: "percent" | "fixed";
  value?: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount?: number;
  applicableCategories?: string[];
  cartType?: "all" | "ready_stock" | "pre_order";
  status?: PromotionStatus;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapPromotion(raw: BackendPromotion): PromotionRecord {
  return {
    id: raw.id || raw._id || "",
    code: raw.code || "",
    name: raw.name || "",
    description: raw.description || "",
    type: raw.type === "percent" ? "percentage" : "fixed",
    value: Number(raw.value || 0),
    minPurchase: Number(raw.minPurchase || 0),
    maxDiscount: Number(raw.maxDiscount || 0),
    startDate: raw.startDate || "",
    endDate: raw.endDate || "",
    usageLimit: Number(raw.usageLimit || 0),
    usageCount: Number(raw.usageCount || 0),
    applicableCategories: Array.isArray(raw.applicableCategories)
      ? raw.applicableCategories
      : ["all"],
    status: (raw.status || "inactive") as PromotionStatus,
    createdAt: raw.createdAt || "",
    updatedAt: raw.updatedAt || "",
    cartType: raw.cartType || "all",
    active: raw.active,
  };
}

function extractRows(payload: unknown): {
  rows: BackendPromotion[];
  pagination?: BackendEnvelope<unknown>["pagination"];
} {
  if (Array.isArray(payload)) {
    return { rows: payload as BackendPromotion[] };
  }

  if (!isRecord(payload)) {
    return { rows: [] };
  }

  const pagination = payload.pagination as BackendEnvelope<unknown>["pagination"];
  const dataField = payload.data;

  if (Array.isArray(dataField)) {
    return { rows: dataField as BackendPromotion[], pagination };
  }

  return { rows: [], pagination };
}

function extractOne(payload: unknown): BackendPromotion {
  if (isRecord(payload) && isRecord((payload as any).data)) {
    return (payload as any).data as BackendPromotion;
  }

  return (payload || {}) as BackendPromotion;
}

export const promotionApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }) {
    const response = await apiClient.get("/api/promotions", { params });
    const { rows, pagination } = extractRows(response.data);

    return {
      discounts: rows.map(mapPromotion),
      total: pagination?.total ?? rows.length,
      page: pagination?.page ?? params?.page ?? 1,
      pageSize: pagination?.limit ?? params?.limit ?? rows.length,
    };
  },

  async getById(id: string) {
    const response = await apiClient.get(`/api/promotions/${id}`);
    return mapPromotion(extractOne(response.data));
  },

  async create(input: Record<string, unknown>) {
    const response = await apiClient.post("/api/promotions", input);
    return mapPromotion(extractOne(response.data));
  },

  async update(id: string, input: Record<string, unknown>) {
    const response = await apiClient.put(`/api/promotions/${id}`, input);
    return mapPromotion(extractOne(response.data));
  },

  async remove(id: string) {
    await apiClient.delete(`/api/promotions/${id}`);
  },
};

export default promotionApi;
