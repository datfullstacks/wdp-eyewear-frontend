import apiClient from './client';
import type { InventoryItem, InventoryStatus } from '@/types/inventory';

type BackendProductVariant = {
  sku?: string;
  stock?: number;
  options?: Record<string, string>;
  warehouseLocation?: string;
};

type BackendProduct = {
  _id?: string;
  id?: string;
  name?: string;
  brand?: string;
  type?: string;
  description?: string;
  pricing?: Record<string, unknown>;
  updatedAt?: string;
  inventory?: {
    track?: boolean;
    threshold?: number;
    warehouseDefaultLocation?: string;
  };
  preOrder?: Record<string, unknown>;
  fulfillment?: {
    warehouseDefaultLocation?: string;
  };
  seo?: {
    modelCode?: string;
  };
  specs?: Record<string, unknown>;
  variants?: BackendProductVariant[];
  media?: Record<string, unknown>;
  servicesIncluded?: unknown[];
  bundleIds?: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractProductsArray(payload: unknown): BackendProduct[] {
  if (typeof payload === 'string') throw new Error('Invalid products response.');

  if (Array.isArray(payload)) return payload as BackendProduct[];

  if (!isRecord(payload)) throw new Error('Invalid products response.');

  const dataField = (payload as any).data;
  if (Array.isArray(dataField)) return dataField as BackendProduct[];

  if (isRecord(dataField) && Array.isArray((dataField as any).data)) {
    return (dataField as any).data as BackendProduct[];
  }

  if (Array.isArray((payload as any).products)) {
    return (payload as any).products as BackendProduct[];
  }

  throw new Error('Invalid products response shape.');
}

function toCategoryLabel(type?: string) {
  const key = String(type || '').toLowerCase();
  const map: Record<string, string> = {
    sunglasses: 'Kính mát',
    frame: 'Gọng kính',
    lens: 'Tròng kính',
    contact_lens: 'Lens áp tròng',
    accessory: 'Phụ kiện',
    service: 'Dịch vụ',
    bundle: 'Combo/Bộ sản phẩm',
    gift_card: 'Thẻ quà tặng',
    other: 'Khác',
  };
  return map[key] || (type ? type : 'Khác');
}

function toVariantLabel(options?: Record<string, string>) {
  if (!options) return '-';
  const color = options.color || options.Colour || options.colour;
  const size = options.size || options.Size;
  if (color && size) return `${color} / ${size}`;
  return color || size || '-';
}

function toStatus(stock: number, minStock: number, maxStock: number): InventoryStatus {
  if (stock <= 0) return 'out_of_stock';
  if (minStock > 0 && stock < minStock) return 'low_stock';
  if (maxStock > 0 && stock > maxStock) return 'overstock';
  return 'in_stock';
}

function toInventoryRows(product: BackendProduct): InventoryItem[] {
  const productId = product._id || product.id || '';
  const name = product.name || '-';
  const brand = product.brand || '-';
  const category = toCategoryLabel(product.type);
  const minStock = typeof product.inventory?.threshold === 'number' ? product.inventory.threshold : 0;
  const maxStock = minStock > 0 ? minStock * 4 : 0;
  const lastUpdated = product.updatedAt || '-';
  const defaultLocation =
    product.fulfillment?.warehouseDefaultLocation ||
    product.inventory?.warehouseDefaultLocation ||
    '-';

  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length === 0) {
    const sku = product.seo?.modelCode || productId || '-';
    const stock = 0;
    return [
      {
        id: productId || sku,
        sku,
        name,
        brand,
        category,
        variant: '-',
        stock,
        reserved: 0,
        available: stock,
        minStock,
        maxStock,
        location: defaultLocation,
        lastUpdated,
        status: toStatus(stock, minStock, maxStock),
      },
    ];
  }

  return variants.map((variant, idx) => {
    const sku = variant.sku || product.seo?.modelCode || `${productId || 'product'}-${idx + 1}`;
    const stock = typeof variant.stock === 'number' ? variant.stock : 0;
    const location = variant.warehouseLocation || defaultLocation;
    return {
      id: `${productId || sku}:${variant.sku || idx}`,
      sku,
      name,
      brand,
      category,
      variant: toVariantLabel(variant.options),
      stock,
      reserved: 0,
      available: stock,
      minStock,
      maxStock,
      location,
      lastUpdated,
      status: toStatus(stock, minStock, maxStock),
    };
  });
}

