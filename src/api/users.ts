import apiClient from './client';
import {
  toBackendRole as mapToBackendRole,
  toFrontendRole as mapToFrontendRole,
} from '@/lib/roles';

/**
 * Backend roles: customer, sales, operations, manager, admin
 * Frontend mapping: staff -> sales, operation -> operations
 */
export type UserRole = 'customer' | 'sales' | 'operations' | 'manager' | 'admin' | string;

/** Map frontend display role to backend API role */
export function toBackendRole(frontendRole: string): string {
  return mapToBackendRole(frontendRole);
}

/** Map backend role to frontend display role */
export function toFrontendRole(backendRole: string): string {
  return mapToFrontendRole(backendRole);
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

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

interface BackendAddress {
  line1?: string;
  ward?: string;
  wardCode?: string;
  district?: string;
  districtId?: number;
  province?: string;
  provinceId?: number;
  phone?: string;
  isDefault?: boolean;
}

interface BackendUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  provider?: string;
  avatar?: string;
  addresses?: BackendAddress[];
  createdAt?: string;
  updatedAt?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractUsersPayload(
  payload: unknown
): { rows: BackendUser[]; pagination?: BackendEnvelope<unknown>['pagination'] } {
  if (typeof payload === 'string') {
    throw new Error('Invalid users response (received string).');
  }

  if (Array.isArray(payload)) {
    return { rows: payload as BackendUser[] };
  }

  if (!isRecord(payload)) {
    throw new Error('Invalid users response.');
  }

  const pagination =
    (payload.pagination as BackendEnvelope<unknown>['pagination']) ||
    (isRecord(payload.data) ? ((payload.data as any).pagination as any) : undefined);

  const dataField = payload.data;
  if (Array.isArray(dataField)) {
    return { rows: dataField as BackendUser[], pagination };
  }

  if (isRecord(dataField) && Array.isArray((dataField as any).data)) {
    return { rows: (dataField as any).data as BackendUser[], pagination };
  }

  if (Array.isArray((payload as any).users)) {
    return { rows: (payload as any).users as BackendUser[], pagination };
  }

  throw new Error('Invalid users response shape.');
}

function resolvePhone(raw?: BackendUser): string | undefined {
  const addresses = raw?.addresses || [];
  const defaultAddress = addresses.find((a) => a?.isDefault);
  return defaultAddress?.phone || addresses[0]?.phone;
}

function mapBackendUser(raw: BackendUser): User {
  const id = raw._id || raw.id || '';
  return {
    id,
    name: raw.name || '',
    email: raw.email || '',
    role: raw.role || 'customer',
    provider: raw.provider,
    avatarUrl: raw.avatar,
    phone: resolvePhone(raw),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const userApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<UsersResponse> => {
    // Map frontend business roles to backend API roles
    const apiParams = params ? { ...params } : undefined;
    if (apiParams?.role) {
      apiParams.role = toBackendRole(apiParams.role);
    }
    const response = await apiClient.get('/api/users', { params: apiParams });
    const { rows, pagination } = extractUsersPayload(response.data);

    return {
      users: rows.map(mapBackendUser),
      total: pagination?.total ?? rows.length,
      page: pagination?.page ?? (params?.page || 1),
      pageSize: pagination?.limit ?? (params?.limit || rows.length || 10),
    };
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/api/users/${id}`);
    const payload = response.data;
    const raw = isRecord(payload) && isRecord((payload as any).data)
      ? (payload as any).data as BackendUser
      : payload as BackendUser;
    return mapBackendUser(raw);
  },

  create: async (input: CreateUserInput): Promise<User> => {
    const body = {
      name: input.name,
      email: input.email,
      password: input.password,
      role: toBackendRole(input.role),
      ...(input.phone ? { phone: input.phone } : {}),
    };
    const { data } = await apiClient.post('/api/users', body);
    const raw = isRecord(data) && isRecord((data as any).data)
      ? (data as any).data as BackendUser
      : data as BackendUser;
    return mapBackendUser(raw);
  },

  update: async (id: string, input: UpdateUserInput): Promise<User> => {
    const body: Record<string, unknown> = {};
    if (input.name) body.name = input.name;
    if (input.email) body.email = input.email;
    if (input.phone) body.phone = input.phone;
    if (input.role) body.role = toBackendRole(input.role);
    const { data } = await apiClient.put(`/api/users/${id}`, body);
    const raw = isRecord(data) && isRecord((data as any).data)
      ? (data as any).data as BackendUser
      : data as BackendUser;
    return mapBackendUser(raw);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/users/${id}`);
  },
};

export default userApi;

