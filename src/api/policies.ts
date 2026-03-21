import apiClient from "./client";
import type { Policy } from "@/data/policiesData";

export interface PolicyRecord extends Policy {}

interface BackendEnvelope<T> {
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface BackendPolicy {
  id?: string;
  _id?: string;
  title?: string;
  category?: Policy["category"];
  summary?: string;
  content?: string;
  effectiveDate?: string;
  expiryDate?: string | null;
  status?: Policy["status"];
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapPolicy(raw: BackendPolicy): PolicyRecord {
  return {
    id: raw.id || raw._id || "",
    title: raw.title || "",
    category: (raw.category || "warranty") as Policy["category"],
    summary: raw.summary || "",
    content: raw.content || "",
    effectiveDate: raw.effectiveDate || "",
    expiryDate: raw.expiryDate || undefined,
    status: (raw.status || "draft") as Policy["status"],
    version: raw.version || "1.0",
    createdAt: raw.createdAt || "",
    updatedAt: raw.updatedAt || "",
    createdBy: raw.createdBy || "",
  };
}

function extractRows(payload: unknown): {
  rows: BackendPolicy[];
  pagination?: BackendEnvelope<unknown>["pagination"];
} {
  if (Array.isArray(payload)) {
    return { rows: payload as BackendPolicy[] };
  }

  if (!isRecord(payload)) {
    return { rows: [] };
  }

  const pagination = payload.pagination as BackendEnvelope<unknown>["pagination"];
  const dataField = payload.data;

  if (Array.isArray(dataField)) {
    return { rows: dataField as BackendPolicy[], pagination };
  }

  return { rows: [], pagination };
}

function extractOne(payload: unknown): BackendPolicy {
  if (isRecord(payload) && isRecord((payload as any).data)) {
    return (payload as any).data as BackendPolicy;
  }

  return (payload || {}) as BackendPolicy;
}

export const policyApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }) {
    const response = await apiClient.get("/api/policies", { params });
    const { rows, pagination } = extractRows(response.data);

    return {
      policies: rows.map(mapPolicy),
      total: pagination?.total ?? rows.length,
      page: pagination?.page ?? params?.page ?? 1,
      pageSize: pagination?.limit ?? params?.limit ?? rows.length,
    };
  },

  async getById(id: string) {
    const response = await apiClient.get(`/api/policies/${id}`);
    return mapPolicy(extractOne(response.data));
  },

  async create(input: Record<string, unknown>) {
    const response = await apiClient.post("/api/policies", input);
    return mapPolicy(extractOne(response.data));
  },

  async update(id: string, input: Record<string, unknown>) {
    const response = await apiClient.put(`/api/policies/${id}`, input);
    return mapPolicy(extractOne(response.data));
  },

  async remove(id: string) {
    await apiClient.delete(`/api/policies/${id}`);
  },
};

export default policyApi;
