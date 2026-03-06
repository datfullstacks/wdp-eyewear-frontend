import { z } from 'zod';

export const productFilterSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
});

/* ───────── Product Types & Enums ───────── */

export const PRODUCT_TYPES = [
  'sunglasses',
  'frame',
  'lens',
  'contact_lens',
  'accessory',
  'service',
  'bundle',
  'gift_card',
  'other',
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_STATUS_VALUES = [
  'draft',
  'active',
  'inactive',
  'out_of_stock',
] as const;

export const SEASON_VALUES = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'all_season',
] as const;

export const GENDER_VALUES = ['unisex', 'male', 'female', 'kids'] as const;

export const SHAPE_VALUES = [
  'round',
  'square',
  'rectangle',
  'oval',
  'cat_eye',
  'aviator',
  'browline',
  'geometric',
  'wayfarer',
  'wrap',
  'other',
] as const;

export const FRAME_MATERIAL_VALUES = [
  'metal',
  'acetate',
  'titanium',
  'tr90',
  'plastic',
  'wood',
  'carbon_fiber',
  'other',
] as const;

export const RIM_TYPE_VALUES = ['full_rim', 'half_rim', 'rimless'] as const;

export const LENS_TYPE_VALUES = [
  'single_vision',
  'bifocal',
  'progressive',
  'reading',
  'non_prescription',
  'photochromic',
  'polarized',
] as const;

export const LENS_MATERIAL_VALUES = [
  'cr39',
  'polycarbonate',
  'trivex',
  'high_index',
  'glass',
] as const;

/* ───────── Variant Schema ───────── */

export const variantFormSchema = z.object({
  sku: z.string().min(1, 'SKU là bắt buộc'),
  color: z.string().optional(),
  size: z.string().optional(),
  price: z.coerce.number().min(0, 'Giá ≥ 0').optional(),
  stock: z.coerce.number().int().min(0, 'Tồn kho ≥ 0'),
});

export type VariantFormValues = z.infer<typeof variantFormSchema>;

/* ───────── Specs Sub-Schemas ───────── */

const commonSpecsSchema = z.object({
  shape: z.string().optional(),
  gender: z.string().optional(),
  weightGram: z.coerce.number().min(0).optional(),
});

const dimensionsSchema = z.object({
  frameWidthMm: z.coerce.number().min(0).optional(),
  bridgeMm: z.coerce.number().min(0).optional(),
  templeLengthMm: z.coerce.number().min(0).optional(),
  lensWidthMm: z.coerce.number().min(0).optional(),
  lensHeightMm: z.coerce.number().min(0).optional(),
  fit: z.string().optional(),
});

const frameSpecsSchema = z.object({
  material: z.string().optional(),
  hingeType: z.string().optional(),
  rimType: z.string().optional(),
  nosePads: z.boolean().optional(),
  rxReady: z.boolean().optional(),
  polarized: z.boolean().optional(),
  uvProtection: z.string().optional(),
});

const lensSpecsSchema = z.object({
  lensType: z.string().optional(),
  prescriptionRange: z.string().optional(),
  index: z.string().optional(),
  material: z.string().optional(),
  blueLightFilter: z.boolean().optional(),
  coatings: z.string().optional(),
});

const contactLensSpecsSchema = z.object({
  powerRange: z.string().optional(),
  replacementCycle: z.string().optional(),
  baseCurveMm: z.string().optional(),
  diameterMm: z.string().optional(),
  waterContentPercent: z.coerce.number().min(0).max(100).optional(),
});

const accessorySpecsSchema = z.object({
  accessoryType: z.string().optional(),
  material: z.string().optional(),
  compatibleWith: z.string().optional(),
});

/* ───────── Main Product Upsert Schema ───────── */

export const productUpsertSchema = z
  .object({
    // Basic
    type: z.enum(PRODUCT_TYPES, { message: 'Chọn loại sản phẩm' }),
    name: z.string().min(1, 'Tên sản phẩm là bắt buộc').max(200),
    slug: z.string().optional(),
    description: z.string().max(5000).optional(),
    brand: z.string().min(1, 'Thương hiệu là bắt buộc').max(100),
    status: z.enum(PRODUCT_STATUS_VALUES).optional(),

    // Pricing
    basePrice: z.coerce.number().min(0, 'Giá gốc ≥ 0'),
    salePrice: z.coerce.number().min(0).optional(),
    msrp: z.coerce.number().min(0).optional(),

    // Inventory
    inventoryTrack: z.boolean().optional(),
    inventoryThreshold: z.coerce.number().int().min(0).optional(),

    // Variants
    variants: z.array(variantFormSchema).optional(),

    // Pre-order
    preOrderEnabled: z.boolean().optional(),
    preOrderStartAt: z.string().optional(),
    preOrderEndAt: z.string().optional(),
    preOrderShipFrom: z.string().optional(),
    preOrderShipTo: z.string().optional(),
    preOrderDepositPercent: z.coerce.number().min(0).max(100).optional(),
    preOrderMaxQty: z.coerce.number().int().min(1).optional(),
    preOrderAllowCod: z.boolean().optional(),
    preOrderNote: z.string().max(500).optional(),

    // SEO
    modelCode: z.string().max(50).optional(),
    collections: z.string().optional(),
    season: z.string().optional(),
    keywords: z.string().optional(),
    countryOfOrigin: z.string().max(100).optional(),

    // Fulfillment (manager-editable subset)
    returnWindowDays: z.coerce.number().int().min(0).optional(),
    warrantyMonths: z.coerce.number().int().min(0).optional(),

    // Compatibility
    compatibilityNotes: z.string().max(1000).optional(),

    // PresetCombo
    presetComboEnabled: z.boolean().optional(),
    comboFrameProductId: z.string().optional(),
    comboLensProductId: z.string().optional(),
    comboDefaultNonRx: z.boolean().optional(),

    // Media
    heroImageUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    galleryUrls: z.array(z.string()).optional(),

    // Try-on
    tryOnEnabled: z.boolean().optional(),

    // Specs - common
    specsCommon: commonSpecsSchema.optional(),
    specsDimensions: dimensionsSchema.optional(),
    specsFrame: frameSpecsSchema.optional(),
    specsLens: lensSpecsSchema.optional(),
    specsContactLens: contactLensSpecsSchema.optional(),
    specsAccessory: accessorySpecsSchema.optional(),

    // Services
    servicesIncluded: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.salePrice != null && data.basePrice != null) {
        return data.salePrice <= data.basePrice;
      }
      return true;
    },
    { message: 'Giá khuyến mãi không được lớn hơn giá gốc', path: ['salePrice'] }
  );

export type ProductUpsertFormValues = z.infer<typeof productUpsertSchema>;

export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
