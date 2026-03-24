import type {
  ProductDetail,
  ProductMediaAsset,
  ProductTryOnStatus,
  ProductUpsertInput,
} from '@/api';
import type {
  ProductFormState,
  ProductVariantFormState,
} from '@/components/organisms/manager';

const TRY_ON_STATUSES: ProductTryOnStatus[] = [
  'draft',
  'pending_review',
  'approved',
  'published',
  'rejected',
  'archived',
];

const TRY_ON_CAPABLE_CATEGORIES = new Set(['frame', 'sunglasses']);
export const MAX_TRY_ON_MODELS = 8;
type BackendMediaAsset = NonNullable<NonNullable<ProductDetail['media']>['assets']>[number];

function createEmptyVariant(index = 0): ProductVariantFormState {
  return {
    id: `variant-${index + 1}`,
    sku: '',
    color: '',
    size: '',
    price: '',
    stock: '',
    warehouseLocation: '',
    imageUrl: '',
    posterUrl: '',
    glbUrl: '',
  };
}

export const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: '',
  brand: '',
  price: '',
  stock: '',
  category: '',
  description: '',
  heroImageUrl: '',
  thumbnailUrl: '',
  galleryUrls: [],
  preOrderEnabled: false,
  preOrderAllowCod: true,
  preOrderDepositPercent: '30',
  preOrderMaxQuantityPerOrder: '',
  preOrderStartAt: '',
  preOrderEndAt: '',
  preOrderShipFrom: '',
  preOrderShipTo: '',
  preOrderShippingCollectionTiming: 'upfront',
  preOrderNote: '',
  storeScopeMode: 'all',
  primaryStoreId: '',
  storeIds: [],
  storeScopeNote: '',
  variants: [createEmptyVariant(0)],
  variantSku: '',
  variantColor: '',
  variantSize: '',
  variantWarehouseLocation: '',
  frameShape: '',
  frameGender: 'unisex',
  frameWeightGram: '',
  frameMaterial: '',
  frameHingeType: 'spring',
  frameRimType: '',
  frameNosePads: true,
  frameRxReady: true,
  dimensionBridgeMm: '',
  dimensionTempleLengthMm: '',
  dimensionLensWidthMm: '',
  dimensionLensHeightMm: '',
  lensUvProtection: '',
  tryOnEnabled: false,
  tryOnStatus: 'draft',
  tryOnRejectReason: '',
  tryOnPosterUrl: '',
  tryOnGlbUrl: '',
  tryOnArUrl: '',
  tryOnLaunchUrl: '',
  tryOnEffectPath: '',
  tryOnScene: '',
  tryOnResourcePaths: '',
  tryOnRotation: '',
  tryOnScale: '',
  tryOnTranslation: '',
  tryOnGravity: '',
  tryOnCut: 'head',
  tryOnUsePhysics: false,
};

function toText(value: unknown) {
  return String(value ?? '').trim();
}

function toOptionalText(value: unknown) {
  const text = toText(value);
  return text || undefined;
}

function toNumberString(value: unknown) {
  if (value == null || value === '') return '';
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : '';
}

