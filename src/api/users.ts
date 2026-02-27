import apiClient from './client';

export type UserRole = 'customer' | 'staff' | 'manager' | 'admin' | string;

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
  }): Promise<UsersResponse> => {
    const response = await apiClient.get('/api/users', { params });
    const { rows, pagination } = extractUsersPayload(response.data);

    return {
      users: rows.map(mapBackendUser),
      total: pagination?.total ?? rows.length,
      page: pagination?.page ?? (params?.page || 1),
      pageSize: pagination?.limit ?? (params?.limit || rows.length || 10),
    };
  },
};

export default userApi;

