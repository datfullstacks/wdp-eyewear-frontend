import type {
  Product,
  ProductSpecs,
  UpdateProductPayload,
  Variant,
} from '@/types/managerProduct';

export function getPrimaryImageUrl(product: Product): string {
  const assets = product.media?.assets || [];
  const hero = assets.find((asset) => asset.role === 'hero')?.url;
  return hero || assets[0]?.url || '';
}

export function hasTryOnComplexity(product: Product): boolean {
  const tryOnEnabled = Boolean(product.media?.tryOn?.enabled);
  const has3DAsset = (product.media?.assets || []).some(
    (asset) => asset.assetType === '3d'
  );
  return tryOnEnabled || has3DAsset;
}

export function mapProductToUpdatePayload(product: Product): UpdateProductPayload {
  return {
    name: product.name,
    type: product.type,
    brand: product.brand,
    slug: product.slug,
    description: product.description,
    status: product.status,
    pricing: {
      currency: product.pricing?.currency || 'VND',
      basePrice: Number(product.pricing?.basePrice || 0),
      msrp: product.pricing?.msrp,
      salePrice: product.pricing?.salePrice,
      discountPercent: product.pricing?.discountPercent,
      taxRate: product.pricing?.taxRate,
    },
    inventory: {
      track: product.inventory?.track ?? true,
      threshold: Number(product.inventory?.threshold ?? 0),
    },
    preOrder: {
      enabled: Boolean(product.preOrder?.enabled),
      startAt: product.preOrder?.startAt,
      endAt: product.preOrder?.endAt,
      shipFrom: product.preOrder?.shipFrom,
      shipTo: product.preOrder?.shipTo,
      depositPercent: product.preOrder?.depositPercent,
      maxQuantityPerOrder: product.preOrder?.maxQuantityPerOrder,
      allowCod: product.preOrder?.allowCod,
      note: product.preOrder?.note,
    },
    variants: (product.variants || []).map((variant) => ({
      _id: variant._id,
      sku: variant.sku,
      barcode: variant.barcode,
      options: {
        color: variant.options?.color || '',
        size: variant.options?.size || '',
      },
      price: Number(variant.price || 0),
      stock: Number(variant.stock || 0),
      warehouseLocation: variant.warehouseLocation,
      assetIds: variant.assetIds || [],
    })),
    media: {
      primaryAssetId: product.media?.primaryAssetId,
      assets: (product.media?.assets || []).map((asset, index) => ({
        _id: asset._id,
        assetType: asset.assetType || '2d',
        role: asset.role || 'gallery',
        url: asset.url || '',
        format: asset.format,
        posterUrl: asset.posterUrl,
        order: Number(asset.order ?? index),
      })),
      tryOn: {
        enabled: Boolean(product.media?.tryOn?.enabled),
        arUrl: product.media?.tryOn?.arUrl,
        assetIds: product.media?.tryOn?.assetIds || [],
      },
    },
    specs: product.specs || {},
    servicesIncluded: product.servicesIncluded || [],
    bundleIds: product.bundleIds || [],
  };
}

export function normalizeVariant(variant?: Variant): Variant {
  return {
    _id: variant?._id,
    sku: variant?.sku || '',
    barcode: variant?.barcode || '',
    options: {
      color: variant?.options?.color || '',
      size: variant?.options?.size || '',
    },
    price: Number(variant?.price || 0),
    stock: Number(variant?.stock || 0),
    warehouseLocation: variant?.warehouseLocation || '',
    assetIds: variant?.assetIds || [],
  };
}

export function tryParseSpecsJson(value: string): ProductSpecs {
  if (!value.trim()) return {};
  return JSON.parse(value) as ProductSpecs;
}
