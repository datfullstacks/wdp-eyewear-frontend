import type { ProductMediaAsset, ProductUpsertInput } from '@/api';
import type { ProductFormState } from '@/components/organisms/manager';
import type { ProductUpsertFormValues } from '@/lib/validation/product.schema';

export function buildMediaAssets(form: ProductFormState): ProductMediaAsset[] {
  const assets: ProductMediaAsset[] = [];
  
  if (form.heroImageUrl) {
    assets.push({ url: form.heroImageUrl, role: 'hero', assetType: '2d' });
  }
  if (form.thumbnailUrl) {
    assets.push({ url: form.thumbnailUrl, role: 'thumbnail', assetType: '2d' });
  }
  form.galleryUrls.forEach((url) => {
    assets.push({ url, role: 'gallery', assetType: '2d' });
  });
  
  return assets;
}

export function buildUpsertPayload(form: ProductFormState): ProductUpsertInput {
  return {
    name: form.name.trim(),
    brand: form.brand.trim(),
    price: Number(form.price),
    stock: Number(form.stock),
    category: form.category,
    description: form.description.trim() || undefined,
    imageUrl: form.heroImageUrl || undefined,
    mediaAssets: buildMediaAssets(form),
  };
}

/** Build media assets from full form values */
function buildMediaAssetsFromFull(values: ProductUpsertFormValues): ProductMediaAsset[] {
  const assets: ProductMediaAsset[] = [];
  if (values.heroImageUrl) {
    assets.push({ url: values.heroImageUrl, role: 'hero', assetType: '2d', order: 0 });
  }
  if (values.thumbnailUrl) {
    assets.push({ url: values.thumbnailUrl, role: 'thumbnail', assetType: '2d', order: 1 });
  }
  (values.galleryUrls || []).forEach((url, i) => {
    if (url) assets.push({ url, role: 'gallery', assetType: '2d', order: i + 2 });
  });
  return assets;
}

/** Build specs object from flat form values */
function buildSpecs(values: ProductUpsertFormValues): Record<string, unknown> | undefined {
  const specs: Record<string, unknown> = {};
  let hasAny = false;

  if (values.specsCommon) {
    const c = values.specsCommon;
    if (c.shape || c.gender || c.weightGram != null) {
      specs.common = {
        ...(c.shape ? { shape: c.shape } : {}),
        ...(c.gender ? { gender: c.gender } : {}),
        ...(c.weightGram != null ? { weightGram: c.weightGram } : {}),
      };
      hasAny = true;
    }
  }

  if (values.specsDimensions) {
    const d = values.specsDimensions;
    const dimObj: Record<string, unknown> = {};
    if (d.frameWidthMm != null) dimObj.frameWidthMm = d.frameWidthMm;
    if (d.bridgeMm != null) dimObj.bridgeMm = d.bridgeMm;
    if (d.templeLengthMm != null) dimObj.templeLengthMm = d.templeLengthMm;
    if (d.lensWidthMm != null) dimObj.lensWidthMm = d.lensWidthMm;
    if (d.lensHeightMm != null) dimObj.lensHeightMm = d.lensHeightMm;
    if (d.fit) dimObj.fit = d.fit;
    if (Object.keys(dimObj).length > 0) {
      specs.dimensions = dimObj;
      hasAny = true;
    }
  }

  if (values.specsFrame) {
    const f = values.specsFrame;
    const fObj: Record<string, unknown> = {};
    if (f.material) fObj.material = f.material;
    if (f.hingeType) fObj.hingeType = f.hingeType;
    if (f.rimType) fObj.rimType = f.rimType;
    if (f.nosePads != null) fObj.nosePads = f.nosePads;
    if (f.rxReady != null) fObj.rxReady = f.rxReady;
    if (f.polarized != null) fObj.polarized = f.polarized;
    if (f.uvProtection) fObj.uvProtection = f.uvProtection;
    if (Object.keys(fObj).length > 0) {
      specs.frame = fObj;
      hasAny = true;
    }
  }

  if (values.specsLens) {
    const l = values.specsLens;
    const lObj: Record<string, unknown> = {};
    if (l.lensType) lObj.lensType = l.lensType;
    if (l.prescriptionRange) lObj.prescriptionRange = l.prescriptionRange;
    if (l.index) lObj.index = l.index;
    if (l.material) lObj.material = l.material;
    if (l.blueLightFilter != null) lObj.blueLightFilter = l.blueLightFilter;
    if (l.coatings) lObj.coatings = l.coatings;
    if (Object.keys(lObj).length > 0) {
      specs.lens = lObj;
      hasAny = true;
    }
  }

  if (values.specsContactLens) {
    const cl = values.specsContactLens;
    const clObj: Record<string, unknown> = {};
    if (cl.powerRange) clObj.powerRange = cl.powerRange;
    if (cl.replacementCycle) clObj.replacementCycle = cl.replacementCycle;
    if (cl.baseCurveMm) clObj.baseCurveMm = cl.baseCurveMm;
    if (cl.diameterMm) clObj.diameterMm = cl.diameterMm;
    if (cl.waterContentPercent != null) clObj.waterContentPercent = cl.waterContentPercent;
    if (Object.keys(clObj).length > 0) {
      specs.contactLens = clObj;
      hasAny = true;
    }
  }

  if (values.specsAccessory) {
    const a = values.specsAccessory;
    const aObj: Record<string, unknown> = {};
    if (a.accessoryType) aObj.accessoryType = a.accessoryType;
    if (a.material) aObj.material = a.material;
    if (a.compatibleWith) aObj.compatibleWith = a.compatibleWith;
    if (Object.keys(aObj).length > 0) {
      specs.accessory = aObj;
      hasAny = true;
    }
  }

  return hasAny ? specs : undefined;
}

