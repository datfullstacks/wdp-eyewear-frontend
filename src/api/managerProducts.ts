import apiClient from './client';
import type {
  Product,
  ProductListResponse,
  UpdateProductPayload,
  UploadResponse,
} from '@/types/managerProduct';

interface BackendEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractRows(payload: unknown): Product[] {
  if (Array.isArray(payload)) return payload as Product[];
  if (!isRecord(payload)) return [];

  if (Array.isArray(payload.data)) return payload.data as Product[];
  if (isRecord(payload.data) && Array.isArray((payload.data as any).data)) {
    return (payload.data as any).data as Product[];
  }
  if (Array.isArray((payload as any).products)) {
    return (payload as any).products as Product[];
  }

  return [];
}

function extractPagination(payload: unknown): {
  page: number;
  pageSize: number;
  total: number;
} {
  if (!isRecord(payload)) return { page: 1, pageSize: 100, total: 0 };

  const pagination =
    (payload.pagination as BackendEnvelope<unknown>['pagination']) ||
    (isRecord(payload.data) ? ((payload.data as any).pagination as any) : undefined);

  return {
    page: Number(pagination?.page || 1),
    pageSize: Number(pagination?.limit || 100),
    total: Number(pagination?.total || 0),
  };
}

function normalizeProduct(raw: Product): Product {
  return {
    ...raw,
    _id: raw._id || raw.id || '',
    id: raw.id || raw._id || '',
    variants: raw.variants || [],
    media: raw.media || { assets: [] },
  };
}

function cleanForUpdate(payload: UpdateProductPayload): UpdateProductPayload {
  const cleanedVariants = (payload.variants || []).map((variant) => ({
    ...(variant._id ? { _id: variant._id } : {}),
    ...(variant.sku ? { sku: variant.sku } : {}),
    ...(variant.barcode ? { barcode: variant.barcode } : {}),
    options: {
      ...(variant.options?.color ? { color: variant.options.color } : {}),
      ...(variant.options?.size ? { size: variant.options.size } : {}),
    },
    ...(variant.price != null ? { price: Number(variant.price) } : {}),
    ...(variant.stock != null ? { stock: Number(variant.stock) } : {}),
    ...(variant.warehouseLocation
      ? { warehouseLocation: variant.warehouseLocation }
      : {}),
    ...(variant.assetIds?.length ? { assetIds: variant.assetIds } : {}),
  }));

  const cleanedAssets = (payload.media?.assets || [])
    .filter((asset) => Boolean(asset.url))
    .map((asset, index) => ({
      ...(asset._id ? { _id: asset._id } : {}),
      assetType: asset.assetType || '2d',
      role: asset.role || 'gallery',
      url: asset.url,
      ...(asset.format ? { format: asset.format } : {}),
      ...(asset.posterUrl ? { posterUrl: asset.posterUrl } : {}),
      order: Number(asset.order ?? index),
    }));

  return {
    ...payload,
    variants: cleanedVariants,
    media: payload.media
      ? {
          ...payload.media,
          assets: cleanedAssets,
          tryOn: payload.media.tryOn
            ? {
                enabled: Boolean(payload.media.tryOn.enabled),
                ...(payload.media.tryOn.arUrl
                  ? { arUrl: payload.media.tryOn.arUrl }
                  : {}),
                ...(payload.media.tryOn.assetIds?.length
                  ? { assetIds: payload.media.tryOn.assetIds }
                  : {}),
              }
            : payload.media.tryOn,
        }
      : payload.media,
  };
}

export async function getProducts(params?: GetProductsParams): Promise<ProductListResponse> {
  const response = await apiClient.get('/api/products', {
    params,
  });

  const rows = extractRows(response.data).map(normalizeProduct).filter((item) => Boolean(item._id));
  const pagination = extractPagination(response.data);

  return {
    products: rows,
    total: pagination.total || rows.length,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}

export async function getProductById(productId: string): Promise<Product> {
  const response = await apiClient.get(`/api/products/${productId}`);
  const envelope = response.data as BackendEnvelope<Product>;
  const payload = (envelope?.data || response.data) as Product;
  return normalizeProduct(payload);
}

export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload
): Promise<Product> {
  const response = await apiClient.put(`/api/products/${productId}`, cleanForUpdate(payload));
  const envelope = response.data as BackendEnvelope<Product>;
  const data = (envelope?.data || response.data) as Product;
  return normalizeProduct(data);
}

export async function createProduct(payload: UpdateProductPayload): Promise<Product> {
  const response = await apiClient.post('/api/products', cleanForUpdate(payload));
  const envelope = response.data as BackendEnvelope<Product>;
  const data = (envelope?.data || response.data) as Product;
  return normalizeProduct(data);
}

export async function uploadFile(file: File, folder?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await apiClient.post<BackendEnvelope<UploadResponse>>(
    '/api/uploads',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  const payload = (response.data?.data || response.data) as UploadResponse;
  if (!payload?.url) {
    throw new Error('Upload response không có URL file');
  }
  return payload;
}