function extractProduct(payload: unknown): BackendProduct {
  if (typeof payload === 'string') throw new Error('Invalid product response.');
  if (!isRecord(payload)) throw new Error('Invalid product response.');

  const dataField = (payload as any).data;
  if (isRecord(dataField)) return dataField as BackendProduct;
  if (isRecord((payload as any).product)) return (payload as any).product as BackendProduct;

  if (typeof (payload as any)._id === 'string' || typeof (payload as any).id === 'string') {
    return payload as BackendProduct;
  }

  throw new Error('Invalid product response shape.');
}

function parseProductId(rowId: string) {
  return String(rowId || '').split(':')[0];
}

function sanitizeVariantsForPut(variants: unknown) {
  if (!Array.isArray(variants)) return [];
  return variants.map((variant) => {
    if (!isRecord(variant)) return {};
    return {
      sku: (variant as any).sku,
      barcode: (variant as any).barcode,
      options: (variant as any).options,
      price: (variant as any).price,
      stock: (variant as any).stock,
      warehouseLocation: (variant as any).warehouseLocation,
      assetIds: (variant as any).assetIds,
    };
  });
}

function sanitizePricingForPut(pricing: unknown) {
  if (!isRecord(pricing)) return undefined;
  return {
    currency: (pricing as any).currency,
    basePrice: (pricing as any).basePrice,
    msrp: (pricing as any).msrp,
    salePrice: (pricing as any).salePrice,
    discountPercent: (pricing as any).discountPercent,
    taxRate: (pricing as any).taxRate,
  };
}

function sanitizeInventoryForPut(inventory: unknown) {
  if (!isRecord(inventory)) return undefined;
  return {
    track: (inventory as any).track,
    threshold: (inventory as any).threshold,
  };
}

function sanitizeMediaForPut(media: unknown) {
  if (!isRecord(media)) return undefined;
  return {
    primaryAssetId: (media as any).primaryAssetId,
    assets: (media as any).assets,
    tryOn: (media as any).tryOn,
  };
}

export const inventoryApi = {
  getStockItems: async (params?: { page?: number; limit?: number }): Promise<InventoryItem[]> => {
    const response = await apiClient.get('/api/products', {
      params: { page: params?.page ?? 1, limit: params?.limit ?? 100 },
    });
    const rows = extractProductsArray(response.data);
    return rows.flatMap(toInventoryRows);
  },

  updateVariantStock: async (args: {
    rowId: string;
    sku: string;
    stock: number;
    reason?: string;
  }): Promise<void> => {
    const productId = parseProductId(args.rowId);
    if (!productId) throw new Error('Missing product id.');
    if (!args.sku) throw new Error('Missing SKU.');
    if (!Number.isFinite(args.stock)) throw new Error('Invalid stock value.');

    const productRes = await apiClient.get(`/api/products/${productId}`);
    const product = extractProduct(productRes.data);

    const variants = sanitizeVariantsForPut(product.variants);
    const targetIndex = variants.findIndex((v: any) => String(v?.sku || '') === args.sku);
    if (targetIndex < 0) {
      throw new Error(`Cannot find variant SKU "${args.sku}" in product "${productId}".`);
    }

    variants[targetIndex] = { ...variants[targetIndex], stock: args.stock };

    const body: Record<string, unknown> = {
      name: product.name,
      type: product.type,
      brand: product.brand,
      description: product.description,
      pricing: sanitizePricingForPut(product.pricing),
      inventory: sanitizeInventoryForPut(product.inventory),
      preOrder: product.preOrder,
      specs: product.specs || {},
      variants,
      media: sanitizeMediaForPut(product.media),
      servicesIncluded: product.servicesIncluded,
      bundleIds: product.bundleIds,
    };

    await apiClient.put(`/api/products/${productId}`, body);
  },
};

export default inventoryApi;
