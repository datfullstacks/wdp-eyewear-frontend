import apiClient from './client';

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'out_of_stock';
export type PreOrderShippingCollectionTiming =
  | 'upfront'
  | 'on_delivery';
type LegacyPreOrderShippingCollectionTiming =
  | PreOrderShippingCollectionTiming
  | 'with_balance';
export type ProductTryOnStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'archived';

export interface ProductMediaAsset {
  _id?: string;
  assetType: '2d' | '3d';
  role: 'hero' | 'gallery' | 'thumbnail' | 'lifestyle' | 'try_on' | 'viewer';
  url: string;
  alt?: string;
  mime?: string;
  width?: number;
  height?: number;
  order?: number;
  format?: 'glb' | 'gltf' | 'usdz';
  posterUrl?: string;
  ar?: {
    glbUrl?: string;
    usdzUrl?: string;
  };
  viewer?: {
    background?: 'transparent' | 'white' | 'black';
    initialCamera?: unknown;
  };
}

export interface ProductStoreRef {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  type: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  ward?: string;
  district?: string;
  city?: string;
  openingHours?: string;
  supportsTryOn?: boolean;
  supportsPickup?: boolean;
  isDefault?: boolean;
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
  storeScope?: ProductDetail['storeScope'];
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
    depositPercent?: number;
    maxQuantityPerOrder?: number;
    startAt?: string;
    endAt?: string;
    shipFrom?: string;
    shipTo?: string;
    shippingCollectionTiming?: PreOrderShippingCollectionTiming;
    note?: string;
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
      status?: ProductTryOnStatus;
      assetIds?: string[];
      arUrl?: string;
      glbUrl?: string;
      usdzUrl?: string;
      launchUrl?: string;
      effectPath?: string;
      scene?: string;
      resourcePaths?: string[];
      rejectReason?: string;
      prefab?: {
        rotation?: string;
        scale?: string;
        translation?: string;
        gravity?: string;
        cut?: string;
        usePhysics?: boolean;
        colliders?: unknown[];
      };
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
      ar?: {
        glbUrl?: string;
        usdzUrl?: string;
      };
      ['ar.glbUrl']?: string;
      ['ar.usdzUrl']?: string;
    }>;
  };
  storeScope?: {
    mode?: 'all' | 'selected';
    primaryStoreId?: string | null;
    storeIds?: string[];
    note?: string;
    primaryStore?: ProductStoreRef | null;
    stores?: ProductStoreRef[];
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
    depositPercent?: number;
    maxQuantityPerOrder?: number;
    startAt?: string;
    endAt?: string;
    shipFrom?: string;
    shipTo?: string;
    shippingCollectionTiming?: LegacyPreOrderShippingCollectionTiming;
    note?: string;
  };
  storeScope?: {
    mode?: 'all' | 'selected';
    primaryStoreId?: string | { _id?: string; id?: string; [key: string]: unknown };
    storeIds?: Array<string | { _id?: string; id?: string; [key: string]: unknown }>;
    note?: string;
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
      status?: ProductTryOnStatus;
      assetIds?: string[];
      arUrl?: string;
      glbUrl?: string;
      usdzUrl?: string;
      launchUrl?: string;
      effectPath?: string;
      scene?: string;
      resourcePaths?: string[];
      rejectReason?: string;
      prefab?: {
        rotation?: string;
        scale?: string;
        translation?: string;
        gravity?: string;
        cut?: string;
        usePhysics?: boolean;
        colliders?: unknown[];
      };
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
      ar?: {
        glbUrl?: string;
        usdzUrl?: string;
      };
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
  preOrder?: {
    enabled: boolean;
    allowCod: boolean;
    depositPercent?: number;
    maxQuantityPerOrder?: number;
    startAt?: string;
    endAt?: string;
    shipFrom?: string;
    shipTo?: string;
    shippingCollectionTiming?: PreOrderShippingCollectionTiming;
    note?: string;
  };
  fulfillment?: {
    supplier?: string;
    leadTime?: string;
    returnWindowDays?: number | null;
    warrantyMonths?: number | null;
    warehouseDefaultLocation?: string;
  };
  storeScope?: {
    mode: 'all' | 'selected';
    primaryStoreId?: string;
    storeIds?: string[];
    note?: string;
  };
  type?: string;
  tryOn?: {
    enabled: boolean;
    status?: ProductTryOnStatus;
    rejectReason?: string;
    arUrl?: string;
    glbUrl?: string;
    usdzUrl?: string;
    launchUrl?: string;
    effectPath?: string;
    scene?: string;
    resourcePaths?: string[];
    assetIds?: string[];
    prefab?: {
      rotation?: string;
      scale?: string;
      translation?: string;
      gravity?: string;
      cut?: string;
      usePhysics?: boolean;
      colliders?: unknown[];
    };
  };
  variant?: {
    _id?: string;
    sku?: string;
    barcode?: string;
    color?: string;
    size?: string;
    warehouseLocation?: string;
    assetIds?: string[];
    price?: number;
    stock?: number;
  };
  variants?: Array<{
    _id?: string;
    sku?: string;
    barcode?: string;
    color?: string;
    size?: string;
    warehouseLocation?: string;
    assetIds?: string[];
    price?: number;
    stock?: number;
  }>;
  specs?: {
    common?: {
      shape?: string;
      gender?: 'men' | 'women' | 'unisex' | 'kids';
      weightGram?: number;
    };
    frame?: {
      material?: string;
      hingeType?: 'standard' | 'spring';
      nosePads?: boolean;
      rimType?: string;
      rxReady?: boolean;
    };
    dimensions?: {
      bridgeMm?: number;
      templeLengthMm?: number;
      lensWidthMm?: number;
      lensHeightMm?: number;
    };
    lens?: {
      uvProtection?: string;
    };
  };
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

function isMongoId(value: unknown): boolean {
  return /^[a-f0-9]{24}$/i.test(String(value ?? '').trim());
}

function normalizeStoreRef(raw: any): ProductStoreRef {
  return {
    id: String(raw?._id || raw?.id || ''),
    name: String(raw?.name || ''),
    code: String(raw?.code || ''),
    status: String(raw?.status || 'active') as 'active' | 'inactive',
    type: String(raw?.type || 'branch'),
    phone: String(raw?.phone || ''),
    email: String(raw?.email || ''),
    addressLine1: String(raw?.addressLine1 || ''),
    ward: String(raw?.ward || ''),
    district: String(raw?.district || ''),
    city: String(raw?.city || ''),
    openingHours: String(raw?.openingHours || ''),
    supportsTryOn: Boolean(raw?.supportsTryOn),
    supportsPickup: raw?.supportsPickup !== false,
    isDefault: Boolean(raw?.isDefault),
  };
}

function normalizeStoreScope(raw?: BackendProduct): ProductDetail['storeScope'] {
  const scope = raw?.storeScope;
  if (!scope) {
    return {
      mode: 'all',
      primaryStoreId: null,
      storeIds: [],
      note: '',
      primaryStore: null,
      stores: [],
    };
  }

  const primaryStore =
    scope.primaryStoreId && typeof scope.primaryStoreId === 'object'
      ? normalizeStoreRef(scope.primaryStoreId)
      : null;
  const stores = Array.isArray(scope.storeIds)
    ? scope.storeIds
        .filter((item) => item && typeof item === 'object')
        .map((item) => normalizeStoreRef(item))
    : [];

  return {
    mode: scope.mode === 'selected' ? 'selected' : 'all',
    primaryStoreId:
      typeof scope.primaryStoreId === 'string'
        ? scope.primaryStoreId
        : primaryStore?.id || null,
    storeIds: Array.isArray(scope.storeIds)
      ? scope.storeIds
          .map((item) =>
            typeof item === 'string' ? item : String(item?._id || item?.id || '')
          )
          .filter(Boolean)
      : [],
    note: String(scope.note || ''),
    primaryStore,
    stores,
  };
}

function resolveCategory(raw?: BackendProduct): string {
  return raw?.seo?.collections?.[0] || raw?.type || 'other';
}

function normalizePreOrderConfig(
  preOrder?: BackendProduct['preOrder']
): ProductDetail['preOrder'] {
  if (!preOrder) return undefined;

  const shippingCollectionTiming =
    preOrder.shippingCollectionTiming === 'with_balance'
      ? 'on_delivery'
      : preOrder.shippingCollectionTiming || 'upfront';

  return {
    ...preOrder,
    shippingCollectionTiming,
  };
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
    storeScope: normalizeStoreScope(raw),
  };
}

