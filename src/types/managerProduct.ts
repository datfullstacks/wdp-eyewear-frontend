export type ManagerProductStatus = 'draft' | 'active' | 'inactive' | 'out_of_stock';

export interface Pricing {
  currency?: string;
  basePrice?: number;
  msrp?: number;
  salePrice?: number;
  discountPercent?: number;
  taxRate?: number;
}

export interface Inventory {
  track?: boolean;
  threshold?: number;
}

export interface PreOrder {
  enabled?: boolean;
  startAt?: string;
  endAt?: string;
  shipFrom?: string;
  shipTo?: string;
  depositPercent?: number;
  maxQuantityPerOrder?: number;
  allowCod?: boolean;
  note?: string;
}

export interface VariantOption {
  color?: string;
  size?: string;
  [key: string]: string | undefined;
}

export interface Variant {
  _id?: string;
  sku?: string;
  barcode?: string;
  options?: VariantOption;
  price?: number;
  stock?: number;
  warehouseLocation?: string;
  assetIds?: string[];
}

export interface Asset {
  _id?: string;
  assetType?: '2d' | '3d';
  role?: 'hero' | 'gallery' | 'thumbnail' | 'lifestyle' | 'try_on' | 'viewer';
  url?: string;
  format?: string;
  posterUrl?: string;
  order?: number;
}

export interface TryOn {
  enabled?: boolean;
  arUrl?: string;
  assetIds?: string[];
  status?: string;
}

export interface Media {
  primaryAssetId?: string;
  assets?: Asset[];
  tryOn?: TryOn;
}

export type ProductSpecs = Record<string, unknown>;

export interface Product {
  _id: string;
  id?: string;
  name: string;
  type: string;
  brand: string;
  slug?: string;
  description?: string;
  status?: ManagerProductStatus;
  pricing?: Pricing;
  inventory?: Inventory;
  preOrder?: PreOrder;
  variants?: Variant[];
  media?: Media;
  specs?: ProductSpecs;
  servicesIncluded?: string[];
  bundleIds?: string[];
  stockTotal?: number;
  updatedAt?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductDetailResponse {
  product: Product;
}

export interface UpdateProductPayload {
  name?: string;
  type?: string;
  brand?: string;
  slug?: string;
  description?: string;
  status?: ManagerProductStatus;
  pricing?: Pricing;
  inventory?: Inventory;
  preOrder?: PreOrder;
  variants?: Variant[];
  media?: Media;
  specs?: ProductSpecs;
  servicesIncluded?: string[];
  bundleIds?: string[];
}

export interface UploadResponse {
  path: string;
  url: string;
  contentType?: string;
  size?: number;
}
