'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms';
import { MAX_TRY_ON_MODELS } from '@/lib/productHelpers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, XCircle } from 'lucide-react';

// ── XYZ helpers ────────────────────────────────────────────────────────────────
// Values in state are stored as space-separated strings (e.g. "85 181 90")
// to keep the API contract unchanged.
function parseXYZ(value: string): [string, string, string] {
  const parts = String(value || '').trim().split(/\s+/);
  return [parts[0] ?? '', parts[1] ?? '', parts[2] ?? ''];
}
function formatXYZ(x: string, y: string, z: string): string {
  return `${x} ${y} ${z}`;
}
import type {
  PreOrderShippingCollectionTiming,
  ProductMediaAsset,
  ProductTryOnStatus,
  StoreRecord,
} from '@/api';

export interface ProductVariantFormState {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: string;
  stock: string;
  warehouseLocation: string;
  imageUrl: string;
  posterUrl: string;
  glbUrl: string;
}

export interface ProductFormState {
  name: string;
  brand: string;
  price: string;
  stock: string;
  category: string;
  description: string;
  heroImageUrl: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  preOrderEnabled: boolean;
  preOrderAllowCod: boolean;
  preOrderDepositPercent: string;
  preOrderMaxQuantityPerOrder: string;
  preOrderStartAt: string;
  preOrderEndAt: string;
  preOrderShipFrom: string;
  preOrderShipTo: string;
  preOrderShippingCollectionTiming: PreOrderShippingCollectionTiming;
  preOrderNote: string;
  storeScopeMode: 'all' | 'selected';
  primaryStoreId: string;
  storeIds: string[];
  storeScopeNote: string;
  variants: ProductVariantFormState[];
  variantSku: string;
  variantColor: string;
  variantSize: string;
  variantWarehouseLocation: string;
  frameShape: string;
  frameGender: 'men' | 'women' | 'unisex' | 'kids';
  frameWeightGram: string;
  frameMaterial: string;
  frameHingeType: 'standard' | 'spring';
  frameRimType: string;
  frameNosePads: boolean;
  frameRxReady: boolean;
  dimensionBridgeMm: string;
  dimensionTempleLengthMm: string;
  dimensionLensWidthMm: string;
  dimensionLensHeightMm: string;
  lensUvProtection: string;
  tryOnEnabled: boolean;
  tryOnStatus: ProductTryOnStatus;
  tryOnRejectReason: string;
  tryOnPosterUrl: string;
  tryOnGlbUrl: string;
  tryOnArUrl: string;
  tryOnLaunchUrl: string;
  tryOnEffectPath: string;
  tryOnScene: string;
  tryOnResourcePaths: string;
  tryOnRotation: string;
  tryOnScale: string;
  tryOnTranslation: string;
  tryOnGravity: string;
  tryOnCut: string;
  tryOnUsePhysics: boolean;
}

export const CATEGORY_OPTIONS = [
  { value: 'sunglasses', label: 'Kinh mat' },
  { value: 'frame', label: 'Gong kinh' },
  { value: 'lens', label: 'Trong kinh' },
  { value: 'accessory', label: 'Phu kien' },
  { value: 'other', label: 'Khac' },
];

const TRY_ON_STATUS_OPTIONS: Array<{ value: ProductTryOnStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Cho review' },
  { value: 'approved', label: 'Da duyet' },
  { value: 'published', label: 'Dang hien thi' },
  { value: 'rejected', label: 'Tu choi' },
  { value: 'archived', label: 'Luu tru' },
];

const GENDER_OPTIONS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Kids' },
];

const HINGE_TYPE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'spring', label: 'Spring' },
];

interface ProductFormProps {
  formData: ProductFormState;
  storeOptions?: StoreRecord[];
  availableTryOnStatuses?: ProductTryOnStatus[];
  isSubmitting: boolean;
  uploadingKey: string;
  onChange: (updater: (prev: ProductFormState) => ProductFormState) => void;
  onUploadSingle: (file: File, role: ProductMediaAsset['role']) => Promise<void>;
  onUploadGallery: (files: FileList | null) => Promise<void>;
  onUploadVariantAsset: (
    file: File,
    variantId: string,
    field: 'imageUrl' | 'posterUrl' | 'glbUrl'
  ) => Promise<void>;
  onRemoveGallery: (index: number) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
}

