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

export interface ProductDetail extends Product {
  slug?: string;
  pricing?: {
    currency?: string;
    basePrice?: number;
    salePrice?: number;
    discountPercent?: number;
    taxRate?: number;
  };
  inventory?: {
    track?: boolean;
    threshold?: number;
    warehouseDefaultLocation?: string;
  };
  preOrder?: {
    enabled?: boolean;
    allowCod?: boolean;
  };
  compatibility?: {
    productIds?: string[];
    notes?: string;
  };
  fulfillment?: {
    supplier?: string;
    leadTime?: string;
    returnWindowDays?: number;
    warrantyMonths?: number;
    warehouseDefaultLocation?: string;
  };
  seo?: {
    keywords?: string[];
    modelCode?: string;
    collections?: string[];
    countryOfOrigin?: string;
  };
  media?: {
    tryOn?: {
      enabled?: boolean;
      status?: string;
      assetIds?: string[];
    };
    assets?: Array<{
      _id?: string;
      assetType?: '2d' | '3d';
      role?:
        | 'hero'
        | 'gallery'
        | 'thumbnail'
        | 'lifestyle'
        | 'try_on'
        | 'viewer';
      url?: string;
      order?: number;
      format?: string;
      posterUrl?: string;
      ['ar.glbUrl']?: string;
      ['ar.usdzUrl']?: string;
    }>;
  };
  servicesIncluded?: unknown[];
  bundleIds?: string[];
  specs?: Record<string, unknown>;
  variants?: Array<{
    _id?: string;
    options?: Record<string, string>;
    sku?: string;
    price?: number;
    stock?: number;
    warehouseLocation?: string;
    assetIds?: string[];
  }>;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  updatedAt?: string;
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
  slug?: string;
  brand?: string;
  status?: ProductStatus;
  seo?: {
    collections?: string[];
    keywords?: string[];
    modelCode?: string;
    countryOfOrigin?: string;
  };
  pricing?: {
    currency?: string;
    basePrice?: number;
    salePrice?: number;
    discountPercent?: number;
    taxRate?: number;
  };
  inventory?: {
    track?: boolean;
    threshold?: number;
    warehouseDefaultLocation?: string;
  };
  preOrder?: {
    enabled?: boolean;
    allowCod?: boolean;
  };
  compatibility?: {
    productIds?: string[];
    notes?: string;
  };
  fulfillment?: {
    supplier?: string;
    leadTime?: string;
    returnWindowDays?: number;
    warrantyMonths?: number;
    warehouseDefaultLocation?: string;
  };
  media?: {
    tryOn?: {
      enabled?: boolean;
      status?: string;
      assetIds?: string[];
    };
    assets?: Array<{
      _id?: string;
      assetType?: '2d' | '3d';
      role?:
        | 'hero'
        | 'gallery'
        | 'thumbnail'
        | 'lifestyle'
        | 'try_on'
        | 'viewer';
      url?: string;
      order?: number;
      format?: string;
      posterUrl?: string;
      ['ar.glbUrl']?: string;
      ['ar.usdzUrl']?: string;
    }>;
  };
  servicesIncluded?: unknown[];
  bundleIds?: string[];
  specs?: Record<string, unknown>;
  variants?: Array<{
    _id?: string;
    options?: Record<string, string>;
    sku?: string;
    price?: number;
    stock?: number;
    warehouseLocation?: string;
    assetIds?: string[];
  }>;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  updatedAt?: string;
  __v?: number;
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

function mapBackendProductDetail(raw: BackendProduct): ProductDetail {
  const base = mapBackendProduct(raw);
  return {
    ...base,
    slug: raw.slug,
    pricing: raw.pricing,
    inventory: raw.inventory,
    preOrder: raw.preOrder,
    compatibility: raw.compatibility,
    fulfillment: raw.fulfillment,
    seo: raw.seo,
    media: raw.media,
    servicesIncluded: raw.servicesIncluded,
    bundleIds: raw.bundleIds,
    specs: raw.specs,
    variants: raw.variants?.map((variant) => ({
      _id: variant._id,
      options: variant.options,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      warehouseLocation: variant.warehouseLocation,
      assetIds: variant.assetIds,
    })),
    ratingsAverage: raw.ratingsAverage,
    ratingsQuantity: raw.ratingsQuantity,
    updatedAt: raw.updatedAt,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractProductsPayload(
  payload: unknown
): { rows: BackendProduct[]; pagination?: BackendEnvelope<unknown>['pagination'] } {
  if (typeof payload === 'string') {
    throw new Error(
      'Invalid products response (received string). Check NEXT_PUBLIC_API_URL.'
    );
  }

  if (Array.isArray(payload)) {
    return { rows: payload as BackendProduct[] };
  }

  if (!isRecord(payload)) {
    throw new Error('Invalid products response. Check NEXT_PUBLIC_API_URL.');
  }

  const pagination =
    (payload.pagination as BackendEnvelope<unknown>['pagination']) ||
    (isRecord(payload.data) ? (payload.data.pagination as any) : undefined);

  const dataField = payload.data;

  if (Array.isArray(dataField)) {
    return { rows: dataField as BackendProduct[], pagination };
  }

  if (isRecord(dataField) && Array.isArray((dataField as any).data)) {
    return { rows: (dataField as any).data as BackendProduct[], pagination };
  }

  if (Array.isArray((payload as any).products)) {
    return { rows: (payload as any).products as BackendProduct[], pagination };
  }

  throw new Error('Invalid products response shape. Check NEXT_PUBLIC_API_URL.');
}

function extractProductPayload(payload: unknown): BackendProduct {
  if (typeof payload === 'string') {
    throw new Error(
      'Invalid product response (received string). Check NEXT_PUBLIC_API_URL.'
    );
  }

  if (!isRecord(payload)) {
    throw new Error('Invalid product response. Check NEXT_PUBLIC_API_URL.');
  }

  const dataField = payload.data;

  if (isRecord(dataField)) {
    return dataField as BackendProduct;
  }

  if (isRecord((payload as any).product)) {
    return (payload as any).product as BackendProduct;
  }

  // Some backends return the product object directly.
  if (typeof (payload as any)._id === 'string' || typeof (payload as any).id === 'string') {
    return payload as BackendProduct;
  }

  throw new Error('Invalid product response shape. Check NEXT_PUBLIC_API_URL.');
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
    sort?: string;
    search?: string;
    brand?: string;
    status?: string;
  }): Promise<ProductsResponse> => {
    const { page, limit, ...rest } = params ?? {};
    const requestParams = {
      page: page ?? 1,
      limit: limit ?? 100,
      ...rest,
    };

    const response = await apiClient.get('/api/products', { params: requestParams });
    const { rows, pagination } = extractProductsPayload(response.data);

    return {
      products: rows.map(mapBackendProduct),
      total: pagination?.total ?? rows.length,
      page: pagination?.page ?? requestParams.page,
      pageSize: pagination?.limit ?? requestParams.limit,
    };
  },

  getById: async (id: string): Promise<ProductDetail> => {
    const response = await apiClient.get(`/api/products/${id}`);
    const raw = extractProductPayload(response.data);
    return mapBackendProductDetail(raw);
  },

  search: async (query: string): Promise<Product[]> => {
    const result = await productApi.getAll({
      page: 1,
      limit: 50,
      search: query,
    });
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
