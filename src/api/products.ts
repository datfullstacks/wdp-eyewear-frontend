import apiClient from './client';

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'out_of_stock';

export interface ProductMediaAsset {
  assetType: '2d' | '3d';
  role: 'hero' | 'gallery' | 'thumbnail' | 'lifestyle' | 'try_on' | 'viewer';
  url: string;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  type: string;
  price: number;
  imageUrl: string;
  mediaAssets: ProductMediaAsset[];
  category: string;
  brand: string;
  stock: number;
  status: ProductStatus;
  hasSold: boolean;
}

export interface ProductsResponse {
  products: Product[];
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

interface BackendProduct {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  type?: string;
  brand?: string;
  status?: ProductStatus;
  seo?: {
    collections?: string[];
  };
  pricing?: {
    basePrice?: number;
    salePrice?: number;
  };
  media?: {
    assets?: Array<{
      assetType?: '2d' | '3d';
      role?: 'hero' | 'gallery' | 'thumbnail' | 'lifestyle' | 'try_on' | 'viewer';
      url?: string;
      order?: number;
    }>;
  };
  variants?: Array<{
    stock?: number;
  }>;
}

export interface ProductUpsertInput {
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  mediaAssets?: ProductMediaAsset[];
}

const PRODUCT_TYPES = new Set([
  'sunglasses',
  'frame',
  'lens',
  'contact_lens',
  'accessory',
  'service',
  'bundle',
  'gift_card',
  'other',
]);

const CATEGORY_TO_TYPE: Record<string, string> = {
  'Kinh mat': 'sunglasses',
  'Kinh mat ': 'sunglasses',
  sunglasses: 'sunglasses',
  'Gong kinh': 'frame',
  frame: 'frame',
  'Trong kinh': 'lens',
  lens: 'lens',
  'Phu kien': 'accessory',
  accessory: 'accessory',
  other: 'other',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400';

function getMediaAssets(raw?: BackendProduct): ProductMediaAsset[] {
  const assets = raw?.media?.assets || [];
  return assets
    .filter((asset) => !!asset?.url)
    .map((asset, index) => ({
      assetType: asset.assetType || '2d',
      role: asset.role || 'gallery',
      url: asset.url || '',
      order: asset.order ?? index,
    }));
}

function getProductImage(raw?: BackendProduct): string {
  const assets = getMediaAssets(raw);
  const hero = assets.find((a) => a.role === 'hero')?.url;
  const thumbnail = assets.find((a) => a.role === 'thumbnail')?.url;
  return hero || thumbnail || assets[0]?.url || DEFAULT_IMAGE;
}

function getProductStock(raw?: BackendProduct): number {
  const variants = raw?.variants || [];
  if (variants.length === 0) return 0;
  return variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
}

function resolveCategory(raw?: BackendProduct): string {
  return raw?.seo?.collections?.[0] || raw?.type || 'other';
}

function mapBackendProduct(raw: BackendProduct): Product {
  const id = raw._id || raw.id || '';
  const price = Number(raw.pricing?.salePrice ?? raw.pricing?.basePrice ?? 0);

  return {
    id,
    name: raw.name || '',
    description: raw.description || '',
    type: raw.type || 'other',
    price,
    imageUrl: getProductImage(raw),
    mediaAssets: getMediaAssets(raw),
    category: resolveCategory(raw),
    brand: raw.brand || '',
    stock: getProductStock(raw),
    status: raw.status || 'draft',
    hasSold: false,
  };
}

function resolveType(category: string): string {
  const normalized = (category || '').trim();
  if (PRODUCT_TYPES.has(normalized)) return normalized;
  return CATEGORY_TO_TYPE[normalized] || 'other';
}

function normalizeMediaAssets(input: ProductUpsertInput): ProductMediaAsset[] {
  const fromInput =
    (input.mediaAssets || [])
      .filter((asset) => asset?.url)
      .map((asset, index) => ({
        assetType: asset.assetType || '2d',
        role: asset.role || 'gallery',
        url: asset.url,
        order: asset.order ?? index,
      })) || [];

  if (fromInput.length > 0) return fromInput;

  if (input.imageUrl) {
    return [{ assetType: '2d', role: 'hero', url: input.imageUrl, order: 0 }];
  }

  return [];
}

function toBackendUpsertPayload(
  input: ProductUpsertInput,
  mode: 'create' | 'update'
) {
  const resolvedType = resolveType(input.category);
  const mediaAssets = normalizeMediaAssets(input);

  const payload: Record<string, unknown> = {
    name: input.name,
    brand: input.brand,
    description: input.description || '',
    // Keep "other" to avoid strict type-guard requirements when UI doesn't collect all specs.
    type: 'other',
    pricing: {
      currency: 'VND',
      basePrice: Number(input.price),
      salePrice: Number(input.price),
    },
    inventory: {
      track: true,
      threshold: 5,
    },
    variants: [
      {
        sku: `SKU-${Date.now()}`,
        stock: Number(input.stock),
        price: Number(input.price),
      },
    ],
    seo: {
      collections: [input.category || resolvedType],
    },
  };

  if (mediaAssets.length > 0) {
    payload.media = {
      assets: mediaAssets,
    };
  }

  if (mode === 'create') {
    payload.status = 'active';
  }

  return payload;
}

export const productApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    brand?: string;
    status?: string;
  }): Promise<ProductsResponse> => {
    const { data } = await apiClient.get<BackendEnvelope<BackendProduct[]>>(
      '/api/products',
      { params }
    );
    const rows = Array.isArray(data?.data) ? data.data : [];
    const pagination = data?.pagination;

    return {
      products: rows.map(mapBackendProduct),
      total: pagination?.total ?? rows.length,
      page: pagination?.page ?? (params?.page || 1),
      pageSize: pagination?.limit ?? (params?.limit || rows.length || 10),
    };
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<BackendEnvelope<BackendProduct>>(
      `/api/products/${id}`
    );
    const raw =
      (data as BackendEnvelope<BackendProduct>)?.data ||
      (data as unknown as BackendProduct);
    return mapBackendProduct(raw);
  },

  search: async (query: string): Promise<Product[]> => {
    const result = await productApi.getAll({ page: 1, limit: 50, search: query });
    return result.products;
  },

  create: async (payload: ProductUpsertInput): Promise<Product> => {
    const body = toBackendUpsertPayload(payload, 'create');
    const { data } = await apiClient.post<BackendEnvelope<BackendProduct>>(
      '/api/products',
      body
    );
    const raw =
      (data as BackendEnvelope<BackendProduct>)?.data ||
      (data as unknown as BackendProduct);
    return mapBackendProduct(raw);
  },

  update: async (id: string, payload: ProductUpsertInput): Promise<Product> => {
    const body = toBackendUpsertPayload(payload, 'update');
    const { data } = await apiClient.put<BackendEnvelope<BackendProduct>>(
      `/api/products/${id}`,
      body
    );
    const raw =
      (data as BackendEnvelope<BackendProduct>)?.data ||
      (data as unknown as BackendProduct);
    return mapBackendProduct(raw);
  },

  updateStatus: async (id: string, status: ProductStatus): Promise<Product> => {
    const { data } = await apiClient.put<BackendEnvelope<BackendProduct>>(
      `/api/products/${id}`,
      { status }
    );
    const raw =
      (data as BackendEnvelope<BackendProduct>)?.data ||
      (data as unknown as BackendProduct);
    return mapBackendProduct(raw);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },
};

export default productApi;