export function ProductForm({
  formData,
  storeOptions = [],
  availableTryOnStatuses,
  isSubmitting,
  uploadingKey,
  onChange,
  onUploadSingle,
  onUploadGallery,
  onUploadVariantAsset,
  onRemoveGallery,
  onCancel,
  onSubmit,
  submitLabel = 'Save',
}: ProductFormProps) {
  const getVariantUploadKey = (
    variantId: string,
    suffix: 'image' | 'poster' | 'glb'
  ) => `variant-${variantId || 'unknown'}-${suffix}`;
  const tF = useTranslations('manager.products.form');
  const priceValue = Number(formData.price || 0);
  const previewBasePrice = Number.isFinite(priceValue) ? Math.max(0, priceValue) : 0;
  const previewDepositPercent = formData.preOrderEnabled
    ? Math.max(0, Math.min(100, Number(formData.preOrderDepositPercent || 0)))
    : 100;
  const previewPayNow = Math.round(
    previewBasePrice * (previewDepositPercent / 100)
  );
  const previewPayLater = Math.max(0, previewBasePrice - previewPayNow);
  const supportsTryOn =
    formData.category === 'frame' || formData.category === 'sunglasses';
  const variantRows = formData.variants || [];
  const hasFrameSpecs = [
    formData.frameShape,
    formData.frameWeightGram,
    formData.frameMaterial,
    formData.frameRimType,
    formData.dimensionBridgeMm,
    formData.dimensionTempleLengthMm,
    formData.dimensionLensWidthMm,
    formData.dimensionLensHeightMm,
    formData.lensUvProtection,
  ].some((value) => Boolean(String(value || '').trim()));
  const hasTryOnAdvancedSettings =
    [
      formData.tryOnScene,
      formData.tryOnArUrl,
      formData.tryOnLaunchUrl,
      formData.tryOnEffectPath,
      formData.tryOnResourcePaths,
      formData.tryOnRotation,
      formData.tryOnScale,
      formData.tryOnTranslation,
      formData.tryOnGravity,
      formData.tryOnCut,
    ].some((value) => Boolean(String(value || '').trim())) || formData.tryOnUsePhysics;
  const [isTryOnAdvancedOpen, setIsTryOnAdvancedOpen] = useState(hasTryOnAdvancedSettings);
  const tryOnStatusOptions = availableTryOnStatuses?.length
    ? TRY_ON_STATUS_OPTIONS.filter((option) => availableTryOnStatuses.includes(option.value))
    : TRY_ON_STATUS_OPTIONS;
  const mappedTryOnModelCount = variantRows.filter(
    (variant) => Boolean(String(variant.glbUrl || '').trim())
  ).length;
  const tryOnModelLimitReached = mappedTryOnModelCount >= MAX_TRY_ON_MODELS;

  useEffect(() => {
    if (hasTryOnAdvancedSettings) {
      setIsTryOnAdvancedOpen(true);
    }
  }, [hasTryOnAdvancedSettings]);

  const updateVariant = (
    index: number,
    updater: (variant: ProductVariantFormState) => ProductVariantFormState
  ) => {
    onChange((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) =>
        variantIndex === index ? updater(variant) : variant
      ),
    }));
  };

  const addVariant = () => {
    onChange((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `variant-${Date.now()}-${prev.variants.length + 1}`,
          sku: '',
          color: '',
          size: '',
          price: prev.price || '',
          stock: '',
          warehouseLocation: '',
          imageUrl: '',
          posterUrl: '',
          glbUrl: '',
        },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    if (variantRows.length <= 1) return;
    onChange((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Name + Brand */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={tF('productName')}
          value={formData.name}
          onChange={(e) => onChange((prev) => ({ ...prev, name: e.target.value }))}
          placeholder={tF('productNamePlaceholder')}
          required
        />
        <Input
          label={tF('brand')}
          value={formData.brand}
          onChange={(e) => onChange((prev) => ({ ...prev, brand: e.target.value }))}
          placeholder={tF('brandPlaceholder')}
        />
      </div>

      {/* Row 2: Price + Category */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={tF('price')}
          type="number"
          value={formData.price}
          onChange={(e) => onChange((prev) => ({ ...prev, price: e.target.value }))}
          placeholder="0"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">{tF('category')}</label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              onChange((prev) => ({
                ...prev,
                category: value,
                tryOnEnabled:
                  value === 'frame' || value === 'sunglasses' ? prev.tryOnEnabled : false,
              }))
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder={tF('categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{tF('description')}</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          placeholder={tF('descriptionPlaceholder')}
        />
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{tF('storeNetwork')}</p>
          <p className="mt-0.5 text-xs text-gray-400">{tF('storeNetworkDesc')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">{tF('storeScope')}</label>
            <Select
              value={formData.storeScopeMode}
              onValueChange={(value) =>
                onChange((prev) => ({
                  ...prev,
                  storeScopeMode: value === 'selected' ? 'selected' : 'all',
                  storeIds:
                    value === 'selected'
                      ? prev.storeIds
                      : [],
                  primaryStoreId:
                    value === 'selected'
                      ? prev.primaryStoreId
                      : '',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={tF('storeScope')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tF('storeAll')}</SelectItem>
                <SelectItem value="selected">{tF('storeSelected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            label={tF('storeScopeNote')}
            value={formData.storeScopeNote}
            onChange={(event) => onChange((prev) => ({ ...prev, storeScopeNote: event.target.value }))}
            placeholder={tF('storeScopeNotePlaceholder')}
          />
        </div>

        {formData.storeScopeMode === 'all' ? (
          <p className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">{tF('storeAllNote')}</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{tF('primaryStore')}</label>
              <Select
                value={formData.primaryStoreId || '__none'}
                onValueChange={(value) =>
                  onChange((prev) => {
                    const nextPrimary = value === '__none' ? '' : value;
                    const nextStoreIds = nextPrimary
                      ? Array.from(new Set([...prev.storeIds, nextPrimary]))
                      : prev.storeIds;
                    return {
                      ...prev,
                      primaryStoreId: nextPrimary,
                      storeIds: nextStoreIds,
                    };
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={tF('primaryStorePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">{tF('storeNone')}</SelectItem>
                  {storeOptions.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} ({store.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">{tF('storeList')}</p>
              {storeOptions.length === 0 ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{tF('noStore')}</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {storeOptions.map((store) => {
                    const checked = formData.storeIds.includes(store.id);
                    return (
                      <label
                        key={store.id}
                        className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-3 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            onChange((prev) => {
                              const nextStoreIds = event.target.checked
                                ? Array.from(new Set([...prev.storeIds, store.id]))
                                : prev.storeIds.filter((id) => id !== store.id);
                              const nextPrimary =
                                prev.primaryStoreId === store.id && !event.target.checked
                                  ? ''
                                  : prev.primaryStoreId;
                              return {
                                ...prev,
                                storeIds: nextStoreIds,
                                primaryStoreId: nextPrimary,
                              };
                            })
                          }
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800">
                            {store.name} ({store.code})
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {[store.addressLine1, store.district, store.city].filter(Boolean).join(', ') || tF('noAddress')}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{tF('variantsTitle')}</p>
            <p className="mt-1 text-xs text-gray-500">{tF('variantsDesc')}</p>
            <p className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
              {tF('inventoryManagedNote')}
            </p>
            <p className="mt-2 text-xs font-medium text-amber-800">
              {tF('tryOnLimit', { max: MAX_TRY_ON_MODELS, current: mappedTryOnModelCount })}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addVariant}>{tF('addVariant')}</Button>
        </div>

        <div className="space-y-4">
          {variantRows.map((variant, index) => (
            <div
              key={variant.id || `${variant.sku}-${index}`}
              className="rounded-md border border-gray-200 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">{tF('variant')} {index + 1}</p>
                {variantRows.length > 1 ? (
                  <Button type="button" variant="outline" onClick={() => removeVariant(index)}>{tF('removeVariant')}</Button>
                ) : null}
              </div>

              {/* Row 1: identity — 4 cols */}
              <div className="grid grid-cols-4 gap-3">
                <Input label={tF('sku')} value={variant.sku} onChange={(e) => updateVariant(index, (c) => ({ ...c, sku: e.target.value }))} placeholder="SKU-BLK-M" />
                <Input label={tF('warehouse')} value={variant.warehouseLocation} onChange={(e) => updateVariant(index, (c) => ({ ...c, warehouseLocation: e.target.value }))} placeholder="HCM-01" />
                <Input label={tF('color')} value={variant.color} onChange={(e) => updateVariant(index, (c) => ({ ...c, color: e.target.value }))} placeholder="Black" />
                <Input label={tF('size')} value={variant.size} onChange={(e) => updateVariant(index, (c) => ({ ...c, size: e.target.value }))} placeholder="M" />
              </div>
              {/* Row 2: price */}
              <div className="grid grid-cols-1 gap-3">
                <Input label={tF('variantPrice')} type="number" value={variant.price} onChange={(e) => updateVariant(index, (c) => ({ ...c, price: e.target.value }))} placeholder={formData.price || '0'} />
              </div>

              {/* Asset uploads: Image | Poster | GLB in 3 cols */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                {/* Variant image */}
                <div className="rounded-md border border-gray-100 bg-gray-50">
                  <label className="flex cursor-pointer flex-col items-center gap-1.5 p-2 text-xs font-medium text-gray-500 hover:text-amber-600">
                    {variant.imageUrl ? (
                      <img src={variant.imageUrl} alt={`Variant ${index + 1}`} className="h-20 w-full rounded object-cover" />
                    ) : (
                      <div className="flex h-20 w-full flex-col items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-400">
                        <Upload className="h-5 w-5" />
                      <span className="mt-1 text-xs">{tF('variantImage')}</span>
                      </div>
                    )}
                    <span className="text-xs">{variant.imageUrl ? tF('changeImage') : tF('upload')}</span>
                    <input
                      type="file" accept="image/*"
                      disabled={isSubmitting || uploadingKey === getVariantUploadKey(variant.id, 'image')}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUploadVariantAsset(f, variant.id, 'imageUrl'); }}
                      className="hidden"
                    />
                  </label>
                  {variant.imageUrl && (
                    <input
                      type="text" value={variant.imageUrl}
                      onChange={(e) => updateVariant(index, (c) => ({ ...c, imageUrl: e.target.value }))}
                      className="w-full rounded-b-md border-t border-gray-200 px-2 py-1 text-xs text-gray-500 focus:border-amber-400 focus:outline-none"
                      placeholder="URL..."
                    />
                  )}
                </div>

                {/* Poster image */}
                <div className="rounded-md border border-gray-100 bg-gray-50">
                  <label className="flex cursor-pointer flex-col items-center gap-1.5 p-2 text-xs font-medium text-gray-500 hover:text-amber-600">
                    {variant.posterUrl ? (
                      <img src={variant.posterUrl} alt={`Poster ${index + 1}`} className="h-20 w-full rounded object-cover" />
                    ) : (
                      <div className="flex h-20 w-full flex-col items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-400">
                        <Upload className="h-5 w-5" />
                      <span className="mt-1 text-xs">{tF('posterImage')}</span>
                      </div>
                    )}
                    <span className="text-xs">{variant.posterUrl ? tF('changeImage') : tF('upload')}</span>
                    <input
                      type="file" accept="image/*"
                      disabled={isSubmitting || uploadingKey === getVariantUploadKey(variant.id, 'poster')}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUploadVariantAsset(f, variant.id, 'posterUrl'); }}
                      className="hidden"
                    />
                  </label>
                  {variant.posterUrl && (
                    <input
                      type="text" value={variant.posterUrl}
                      onChange={(e) => updateVariant(index, (c) => ({ ...c, posterUrl: e.target.value }))}
                      className="w-full rounded-b-md border-t border-gray-200 px-2 py-1 text-xs text-gray-500 focus:border-amber-400 focus:outline-none"
                      placeholder="URL..."
                    />
                  )}
                </div>

                {/* GLB asset */}
                <div className="rounded-md border border-gray-100 bg-gray-50">
                  <label className="flex cursor-pointer flex-col items-center gap-1.5 p-2 text-xs font-medium text-gray-500 hover:text-amber-600">
                    <div className={`flex h-20 w-full flex-col items-center justify-center rounded border-2 text-center ${
                      variant.glbUrl ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-dashed border-gray-200 text-gray-400'
                    }`}>
                      <Upload className="h-5 w-5" />
                      <span className="mt-1 text-xs">{variant.glbUrl ? tF('glbDone') : tF('glbAsset')}</span>
                    </div>
                    <span className="text-xs">{variant.glbUrl ? tF('changeGlb') : tF('upload')}</span>
                    <input
                      type="file" accept=".glb,.gltf"
                      disabled={isSubmitting || uploadingKey === getVariantUploadKey(variant.id, 'glb')}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUploadVariantAsset(f, variant.id, 'glbUrl'); }}
                      className="hidden"
                    />
                  </label>
                  {variant.glbUrl && (
                    <input
                      type="text" value={variant.glbUrl}
                      onChange={(e) => updateVariant(index, (c) => ({ ...c, glbUrl: e.target.value }))}
                      className="w-full rounded-b-md border-t border-gray-200 px-2 py-1 text-xs text-gray-500 focus:border-amber-400 focus:outline-none"
                      placeholder="https://...glb"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {supportsTryOn ? (
        <div className="rounded-md border border-gray-200 p-3">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{tF('frameSpecsTitle')}</p>
            <p className="mt-0.5 text-xs text-gray-400">{tF('frameSpecsDesc')}</p>
          </div>

          <details open={hasFrameSpecs} className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              {hasFrameSpecs ? tF('frameSpecsHasData') : tF('frameSpecsEmpty')}
            </summary>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input
                label="Shape"
                value={formData.frameShape}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, frameShape: event.target.value }))
                }
                placeholder="rectangle"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <Select
                  value={formData.frameGender}
                  onValueChange={(value) =>
                    onChange((prev) => ({
                      ...prev,
                      frameGender: value as ProductFormState['frameGender'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                label="Weight (gram)"
                type="number"
                value={formData.frameWeightGram}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    frameWeightGram: event.target.value,
                  }))
                }
                placeholder="22"
              />
              <Input
                label="Frame material"
                value={formData.frameMaterial}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    frameMaterial: event.target.value,
                  }))
                }
                placeholder="acetate"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Hinge type
                </label>
                <Select
                  value={formData.frameHingeType}
                  onValueChange={(value) =>
                    onChange((prev) => ({
                      ...prev,
                      frameHingeType: value as ProductFormState['frameHingeType'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hinge type" />
                  </SelectTrigger>
                  <SelectContent>
                    {HINGE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                label="Rim type"
                value={formData.frameRimType}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    frameRimType: event.target.value,
                  }))
                }
                placeholder="full"
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input
                label="Bridge (mm)"
                type="number"
                value={formData.dimensionBridgeMm}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    dimensionBridgeMm: event.target.value,
                  }))
                }
                placeholder="18"
              />
              <Input
                label="Temple length (mm)"
                type="number"
                value={formData.dimensionTempleLengthMm}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    dimensionTempleLengthMm: event.target.value,
                  }))
                }
                placeholder="145"
              />
              <Input
                label="Lens width (mm)"
                type="number"
                value={formData.dimensionLensWidthMm}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    dimensionLensWidthMm: event.target.value,
                  }))
                }
                placeholder="52"
              />
              <Input
                label="Lens height (mm)"
                type="number"
                value={formData.dimensionLensHeightMm}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    dimensionLensHeightMm: event.target.value,
                  }))
                }
                placeholder="40"
              />

              {formData.category === 'sunglasses' ? (
                <Input
                  label="UV protection"
                  value={formData.lensUvProtection}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      lensUvProtection: event.target.value,
                    }))
                  }
                  placeholder="UV400"
                />
              ) : null}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.frameNosePads}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      frameNosePads: event.target.checked,
                    }))
                  }
                />
                Has nose pads
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.frameRxReady}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      frameRxReady: event.target.checked,
                    }))
                  }
                />
                RX ready
              </label>
            </div>
          </details>
        </div>
      ) : null}

      <div className="rounded-md border border-gray-200 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{tF('preOrderTitle')}</p>
            <p className="mt-0.5 text-xs text-gray-400">{tF('preOrderDesc')}</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={formData.preOrderEnabled} onChange={(e) => onChange((prev) => ({ ...prev, preOrderEnabled: e.target.checked }))} />
            {tF('enablePreOrder')}
          </label>
        </div>

        {formData.preOrderEnabled ? (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Deposit percent"
                type="number"
                min={0}
                max={100}
                value={formData.preOrderDepositPercent}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    preOrderDepositPercent: event.target.value,
                  }))
                }
                placeholder="30"
              />
              <Input
                label="Max qty / order"
                type="number"
                min={1}
                value={formData.preOrderMaxQuantityPerOrder}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    preOrderMaxQuantityPerOrder: event.target.value,
                  }))
                }
                placeholder="2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start at"
                type="datetime-local"
                value={formData.preOrderStartAt}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    preOrderStartAt: event.target.value,
                  }))
                }
              />
              <Input
                label="End at"
                type="datetime-local"
                value={formData.preOrderEndAt}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    preOrderEndAt: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ship from"
                type="datetime-local"
                value={formData.preOrderShipFrom}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    preOrderShipFrom: event.target.value,
                  }))
                }
              />
              <Input
                label="Ship to"
                type="datetime-local"
                value={formData.preOrderShipTo}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    preOrderShipTo: event.target.value,
                  }))
                }
              />
            </div>

            <p className="text-xs text-gray-500">
              Neu chua biet lich giao du kien, co the de trong Ship from va Ship to roi cap nhat sau.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Shipping collection timing
                </label>
                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900">
                  Collect upfront with deposit
                </div>
              </div>

              <div className="flex items-end">
                <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-900">
                  Remaining balance can be collected by COD in V1. Shipping fee stays in the upfront deposit.
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Pre-order note
              </label>
              <textarea
                value={formData.preOrderNote}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    preOrderNote: event.target.value,
                  }))
                }
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                placeholder="Optional customer-facing note"
              />
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-900">
                Payment preview for one product
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-amber-900">
                <div>Base price: {previewBasePrice.toLocaleString('vi-VN')} VND</div>
                <div>Deposit: {previewDepositPercent}%</div>
                <div>Pay now: {previewPayNow.toLocaleString('vi-VN')} VND</div>
                <div>Pay later (COD): {previewPayLater.toLocaleString('vi-VN')} VND</div>
              </div>
              <p className="mt-2 text-xs text-amber-800">
                Shipping fee is collected with the deposit for pre-order COD flows.
              </p>
              {previewPayLater > 0 ? (
                <p className="mt-2 text-xs font-semibold text-amber-900">
                  Customers pay the deposit via SePay first. The remaining product balance can be collected by COD on delivery.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Media uploads ── */}
      <div className="rounded-md border border-gray-200 p-3">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{tF('mediaTitle')}</p>

        {/* Hero + Thumbnail side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Hero */}
          <div className="rounded-md border border-gray-100 bg-gray-50">
            <label className="flex cursor-pointer flex-col items-center gap-1.5 p-2 text-xs font-medium text-gray-500 hover:text-amber-600">
              {formData.heroImageUrl ? (
                <img src={formData.heroImageUrl} alt="Hero" className="h-28 w-full rounded object-cover" />
              ) : (
                <div className="flex h-28 w-full flex-col items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-400">
                  <Upload className="h-6 w-6" />
              <span className="mt-1 text-xs">{tF('heroImage')}</span>
                </div>
              )}
              <span>{formData.heroImageUrl ? tF('changeHero') : tF('uploadHero')}</span>
              <input
                type="file" accept="image/*"
                disabled={isSubmitting || uploadingKey === 'hero'}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUploadSingle(f, 'hero'); }}
                className="hidden"
              />
            </label>
          </div>

          {/* Thumbnail */}
          <div className="rounded-md border border-gray-100 bg-gray-50">
            <label className="flex cursor-pointer flex-col items-center gap-1.5 p-2 text-xs font-medium text-gray-500 hover:text-amber-600">
              {formData.thumbnailUrl ? (
                <img src={formData.thumbnailUrl} alt="Thumbnail" className="h-28 w-full rounded object-cover" />
              ) : (
                <div className="flex h-28 w-full flex-col items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-400">
                  <Upload className="h-6 w-6" />
              <span className="mt-1 text-xs">{tF('thumbnailImage')}</span>
                </div>
              )}
              <span>{formData.thumbnailUrl ? tF('changeThumbnail') : tF('uploadThumbnail')}</span>
              <input
                type="file" accept="image/*"
                disabled={isSubmitting || uploadingKey === 'thumbnail'}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUploadSingle(f, 'thumbnail'); }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">{tF('gallery')}</span>
            <label className="flex cursor-pointer items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:border-amber-400 hover:text-amber-600">
              <Upload className="h-3 w-3" /> {tF('addGallery')}
              <input
                type="file" accept="image/*" multiple
                disabled={isSubmitting || uploadingKey === 'gallery'}
                onChange={(e) => void onUploadGallery(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
          {formData.galleryUrls.length > 0 ? (
            <div className="grid grid-cols-6 gap-2">
              {formData.galleryUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="group relative">
                  <img src={url} alt={`Gallery ${index + 1}`} className="h-14 w-full rounded-md object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemoveGallery(index)}
                    className="absolute -right-1 -top-1 rounded-full bg-white text-red-500 shadow opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400 py-3">{tF('noGallery')}</p>
          )}
        </div>
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{tF('tryOnTitle')}</p>
            <p className="mt-1 text-xs text-gray-500">{tF('tryOnDesc')}</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={formData.tryOnEnabled}
              disabled={!supportsTryOn}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  tryOnEnabled: event.target.checked,
                }))
              }
            />
            {tF('enableTryOn')}
          </label>
        </div>

        {!supportsTryOn ? (
          <p className="mt-3 text-xs font-medium text-amber-700">{tF('tryOnNotSupported')}</p>
        ) : null}

        {formData.tryOnEnabled ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
              <p className="font-semibold">{tF('tryOnNoteTitle')}</p>
              <p className="mt-1">{tF('tryOnNote1')}</p>
              <p className="mt-1">{tF('tryOnNote2', { max: MAX_TRY_ON_MODELS })}</p>
              <p className="mt-1">{tF('tryOnNote3')}</p>
            </div>

            {mappedTryOnModelCount > MAX_TRY_ON_MODELS ? (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {tF('tryOnLimitError', { max: MAX_TRY_ON_MODELS })}
              </p>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {tF('tryOnStatusLabel')}
              </label>
              <Select
                value={formData.tryOnStatus}
                onValueChange={(value) =>
                  onChange((prev) => ({
                    ...prev,
                    tryOnStatus: value as ProductTryOnStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={tF('tryOnStatusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {tryOnStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {tF(`tryOnStatus.${option.value}` as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.tryOnStatus === 'rejected' ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ly do tu choi
                </label>
                <textarea
                  value={formData.tryOnRejectReason}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      tryOnRejectReason: event.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="Vi sao try-on nay bi tu choi?"
                />
              </div>
            ) : null}

            {(formData.tryOnStatus === 'approved' ||
              formData.tryOnStatus === 'published') && (
              <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                Neu trang thai la Da duyet hoac Dang hien thi, moi bien the da map try-on phai co GLB.
              </p>
            )}

            <p className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
              Asset try-on duoc upload theo tung bien the o ben tren. Phan nay chi dieu khien trang thai,
              scene, URL fallback va cac thong so prefab dung chung.
            </p>

            {tryOnModelLimitReached ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                San pham da dat gioi han {MAX_TRY_ON_MODELS} model try-on. Muon them model moi, hay go asset 3D
                o mot bien the khac truoc.
              </p>
            ) : null}

            <details
              open={isTryOnAdvancedOpen}
              onToggle={(event) =>
                setIsTryOnAdvancedOpen((event.currentTarget as HTMLDetailsElement).open)
              }
              className="rounded-md border border-dashed border-gray-300 bg-white px-4 py-3"
            >
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                {tF('tryOnAdvancedSettings')}
              </summary>

              <p className="mt-3 rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-600">
                {tF('tryOnAdvancedHint1')}
              </p>
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                {tF('tryOnAdvancedHint2')}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <Input
                  label={tF('sceneOrEffectCode')}
                  value={formData.tryOnScene}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      tryOnScene: event.target.value,
                    }))
                  }
                  placeholder="Vi du: effect kx..."
                />
                <Input
                  label={tF('webArUrl')}
                  value={formData.tryOnArUrl}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      tryOnArUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
                <Input
                  label={tF('launchUrlFallback')}
                  value={formData.tryOnLaunchUrl}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      tryOnLaunchUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
                <Input
                  label={tF('effectPath')}
                  value={formData.tryOnEffectPath}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      tryOnEffectPath: event.target.value,
                    }))
                  }
                  placeholder="effects/frame_effect"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {tF('resourcePaths')}
                </label>
                <textarea
                  value={formData.tryOnResourcePaths}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      tryOnResourcePaths: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  placeholder={tF('resourcePathsPlaceholder')}
                />
              </div>

              {/* ── Prefab XYZ table ── */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {tF('prefabTransform')}
                </p>
                <div className="overflow-hidden rounded-md border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        <th className="px-3 py-2 text-left w-1/4">{tF('prefabProperty')}</th>
                        <th className="px-3 py-2 text-center">X</th>
                        <th className="px-3 py-2 text-center">Y</th>
                        <th className="px-3 py-2 text-center">Z</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* Rotation */}
                      {(() => {
                        const [rx, ry, rz] = parseXYZ(formData.tryOnRotation);
                        const mkChange = (axis: 0 | 1 | 2, val: string) => {
                          const parts: [string, string, string] = [rx, ry, rz];
                          parts[axis] = val;
                          onChange((prev) => ({ ...prev, tryOnRotation: formatXYZ(...parts) }));
                        };
                        return (
                          <tr>
                            <td className="px-3 py-2 text-xs font-medium text-gray-600">{tF('prefabRotation')}</td>
                            {([rx, ry, rz] as string[]).map((v, i) => (
                              <td key={i} className="px-2 py-1.5">
                                <input
                                  type="number"
                                  value={v}
                                  onChange={(e) => mkChange(i as 0 | 1 | 2, e.target.value)}
                                  placeholder="0"
                                  className="w-full rounded border border-gray-200 px-2 py-1 text-center text-sm focus:border-amber-400 focus:outline-none"
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })()}
                      {/* Scale */}
                      {(() => {
                        const [sx, sy, sz] = parseXYZ(formData.tryOnScale);
                        const mkChange = (axis: 0 | 1 | 2, val: string) => {
                          const parts: [string, string, string] = [sx, sy, sz];
                          parts[axis] = val;
                          onChange((prev) => ({ ...prev, tryOnScale: formatXYZ(...parts) }));
                        };
                        return (
                          <tr className="bg-gray-50/40">
                            <td className="px-3 py-2 text-xs font-medium text-gray-600">{tF('prefabScale')}</td>
                            {([sx, sy, sz] as string[]).map((v, i) => (
                              <td key={i} className="px-2 py-1.5">
                                <input
                                  type="number"
                                  value={v}
                                  onChange={(e) => mkChange(i as 0 | 1 | 2, e.target.value)}
                                  placeholder="1"
                                  className="w-full rounded border border-gray-200 px-2 py-1 text-center text-sm focus:border-amber-400 focus:outline-none"
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })()}
                      {/* Translation */}
                      {(() => {
                        const [tx, ty, tz] = parseXYZ(formData.tryOnTranslation);
                        const mkChange = (axis: 0 | 1 | 2, val: string) => {
                          const parts: [string, string, string] = [tx, ty, tz];
                          parts[axis] = val;
                          onChange((prev) => ({ ...prev, tryOnTranslation: formatXYZ(...parts) }));
                        };
                        return (
                          <tr>
                            <td className="px-3 py-2 text-xs font-medium text-gray-600">{tF('prefabTranslation')}</td>
                            {([tx, ty, tz] as string[]).map((v, i) => (
                              <td key={i} className="px-2 py-1.5">
                                <input
                                  type="number"
                                  value={v}
                                  onChange={(e) => mkChange(i as 0 | 1 | 2, e.target.value)}
                                  placeholder="0"
                                  className="w-full rounded border border-gray-200 px-2 py-1 text-center text-sm focus:border-amber-400 focus:outline-none"
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })()}
                      {/* Gravity */}
                      {(() => {
                        const [gx, gy, gz] = parseXYZ(formData.tryOnGravity);
                        const mkChange = (axis: 0 | 1 | 2, val: string) => {
                          const parts: [string, string, string] = [gx, gy, gz];
                          parts[axis] = val;
                          onChange((prev) => ({ ...prev, tryOnGravity: formatXYZ(...parts) }));
                        };
                        return (
                          <tr className="bg-gray-50/40">
                            <td className="px-3 py-2 text-xs font-medium text-gray-600">{tF('prefabGravity')}</td>
                            {([gx, gy, gz] as string[]).map((v, i) => (
                              <td key={i} className="px-2 py-1.5">
                                <input
                                  type="number"
                                  value={v}
                                  onChange={(e) => mkChange(i as 0 | 1 | 2, e.target.value)}
                                  placeholder="0"
                                  className="w-full rounded border border-gray-200 px-2 py-1 text-center text-sm focus:border-amber-400 focus:outline-none"
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Prefab cut — single value, keep as plain input */}
              <div className="mt-3">
                <Input
                  label={tF('prefabCut')}
                  value={formData.tryOnCut}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      tryOnCut: event.target.value,
                    }))
                  }
                  placeholder="head"
                />
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.tryOnUsePhysics}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      tryOnUsePhysics: event.target.checked,
                    }))
                  }
                />
                {tF('prefabUsePhysics')}
              </label>
            </details>
          </div>
        ) : null}
      </div>

      {/* ── Action buttons — bottom of form ── */}
      {(onCancel || onSubmit) && (
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
          {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {tF('cancelButton')}
            </Button>
          )}
          {onSubmit && (
            <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-amber-400 text-slate-900 hover:bg-amber-500"
          >
            {isSubmitting ? tF('savingButton') : submitLabel}
          </Button>
          )}
        </div>
      )}
    </div>
  );
}