function mapBackendProductDetail(raw: BackendProduct): ProductDetail {
  const base = mapBackendProduct(raw);
  return {
    ...base,
    slug: raw.slug,
    pricing: raw.pricing,
    inventory: raw.inventory,
    preOrder: normalizePreOrderConfig(raw.preOrder),
    compatibility: raw.compatibility,
    fulfillment: raw.fulfillment,
    seo: raw.seo,
    media: raw.media,
    storeScope: normalizeStoreScope(raw),
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
        _id: asset._id,
        assetType: asset.assetType || '2d',
        role: asset.role || 'gallery',
        url: asset.url,
        alt: asset.alt,
        mime: asset.mime,
        width: asset.width,
        height: asset.height,
        order: asset.order ?? index,
        format: asset.format,
        posterUrl: asset.posterUrl,
        ar: asset.ar,
        viewer: asset.viewer,
      })) || [];

  if (fromInput.length > 0) return fromInput;

  if (input.imageUrl) {
    return [{ assetType: '2d', role: 'hero', url: input.imageUrl, order: 0 }];
  }

  return [];
}

function normalizeDateTimeInput(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function buildPreOrderPayload(input: ProductUpsertInput) {
  if (!input.preOrder) return undefined;

  const depositPercent =
    typeof input.preOrder.depositPercent === 'number'
      ? Number(input.preOrder.depositPercent)
      : undefined;
  const maxQuantityPerOrder =
    typeof input.preOrder.maxQuantityPerOrder === 'number'
      ? Number(input.preOrder.maxQuantityPerOrder)
      : undefined;

  return {
    enabled: Boolean(input.preOrder.enabled),
    allowCod: Boolean(input.preOrder.allowCod),
    depositPercent,
    maxQuantityPerOrder,
    startAt: normalizeDateTimeInput(input.preOrder.startAt),
    endAt: normalizeDateTimeInput(input.preOrder.endAt),
    shipFrom: normalizeDateTimeInput(input.preOrder.shipFrom),
    shipTo: normalizeDateTimeInput(input.preOrder.shipTo),
    shippingCollectionTiming:
      input.preOrder.shippingCollectionTiming || 'upfront',
    note: input.preOrder.note || '',
  };
}

function toBackendUpsertPayload(
  input: ProductUpsertInput,
  mode: 'create' | 'update'
) {
  const resolvedType = input.type || resolveType(input.category);
  const mediaAssets = normalizeMediaAssets(input);
  const variantInputs =
    Array.isArray(input.variants) && input.variants.length > 0
      ? input.variants
      : [
          {
            _id: input.variant?._id,
            sku: input.variant?.sku,
            barcode: input.variant?.barcode,
            color: input.variant?.color,
            size: input.variant?.size,
            warehouseLocation: input.variant?.warehouseLocation,
            assetIds: input.variant?.assetIds,
            price: input.variant?.price,
            stock: input.variant?.stock,
          },
        ];
  const normalizedVariants = variantInputs.map((variant, index) => ({
    ...(isMongoId(variant._id) ? { _id: String(variant._id) } : {}),
    sku: variant.sku || `SKU-${Date.now()}-${index + 1}`,
    barcode: variant.barcode,
    options: {
      ...(variant.color ? { color: variant.color } : {}),
      ...(variant.size ? { size: variant.size } : {}),
    },
    ...(typeof variant.stock === 'number' && Number.isFinite(variant.stock)
      ? { stock: Number(variant.stock) }
      : {}),
    price:
      typeof variant.price === 'number' && Number.isFinite(variant.price)
        ? Number(variant.price)
        : Number(input.price),
    warehouseLocation: variant.warehouseLocation,
    assetIds: Array.isArray(variant.assetIds)
      ? variant.assetIds.filter(Boolean)
      : undefined,
  }));

  const payload: Record<string, unknown> = {
    name: input.name,
    brand: input.brand,
    description: input.description || '',
    type: resolvedType,
    pricing: {
      currency: 'VND',
      basePrice: Number(input.price),
      salePrice: Number(input.price),
    },
    inventory: {
      track: true,
      threshold: 5,
    },
    variants: normalizedVariants,
    seo: {
      collections: [input.category || resolvedType],
    },
  };

  if (mediaAssets.length > 0) {
    payload.media = {
      assets: mediaAssets,
    };
  }

  const preOrder = buildPreOrderPayload(input);
  if (preOrder) {
    payload.preOrder = preOrder;
  }

  if (input.fulfillment) {
    const fulfillmentPayload: Record<string, unknown> = {};

    if (typeof input.fulfillment.supplier === 'string') {
      fulfillmentPayload.supplier = input.fulfillment.supplier;
    }
    if (typeof input.fulfillment.leadTime === 'string') {
      fulfillmentPayload.leadTime = input.fulfillment.leadTime;
    }
    if (typeof input.fulfillment.warehouseDefaultLocation === 'string') {
      fulfillmentPayload.warehouseDefaultLocation =
        input.fulfillment.warehouseDefaultLocation;
    }
    if (
      input.fulfillment.returnWindowDays === null ||
      (typeof input.fulfillment.returnWindowDays === 'number' &&
        Number.isFinite(input.fulfillment.returnWindowDays))
    ) {
      fulfillmentPayload.returnWindowDays = input.fulfillment.returnWindowDays;
    }
    if (
      input.fulfillment.warrantyMonths === null ||
      (typeof input.fulfillment.warrantyMonths === 'number' &&
        Number.isFinite(input.fulfillment.warrantyMonths))
    ) {
      fulfillmentPayload.warrantyMonths = input.fulfillment.warrantyMonths;
    }

    if (Object.keys(fulfillmentPayload).length > 0) {
      payload.fulfillment = fulfillmentPayload;
    }
  }

  if (input.storeScope) {
    payload.storeScope = {
      mode: input.storeScope.mode,
      primaryStoreId: input.storeScope.primaryStoreId,
      storeIds: Array.isArray(input.storeScope.storeIds)
        ? input.storeScope.storeIds.filter(Boolean)
        : [],
      note: input.storeScope.note || '',
    };
  }

  if (input.specs) {
    payload.specs = input.specs;
  }

  if (input.tryOn) {
    payload.media = {
      ...(payload.media as Record<string, unknown> | undefined),
      tryOn: {
        enabled: Boolean(input.tryOn.enabled),
        status: input.tryOn.status || 'draft',
        rejectReason: input.tryOn.rejectReason || '',
        arUrl: input.tryOn.arUrl || '',
        glbUrl: input.tryOn.glbUrl || '',
        usdzUrl: input.tryOn.usdzUrl || '',
        launchUrl: input.tryOn.launchUrl || '',
        effectPath: input.tryOn.effectPath || '',
        scene: input.tryOn.scene || '',
        resourcePaths: input.tryOn.resourcePaths || [],
        assetIds: Array.isArray(input.tryOn.assetIds)
          ? input.tryOn.assetIds.filter(Boolean)
          : [],
        prefab: input.tryOn.prefab || {},
      },
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