/** Slug generation */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Build full API payload from form values */
export function buildFullUpsertPayload(
  values: ProductUpsertFormValues,
  mode: 'create' | 'update' = 'create'
): ProductUpsertInput {
  const mediaAssets = buildMediaAssetsFromFull(values);
  const totalStock = (values.variants || []).reduce((s, v) => s + Number(v.stock || 0), 0);
  const specs = buildSpecs(values);

  return {
    name: values.name.trim(),
    brand: values.brand.trim(),
    price: values.basePrice,
    stock: totalStock || 0,
    type: values.type,
    slug: values.slug || generateSlug(values.name),
    status: mode === 'create' ? (values.status || 'draft') : values.status,
    description: values.description?.trim() || undefined,
    category: values.type,
    salePrice: values.salePrice,
    msrp: values.msrp,
    inventoryTrack: values.inventoryTrack ?? true,
    inventoryThreshold: values.inventoryThreshold,
    imageUrl: values.heroImageUrl || undefined,
    mediaAssets,
    variants: values.variants?.map((v) => ({
      sku: v.sku,
      color: v.color,
      size: v.size,
      price: v.price,
      stock: v.stock,
    })),
    preOrder: values.preOrderEnabled
      ? {
          enabled: true,
          startAt: values.preOrderStartAt || undefined,
          endAt: values.preOrderEndAt || undefined,
          shipFrom: values.preOrderShipFrom || undefined,
          shipTo: values.preOrderShipTo || undefined,
          depositPercent: values.preOrderDepositPercent,
          maxQuantityPerOrder: values.preOrderMaxQty,
          allowCod: values.preOrderAllowCod ?? true,
          note: values.preOrderNote || undefined,
        }
      : undefined,
    fulfillment:
      values.returnWindowDays != null || values.warrantyMonths != null
        ? {
            returnWindowDays: values.returnWindowDays,
            warrantyMonths: values.warrantyMonths,
          }
        : undefined,
    seo: {
      modelCode: values.modelCode || undefined,
      collections: values.collections
        ? values.collections.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
      season: values.season || undefined,
      keywords: values.keywords
        ? values.keywords.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
      countryOfOrigin: values.countryOfOrigin || undefined,
    },
    compatibility: values.compatibilityNotes ? { notes: values.compatibilityNotes } : undefined,
    presetCombo: values.presetComboEnabled
      ? {
          enabled: true,
          frameProductId: values.comboFrameProductId || undefined,
          lensProductId: values.comboLensProductId || undefined,
          defaultNonPrescription: values.comboDefaultNonRx ?? true,
        }
      : undefined,
    tryOn: values.tryOnEnabled ? { enabled: true } : undefined,
    specs,
    servicesIncluded: values.servicesIncluded
      ? values.servicesIncluded.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined,
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

export function normalizeCategoryValue(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes('sun')) return 'sunglasses';
  if (lower.includes('frame') || lower.includes('gong')) return 'frame';
  if (lower.includes('lens') || lower.includes('trong')) return 'lens';
  if (lower.includes('contact')) return 'contact_lens';
  if (lower.includes('access') || lower.includes('phu')) return 'accessory';
  return 'other';
}