function toOptionalNumber(value: string) {
  if (!toText(value)) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toDateTimeLocalValue(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function parseStringList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasAnyFilledValue(values: unknown[]) {
  return values.some((value) => {
    if (value == null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  });
}

function createObjectId(seed: string, index = 0) {
  const cleanedSeed = seed.toLowerCase().replace(/[^a-f0-9]/g, '');
  const timePart = Date.now().toString(16);
  const randomPart = Math.random().toString(16).slice(2);
  const indexPart = index.toString(16).padStart(2, '0');
  return `${timePart}${cleanedSeed}${randomPart}${indexPart}`.slice(0, 24).padEnd(24, '0');
}

function resolveTryOnCategory(category: string) {
  const normalized = normalizeCategoryValue(category);
  return TRY_ON_CAPABLE_CATEGORIES.has(normalized) ? normalized : 'other';
}

function getTryOnAsset(
  product: ProductDetail,
  predicate: (asset: BackendMediaAsset) => boolean
) {
  return product.media?.assets?.find((asset) => Boolean(asset?.url) && predicate(asset));
}

function normalizeFrameGender(value: unknown): ProductFormState['frameGender'] {
  const text = toText(value);
  if (text === 'men' || text === 'women' || text === 'unisex' || text === 'kids') {
    return text;
  }
  return 'unisex';
}

function normalizeHingeType(value: unknown): ProductFormState['frameHingeType'] {
  return toText(value) === 'standard' ? 'standard' : 'spring';
}

function getEffectiveVariants(form: ProductFormState): ProductVariantFormState[] {
  if (Array.isArray(form.variants) && form.variants.length > 0) {
    return form.variants.map((variant, index) => ({
      ...variant,
      id: variant.id || `variant-${index + 1}`,
    }));
  }

  return [
    {
      id: 'variant-1',
      sku: form.variantSku,
      color: form.variantColor,
      size: form.variantSize,
      price: form.price,
      stock: form.stock,
      warehouseLocation: form.variantWarehouseLocation,
      imageUrl: '',
      posterUrl: form.tryOnPosterUrl,
      glbUrl: form.tryOnGlbUrl,
    },
  ];
}

function buildVariantLabel(variant: ProductVariantFormState, index: number) {
  const parts = [toText(variant.color), toText(variant.size)].filter(Boolean);
  if (parts.length > 0) return parts.join(' / ');
  return toText(variant.sku) || `Variant ${index + 1}`;
}

function countMappedTryOnModels(variants: ProductVariantFormState[]) {
  return variants.filter((variant) => Boolean(toText(variant.glbUrl))).length;
}

function buildMediaBundle(form: ProductFormState) {
  const assets: ProductMediaAsset[] = [];
  let order = 0;

  const heroAssetId = form.heroImageUrl ? createObjectId('hero') : '';
  const thumbnailAssetId = form.thumbnailUrl ? createObjectId('thumbnail') : '';
  const galleryAssetIds: string[] = [];
  const variantIds = getEffectiveVariants(form).map((variant, index) => {
    const label = buildVariantLabel(variant, index);
    const imageAssetId = variant.imageUrl ? createObjectId(`${variant.id || 'variant'}-image`, index) : '';
    const glbAssetId = variant.glbUrl ? createObjectId(`${variant.id || 'variant'}-glb`, index) : '';
    const posterUrl =
      toText(variant.posterUrl) ||
      toText(variant.imageUrl) ||
      toText(form.thumbnailUrl) ||
      toText(form.heroImageUrl) ||
      undefined;

    if (variant.imageUrl) {
      assets.push({
        _id: imageAssetId,
        url: variant.imageUrl,
        role: 'gallery',
        assetType: '2d',
        order: order++,
        alt: `${toText(form.name) || 'Product'} ${label} image`,
      });
    }

    if (variant.glbUrl) {
      assets.push({
        _id: glbAssetId,
        url: variant.glbUrl,
        role: 'viewer',
        assetType: '3d',
        order: order++,
        format: 'glb',
        posterUrl,
        ar: {
          glbUrl: variant.glbUrl,
        },
        alt: `${toText(form.name) || 'Product'} ${label} GLB`,
      });
    }

    return {
      image: imageAssetId,
      glb: glbAssetId,
    };
  });

  if (form.heroImageUrl) {
    assets.push({
      _id: heroAssetId,
      url: form.heroImageUrl,
      role: 'hero',
      assetType: '2d',
      order: order++,
      alt: `${toText(form.name) || 'Product'} hero`,
    });
  }

  if (form.thumbnailUrl) {
    assets.push({
      _id: thumbnailAssetId,
      url: form.thumbnailUrl,
      role: 'thumbnail',
      assetType: '2d',
      order: order++,
      alt: `${toText(form.name) || 'Product'} thumbnail`,
    });
  }

  form.galleryUrls.forEach((url, index) => {
    const assetId = createObjectId(`gallery${index}`, index);
    galleryAssetIds.push(assetId);
    assets.push({
      _id: assetId,
      url,
      role: 'gallery',
      assetType: '2d',
      order: order++,
      alt: `${toText(form.name) || 'Product'} gallery ${index + 1}`,
    });
  });

  return {
    assets,
    ids: {
      hero: heroAssetId,
      thumbnail: thumbnailAssetId,
      gallery: galleryAssetIds,
      variants: variantIds,
      tryOnAssetIds: variantIds.flatMap((variant) => [variant.glb]).filter(Boolean),
    },
  };
}

function getAssetUrl(asset?: BackendMediaAsset | null) {
  return toText(asset?.url);
}

function getAssetById(product: ProductDetail, assetId?: string) {
  if (!assetId) return undefined;
  return product.media?.assets?.find((asset) => String(asset?._id || '') === String(assetId));
}

function findVariantAsset(
  product: ProductDetail,
  variant: NonNullable<ProductDetail['variants']>[number] | null | undefined,
  predicate: (asset: BackendMediaAsset) => boolean
) {
  if (!variant?.assetIds?.length) return undefined;
  return variant.assetIds
    .map((assetId) => getAssetById(product, assetId))
    .find((asset): asset is BackendMediaAsset => {
      if (!asset?.url) return false;
      return predicate(asset);
    });
}

function buildFrameSpecsPayload(
  form: ProductFormState,
  resolvedType: string
): ProductUpsertInput['specs'] | undefined {
  if (!TRY_ON_CAPABLE_CATEGORIES.has(resolvedType)) return undefined;

  const shape = toOptionalText(form.frameShape);
  const weightGram = toOptionalNumber(form.frameWeightGram);
  const material = toOptionalText(form.frameMaterial);
  const rimType = toOptionalText(form.frameRimType);
  const bridgeMm = toOptionalNumber(form.dimensionBridgeMm);
  const templeLengthMm = toOptionalNumber(form.dimensionTempleLengthMm);
  const lensWidthMm = toOptionalNumber(form.dimensionLensWidthMm);
  const lensHeightMm = toOptionalNumber(form.dimensionLensHeightMm);
  const uvProtection =
    resolvedType === 'sunglasses' ? toOptionalText(form.lensUvProtection) : undefined;

  const hasAnySpecs = hasAnyFilledValue([
    shape,
    weightGram,
    material,
    rimType,
    bridgeMm,
    templeLengthMm,
    lensWidthMm,
    lensHeightMm,
    uvProtection,
  ]);

  if (!hasAnySpecs) return undefined;

  const specs: ProductUpsertInput['specs'] = {};

  if (hasAnyFilledValue([shape, weightGram])) {
    specs.common = {
      shape,
      weightGram,
    };
  }

  if (hasAnyFilledValue([material, rimType])) {
    specs.frame = {
      material,
      hingeType: normalizeHingeType(form.frameHingeType),
      nosePads: Boolean(form.frameNosePads),
      rimType,
      rxReady: Boolean(form.frameRxReady),
    };
  }

  if (hasAnyFilledValue([bridgeMm, templeLengthMm, lensWidthMm, lensHeightMm])) {
    specs.dimensions = {
      bridgeMm,
      templeLengthMm,
      lensWidthMm,
      lensHeightMm,
    };
  }

  if (uvProtection) {
    specs.lens = {
      uvProtection,
    };
  }

  return Object.keys(specs).length > 0 ? specs : undefined;
}

function buildTryOnInput(
  form: ProductFormState,
  resolvedType: string,
  variants: ProductVariantFormState[],
  assetIds: string[]
): ProductUpsertInput['tryOn'] | undefined {
  if (!form.tryOnEnabled) return undefined;
  if (!TRY_ON_CAPABLE_CATEGORIES.has(resolvedType)) {
    throw new Error('Try-on is only supported for frame or sunglasses products');
  }

  const mappedTryOnModelCount = countMappedTryOnModels(variants);
  if (mappedTryOnModelCount > MAX_TRY_ON_MODELS) {
    throw new Error(`Try-on supports at most ${MAX_TRY_ON_MODELS} mapped models per product`);
  }

  const status = (toText(form.tryOnStatus) || 'draft') as ProductTryOnStatus;
  if (!TRY_ON_STATUSES.includes(status)) {
    throw new Error('Invalid try-on status');
  }

  const firstVariantWithGlb = variants.find((variant) => toText(variant.glbUrl));
  const mappedVariants = variants.filter((variant) => Boolean(toText(variant.glbUrl)));

  if (
    status === 'approved' ||
    status === 'published'
  ) {
    const missingGlbVariant = mappedVariants.find(
      (variant) => !toText(variant.glbUrl)
    );
    if (!firstVariantWithGlb || missingGlbVariant) {
      throw new Error(
        'Published or approved try-on requires at least one GLB asset, and every mapped variant must include GLB'
      );
    }
  }

  const variantNeedingPoster = variants.find((variant) => {
    const has3dAsset = Boolean(toText(variant.glbUrl));
    const hasPoster = Boolean(
      toText(variant.posterUrl) ||
        toText(variant.imageUrl) ||
        toText(form.thumbnailUrl) ||
        toText(form.heroImageUrl)
    );
    return has3dAsset && !hasPoster;
  });
  if (variantNeedingPoster) {
    throw new Error('Try-on 3D assets require a poster image (variant poster, variant image, thumbnail, or hero image)');
  }

  const rejectReason = toOptionalText(form.tryOnRejectReason);
  if (status === 'rejected' && !rejectReason) {
    throw new Error('Reject reason is required when try-on status is rejected');
  }

  return {
    enabled: true,
    status,
    rejectReason,
    arUrl: toOptionalText(form.tryOnArUrl),
    glbUrl: toOptionalText(firstVariantWithGlb?.glbUrl),
    launchUrl: toOptionalText(form.tryOnLaunchUrl),
    effectPath: toOptionalText(form.tryOnEffectPath),
    scene: toOptionalText(form.tryOnScene),
    resourcePaths: parseStringList(form.tryOnResourcePaths),
    assetIds: assetIds.filter(Boolean),
    prefab: {
      rotation: toOptionalText(form.tryOnRotation),
      scale: toOptionalText(form.tryOnScale),
      translation: toOptionalText(form.tryOnTranslation),
      gravity: toOptionalText(form.tryOnGravity),
      cut: toOptionalText(form.tryOnCut),
      usePhysics: Boolean(form.tryOnUsePhysics),
      colliders: [],
    },
  };
}

export function buildMediaAssets(form: ProductFormState): ProductMediaAsset[] {
  return buildMediaBundle(form).assets;
}

export function buildUpsertPayload(
  form: ProductFormState,
  _options: { existingProduct?: ProductDetail | null } = {}
): ProductUpsertInput {
  const resolvedType = resolveTryOnCategory(form.category);
  const { assets, ids } = buildMediaBundle(form);
  const variants = getEffectiveVariants(form);
  const hasBasePrice = Boolean(toText(form.price));
  const resolvedBasePrice = Number(form.price);
  const firstVariantWithPrice = variants.find(
    (variant) => toText(variant.price) && Number.isFinite(Number(variant.price))
  );
  const topLevelPrice =
    hasBasePrice && Number.isFinite(resolvedBasePrice) && resolvedBasePrice >= 0
      ? resolvedBasePrice
      : firstVariantWithPrice != null
        ? Number(firstVariantWithPrice.price)
        : 0;
  const hasVariantStock = variants.some(
    (variant) => toText(variant.stock) && Number.isFinite(Number(variant.stock))
  );
  const topLevelStock = hasVariantStock
    ? variants.reduce((sum, variant) => {
        const value = Number(variant.stock);
        return sum + (toText(variant.stock) && Number.isFinite(value) && value >= 0 ? value : 0);
      }, 0)
    : Number.isFinite(Number(form.stock))
      ? Number(form.stock)
      : 0;

  return {
    name: form.name.trim(),
    brand: form.brand.trim(),
    category: form.category,
    type: resolvedType,
    price: topLevelPrice,
    stock: topLevelStock,
    description: form.description.trim() || undefined,
    imageUrl: form.heroImageUrl || undefined,
    mediaAssets: assets,
    preOrder: {
      enabled: form.preOrderEnabled,
      allowCod: form.preOrderAllowCod,
      depositPercent:
        Number.isFinite(Number(form.preOrderDepositPercent)) &&
        Number(form.preOrderDepositPercent) >= 0
          ? Number(form.preOrderDepositPercent)
          : undefined,
      maxQuantityPerOrder:
        Number.isFinite(Number(form.preOrderMaxQuantityPerOrder)) &&
        Number(form.preOrderMaxQuantityPerOrder) >= 1
          ? Number(form.preOrderMaxQuantityPerOrder)
          : undefined,
      startAt: form.preOrderStartAt || undefined,
      endAt: form.preOrderEndAt || undefined,
      shipFrom: form.preOrderShipFrom || undefined,
      shipTo: form.preOrderShipTo || undefined,
      shippingCollectionTiming: form.preOrderShippingCollectionTiming,
      note: form.preOrderNote.trim() || undefined,
    },
    storeScope: {
      mode: form.storeScopeMode,
      primaryStoreId: toOptionalText(form.primaryStoreId),
      storeIds:
        form.storeScopeMode === 'selected'
          ? Array.from(new Set(form.storeIds.map((id) => toText(id)).filter(Boolean)))
          : [],
      note: toOptionalText(form.storeScopeNote),
    },
    variants: variants.map((variant, index) => ({
      sku: toOptionalText(variant.sku) || `SKU-${Date.now()}-${index + 1}`,
      color: toOptionalText(variant.color),
      size: toOptionalText(variant.size),
      warehouseLocation: toOptionalText(variant.warehouseLocation),
      assetIds: [
        ids.variants[index]?.image,
        ids.variants[index]?.glb,
      ].filter(Boolean),
      price:
        toText(variant.price) &&
        Number.isFinite(Number(variant.price)) &&
        Number(variant.price) >= 0
          ? Number(variant.price)
          : topLevelPrice,
      stock:
        toText(variant.stock) &&
        Number.isFinite(Number(variant.stock)) &&
        Number(variant.stock) >= 0
          ? Number(variant.stock)
          : variants.length === 1 &&
              Number.isFinite(Number(form.stock)) &&
              Number(form.stock) >= 0
            ? Number(form.stock)
            : 0,
    })),
    specs: buildFrameSpecsPayload(form, resolvedType),
    tryOn: buildTryOnInput(form, resolvedType, variants, ids.tryOnAssetIds),
  };
}

export function getRoleUrl(product: { mediaAssets?: ProductMediaAsset[] }, role: ProductMediaAsset['role']) {
  return product.mediaAssets?.find((asset) => asset.role === role)?.url || '';
}

export function getGalleryUrls(product: { mediaAssets?: ProductMediaAsset[] }) {
  return (
    product.mediaAssets
      ?.filter((asset) => asset.role === 'gallery')
      .map((asset) => asset.url) || []
  );
}

export function buildProductFormState(product?: ProductDetail | null): ProductFormState {
  if (!product) return { ...EMPTY_PRODUCT_FORM };

  const firstVariant = product.variants?.[0] || null;
  const specs = (product.specs as Record<string, any>) || {};
  const common = specs.common || {};
  const frame = specs.frame || {};
  const dimensions = specs.dimensions || {};
  const lens = specs.lens || {};
  const tryOn = product.media?.tryOn || {};
  const fallbackThumbnail = getRoleUrl(product, 'thumbnail');
  const fallbackHero = getRoleUrl(product, 'hero') || product.imageUrl;
  const fallbackGlbAsset = getTryOnAsset(
    product,
    (asset) =>
      asset?.assetType === '3d' &&
      ['glb', 'gltf'].includes(String(asset?.format || '').toLowerCase())
  );
  const variants =
    product.variants?.length
      ? product.variants.map((variant, index) => {
          const imageAsset = findVariantAsset(
            product,
            variant,
            (asset) => asset?.assetType === '2d'
          );
          const glbAsset = findVariantAsset(
            product,
            variant,
            (asset) =>
              asset?.assetType === '3d' &&
              ['glb', 'gltf'].includes(String(asset?.format || '').toLowerCase())
          );

          return {
            id: String(variant._id || `variant-${index + 1}`),
            sku: variant.sku || '',
            color: toText(variant.options?.color),
            size: toText(variant.options?.size),
            price: toNumberString(variant.price ?? product.price),
            stock: toNumberString(variant.stock),
            warehouseLocation: variant.warehouseLocation || '',
            imageUrl: getAssetUrl(imageAsset),
            posterUrl:
              toText(glbAsset?.posterUrl) ||
              getAssetUrl(imageAsset) ||
              fallbackThumbnail ||
              fallbackHero,
            glbUrl:
              toText(glbAsset?.ar?.glbUrl) ||
              toText(glbAsset?.['ar.glbUrl']) ||
              getAssetUrl(glbAsset) ||
              (index === 0
                ? toText(fallbackGlbAsset?.ar?.glbUrl) ||
                  toText(fallbackGlbAsset?.['ar.glbUrl']) ||
                  getAssetUrl(fallbackGlbAsset) ||
                  toText(tryOn.glbUrl)
                : ''),
          };
        })
      : [createEmptyVariant(0)];
  const firstVariantGlb = variants.find((variant) => toText(variant.glbUrl))?.glbUrl || '';
  const firstVariantPoster = variants.find((variant) => toText(variant.posterUrl))?.posterUrl || '';
  const totalVariantStock = variants.reduce((sum, variant) => {
    const value = Number(variant.stock);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  return {
    ...EMPTY_PRODUCT_FORM,
    name: product.name,
    brand: product.brand,
    price: String(firstVariant?.price ?? product.price),
    stock: String(totalVariantStock || product.stock),
    category: normalizeCategoryValue(product.category),
    description: product.description || '',
    heroImageUrl: fallbackHero,
    thumbnailUrl: fallbackThumbnail,
    galleryUrls: getGalleryUrls(product),
    preOrderEnabled: Boolean(product.preOrder?.enabled),
    preOrderAllowCod: Boolean(product.preOrder?.allowCod ?? true),
    preOrderDepositPercent:
      product.preOrder?.depositPercent != null ? String(product.preOrder.depositPercent) : '30',
    preOrderMaxQuantityPerOrder:
      product.preOrder?.maxQuantityPerOrder != null
        ? String(product.preOrder.maxQuantityPerOrder)
        : '',
    preOrderStartAt: toDateTimeLocalValue(product.preOrder?.startAt),
    preOrderEndAt: toDateTimeLocalValue(product.preOrder?.endAt),
    preOrderShipFrom: toDateTimeLocalValue(product.preOrder?.shipFrom),
    preOrderShipTo: toDateTimeLocalValue(product.preOrder?.shipTo),
    preOrderShippingCollectionTiming:
      String(product.preOrder?.shippingCollectionTiming || '').trim().toLowerCase() ===
      'with_balance'
        ? 'on_delivery'
        : product.preOrder?.shippingCollectionTiming || 'upfront',
    preOrderNote: product.preOrder?.note || '',
    storeScopeMode: product.storeScope?.mode === 'selected' ? 'selected' : 'all',
    primaryStoreId: toText(product.storeScope?.primaryStoreId),
    storeIds: Array.isArray(product.storeScope?.storeIds)
      ? product.storeScope?.storeIds.map((id) => toText(id)).filter(Boolean)
      : [],
    storeScopeNote: toText(product.storeScope?.note),
    variants,
    variantSku: firstVariant?.sku || '',
    variantColor: toText(firstVariant?.options?.color),
    variantSize: toText(firstVariant?.options?.size),
    variantWarehouseLocation: firstVariant?.warehouseLocation || '',
    frameShape: toText(common.shape),
    frameGender: normalizeFrameGender(common.gender),
    frameWeightGram: toNumberString(common.weightGram),
    frameMaterial: toText(frame.material),
    frameHingeType: normalizeHingeType(frame.hingeType),
    frameRimType: toText(frame.rimType),
    frameNosePads: Boolean(frame.nosePads),
    frameRxReady: frame.rxReady !== false,
    dimensionBridgeMm: toNumberString(dimensions.bridgeMm),
    dimensionTempleLengthMm: toNumberString(dimensions.templeLengthMm),
    dimensionLensWidthMm: toNumberString(dimensions.lensWidthMm),
    dimensionLensHeightMm: toNumberString(dimensions.lensHeightMm),
    lensUvProtection: toText(lens.uvProtection),
    tryOnEnabled: Boolean(tryOn.enabled),
    tryOnStatus: (toText(tryOn.status) as ProductTryOnStatus) || 'draft',
    tryOnRejectReason: toText(tryOn.rejectReason),
    tryOnPosterUrl: firstVariantPoster || fallbackThumbnail || fallbackHero,
    tryOnGlbUrl: firstVariantGlb || toText(tryOn.glbUrl),
    tryOnArUrl: toText(tryOn.arUrl),
    tryOnLaunchUrl: toText(tryOn.launchUrl),
    tryOnEffectPath: toText(tryOn.effectPath),
    tryOnScene: toText(tryOn.scene),
    tryOnResourcePaths: Array.isArray(tryOn.resourcePaths)
      ? tryOn.resourcePaths.join('\n')
      : '',
    tryOnRotation: toText(tryOn.prefab?.rotation),
    tryOnScale: toText(tryOn.prefab?.scale),
    tryOnTranslation: toText(tryOn.prefab?.translation),
    tryOnGravity: toText(tryOn.prefab?.gravity),
    tryOnCut: toText(tryOn.prefab?.cut) || 'head',
    tryOnUsePhysics: Boolean(tryOn.prefab?.usePhysics),
  };
}

export function normalizeCategoryValue(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes('sun')) return 'sunglasses';
  if (lower.includes('frame') || lower.includes('gong')) return 'frame';
  if (lower.includes('lens') || lower.includes('trong')) return 'lens';
  if (lower.includes('access') || lower.includes('phu')) return 'accessory';
  return 'other';
}
