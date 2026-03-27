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
  { value: 'sunglasses' },
  { value: 'frame' },
  { value: 'lens' },
  { value: 'accessory' },
  { value: 'other' },
];

const PREORDER_SHIPPING_TIMING_OPTIONS: Array<{
  value: PreOrderShippingCollectionTiming;
  label: string;
}> = [
  { value: 'upfront', label: 'Collect upfront' },
  { value: 'on_delivery', label: 'Collect on delivery' },
];

const TRY_ON_STATUS_OPTIONS: Array<{ value: ProductTryOnStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
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
  submitLabel,
}: ProductFormProps) {
  const t = useTranslations('manager.productForm');
  const getVariantUploadKey = (
    variantId: string,
    suffix: 'image' | 'poster' | 'glb'
  ) => `variant-${variantId || 'unknown'}-${suffix}`;
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
    <div className="space-y-5">

      {/* Section 1: Basic Info */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900">1</span>
          <span className="text-sm font-semibold text-gray-800">{t('section1')}</span>
        </div>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label={t('nameLabel')}
                value={formData.name}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder={t('namePlaceholder')}
                required
              />
            </div>
            <Input
              label={t('brandLabel')}
              value={formData.brand}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, brand: event.target.value }))
              }
              placeholder={t('brandPlaceholder')}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('categoryLabel')}
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  onChange((prev) => ({
                    ...prev,
                    category: value,
                    tryOnEnabled:
                      value === 'frame' || value === 'sunglasses'
                        ? prev.tryOnEnabled
                        : false,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(`categories.${option.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              label={t('priceLabel')}
              type="number"
              value={formData.price}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, price: event.target.value }))
              }
              placeholder="0"
            />
            <Input
              label={t('stockLabel')}
              type="number"
              value={formData.stock}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, stock: event.target.value }))
              }
              placeholder="0"
            />
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('descriptionLabel')}
              </label>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none"
                placeholder={t('descriptionPlaceholder')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Media */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900">2</span>
          <span className="text-sm font-semibold text-gray-800">{t('section2')}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hero Image</p>
            <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-amber-300 hover:bg-amber-50">
              {formData.heroImageUrl ? (
                <img src={formData.heroImageUrl} alt="Hero" className="h-28 w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center py-6 text-gray-400">
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-xs">{uploadingKey === 'hero' ? t('uploadingLabel') : t('uploadLabel')}</span>
                </div>
              )}
              <input
                type="file" accept="image/*"
                disabled={isSubmitting || uploadingKey === 'hero'}
                onChange={(event) => { const file = event.target.files?.[0]; if (file) void onUploadSingle(file, 'hero'); }}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            {formData.heroImageUrl && <p className="truncate text-[10px] text-gray-400">{formData.heroImageUrl}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Thumbnail</p>
            <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-amber-300 hover:bg-amber-50">
              {formData.thumbnailUrl ? (
                <img src={formData.thumbnailUrl} alt="Thumbnail" className="h-28 w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center py-6 text-gray-400">
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-xs">{uploadingKey === 'thumbnail' ? t('uploadingLabel') : t('uploadLabel')}</span>
                </div>
              )}
              <input
                type="file" accept="image/*"
                disabled={isSubmitting || uploadingKey === 'thumbnail'}
                onChange={(event) => { const file = event.target.files?.[0]; if (file) void onUploadSingle(file, 'thumbnail'); }}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            {formData.thumbnailUrl && <p className="truncate text-[10px] text-gray-400">{formData.thumbnailUrl}</p>}
          </div>

          <div className="col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Gallery</p>
            <label className="relative flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 hover:border-amber-300 hover:bg-amber-50 transition">
              <Upload className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500">{t('galleryLabel')}</span>
              <input
                type="file" accept="image/*" multiple
                disabled={isSubmitting || uploadingKey === 'gallery'}
                onChange={(event) => void onUploadGallery(event.target.files)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            {formData.galleryUrls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.galleryUrls.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative group">
                    <img src={url} alt={`Gallery ${index + 1}`} className="h-16 w-16 rounded-lg object-cover ring-1 ring-gray-200" />
                    <button type="button" onClick={() => onRemoveGallery(index)} className="absolute -top-1.5 -right-1.5 rounded-full bg-white text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Store */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900">3</span>
          <span className="text-sm font-semibold text-gray-800">{t('section3')}</span>
          <span className="ml-auto text-xs text-gray-400">Store network</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Pham vi cua hang</label>
              <Select
                value={formData.storeScopeMode}
                onValueChange={(value) =>
                  onChange((prev) => ({
                    ...prev,
                    storeScopeMode: value === 'selected' ? 'selected' : 'all',
                    storeIds: value === 'selected' ? prev.storeIds : [],
                    primaryStoreId: value === 'selected' ? prev.primaryStoreId : '',
                  }))
                }
              >
                <SelectTrigger><SelectValue placeholder="Chon pham vi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('storeScope.allStores')}</SelectItem>
                  <SelectItem value="selected">{t('storeScope.selectedStores')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              label="Ghi chu phan bo (tuy chon)"
              value={formData.storeScopeNote}
              onChange={(event) => onChange((prev) => ({ ...prev, storeScopeNote: event.target.value }))}
              placeholder="VD: chi mo ban tai HCM thang dau"
            />
          </div>

          {formData.storeScopeMode === 'all' ? (
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              San pham nay se duoc ban o tat ca cua hang.
            </p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Cua hang mac dinh</label>
                <Select
                  value={formData.primaryStoreId || '__none'}
                  onValueChange={(value) =>
                    onChange((prev) => {
                      const nextPrimary = value === '__none' ? '' : value;
                      const nextStoreIds = nextPrimary ? Array.from(new Set([...prev.storeIds, nextPrimary])) : prev.storeIds;
                      return { ...prev, primaryStoreId: nextPrimary, storeIds: nextStoreIds };
                    })
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Chon cua hang mac dinh" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Chua chon</SelectItem>
                    {storeOptions.map((store) => (
                      <SelectItem key={store.id} value={store.id}>{store.name} ({store.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Danh sach cua hang ap dung</p>
                {storeOptions.length === 0 ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">Chua co cua hang nao.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {storeOptions.map((store) => {
                      const checked = formData.storeIds.includes(store.id);
                      return (
                        <label key={store.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${checked ? 'border-amber-300 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input
                            type="checkbox" checked={checked}
                            onChange={(event) =>
                              onChange((prev) => {
                                const nextStoreIds = event.target.checked
                                  ? Array.from(new Set([...prev.storeIds, store.id]))
                                  : prev.storeIds.filter((id) => id !== store.id);
                                const nextPrimary = prev.primaryStoreId === store.id && !event.target.checked ? '' : prev.primaryStoreId;
                                return { ...prev, storeIds: nextStoreIds, primaryStoreId: nextPrimary };
                              })
                            }
                            className="mt-0.5 accent-amber-500"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-gray-800 truncate">{store.name} ({store.code})</div>
                            <div className="mt-0.5 text-xs text-gray-500 truncate">
                              {[store.addressLine1, store.district, store.city].filter(Boolean).join(', ') || 'Chua co dia chi'}
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
      </div>

      {/* Section 4: Variants */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900">4</span>
          <span className="text-sm font-semibold text-gray-800">{t('section4')}</span>
          <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            {mappedTryOnModelCount}/{MAX_TRY_ON_MODELS} 3D
          </span>
          <Button type="button" variant="outline" size="sm" onClick={addVariant} className="ml-auto">
            + {t('variant.addButton')}
          </Button>
        </div>
        <div className="divide-y divide-gray-100">
          {variantRows.map((variant, index) => (
            <div key={variant.id || `${variant.sku}-${index}`} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600"># {index + 1}</span>
                  {variant.color && <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{variant.color}</span>}
                  {variant.size && <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">{variant.size}</span>}
                </div>
                {variantRows.length > 1 && (
                  <button type="button" onClick={() => removeVariant(index)} className="text-xs text-red-500 hover:text-red-700 hover:underline">
                    {t('variant.removeButton')}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label={t('variant.skuLabel')} value={variant.sku} onChange={(e) => updateVariant(index, (c) => ({ ...c, sku: e.target.value }))} placeholder="SKU-BLK-M" />
                <Input label={t('variant.colorLabel')} value={variant.color} onChange={(e) => updateVariant(index, (c) => ({ ...c, color: e.target.value }))} placeholder="Black" />
                <Input label={t('variant.sizeLabel')} value={variant.size} onChange={(e) => updateVariant(index, (c) => ({ ...c, size: e.target.value }))} placeholder="M" />
                <Input label={t('variant.priceLabel')} type="number" value={variant.price} onChange={(e) => updateVariant(index, (c) => ({ ...c, price: e.target.value }))} placeholder={formData.price || '0'} />
                <Input label={t('variant.stockLabel')} type="number" value={variant.stock} onChange={(e) => updateVariant(index, (c) => ({ ...c, stock: e.target.value }))} placeholder="0" />
                <Input label={t('variant.warehouseLabel')} value={variant.warehouseLocation} onChange={(e) => updateVariant(index, (c) => ({ ...c, warehouseLocation: e.target.value }))} placeholder="HCM-01" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Anh</p>
                  <label className="relative flex cursor-pointer flex-col items-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-300 transition">
                    {variant.imageUrl ? <img src={variant.imageUrl} alt={`v${index + 1}`} className="h-20 w-full object-cover" /> : (
                      <div className="flex flex-col items-center py-4 text-gray-300"><Upload className="h-5 w-5 mb-1" /><span className="text-[10px]">Upload</span></div>
                    )}
                    <input type="file" accept="image/*" disabled={isSubmitting || uploadingKey === getVariantUploadKey(variant.id, 'image')} onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUploadVariantAsset(f, variant.id, 'imageUrl'); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                  <input className="w-full truncate rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500 focus:border-amber-300 focus:outline-none" value={variant.imageUrl} onChange={(e) => updateVariant(index, (c) => ({ ...c, imageUrl: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Poster</p>
                  <label className="relative flex cursor-pointer flex-col items-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-300 transition">
                    {variant.posterUrl ? <img src={variant.posterUrl} alt={`poster${index + 1}`} className="h-20 w-full object-cover" /> : (
                      <div className="flex flex-col items-center py-4 text-gray-300"><Upload className="h-5 w-5 mb-1" /><span className="text-[10px]">Upload</span></div>
                    )}
                    <input type="file" accept="image/*" disabled={isSubmitting || uploadingKey === getVariantUploadKey(variant.id, 'poster')} onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUploadVariantAsset(f, variant.id, 'posterUrl'); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                  <input className="w-full truncate rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500 focus:border-amber-300 focus:outline-none" value={variant.posterUrl} onChange={(e) => updateVariant(index, (c) => ({ ...c, posterUrl: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">GLB 3D</p>
                  <label className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-300 transition py-4">
                    <span className="text-2xl">&#x1F4E6;</span>
                    <span className="mt-1 text-[10px] text-gray-400">{variant.glbUrl ? 'Da co GLB' : 'Upload .glb'}</span>
                    <input type="file" accept=".glb,.gltf,model/gltf-binary,model/gltf+json" disabled={isSubmitting || uploadingKey === getVariantUploadKey(variant.id, 'glb')} onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUploadVariantAsset(f, variant.id, 'glbUrl'); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                  <input className="w-full truncate rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500 focus:border-amber-300 focus:outline-none" value={variant.glbUrl} onChange={(e) => updateVariant(index, (c) => ({ ...c, glbUrl: e.target.value }))} placeholder="https://....glb" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Frame Specs */}
      {supportsTryOn ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900">5</span>
            <span className="text-sm font-semibold text-gray-800">Thong so gong kinh</span>
            <span className="ml-auto text-xs text-gray-400 italic">Tuy chon</span>
          </div>
          <details open={hasFrameSpecs} className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
              <span className="mr-1 text-gray-400 transition-transform">&#9654;</span>
              {hasFrameSpecs ? 'Dang co thong so da nhap - bam de chinh sua' : 'Them thong so khi da xac nhan duoc'}
            </summary>
            <div className="border-t border-gray-100 px-4 pb-4 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Hinh dang (shape)" value={formData.frameShape} onChange={(e) => onChange((p) => ({ ...p, frameShape: e.target.value }))} placeholder="rectangle" />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Gioi tinh</label>
                  <Select value={formData.frameGender} onValueChange={(v) => onChange((p) => ({ ...p, frameGender: v as ProductFormState['frameGender'] }))}>
                    <SelectTrigger><SelectValue placeholder="Chon" /></SelectTrigger>
                    <SelectContent>{GENDER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Input label="Trong luong (gram)" type="number" value={formData.frameWeightGram} onChange={(e) => onChange((p) => ({ ...p, frameWeightGram: e.target.value }))} placeholder="22" />
                <Input label="Chat lieu" value={formData.frameMaterial} onChange={(e) => onChange((p) => ({ ...p, frameMaterial: e.target.value }))} placeholder="acetate" />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Loai ban le</label>
                  <Select value={formData.frameHingeType} onValueChange={(v) => onChange((p) => ({ ...p, frameHingeType: v as ProductFormState['frameHingeType'] }))}>
                    <SelectTrigger><SelectValue placeholder="Chon" /></SelectTrigger>
                    <SelectContent>{HINGE_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Input label="Loai vanh (rim type)" value={formData.frameRimType} onChange={(e) => onChange((p) => ({ ...p, frameRimType: e.target.value }))} placeholder="full" />
                <Input label="Cau mui (mm)" type="number" value={formData.dimensionBridgeMm} onChange={(e) => onChange((p) => ({ ...p, dimensionBridgeMm: e.target.value }))} placeholder="18" />
                <Input label="Gong tai (mm)" type="number" value={formData.dimensionTempleLengthMm} onChange={(e) => onChange((p) => ({ ...p, dimensionTempleLengthMm: e.target.value }))} placeholder="145" />
                <Input label="Chieu rong trong (mm)" type="number" value={formData.dimensionLensWidthMm} onChange={(e) => onChange((p) => ({ ...p, dimensionLensWidthMm: e.target.value }))} placeholder="52" />
                <Input label="Chieu cao trong (mm)" type="number" value={formData.dimensionLensHeightMm} onChange={(e) => onChange((p) => ({ ...p, dimensionLensHeightMm: e.target.value }))} placeholder="40" />
                {formData.category === 'sunglasses' ? (
                  <Input label="Chong UV" value={formData.lensUvProtection} onChange={(e) => onChange((p) => ({ ...p, lensUvProtection: e.target.value }))} placeholder="UV400" />
                ) : null}
              </div>
              <div className="mt-3 flex gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={formData.frameNosePads} onChange={(e) => onChange((p) => ({ ...p, frameNosePads: e.target.checked }))} className="accent-amber-500" />
                  Co nose pads
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={formData.frameRxReady} onChange={(e) => onChange((p) => ({ ...p, frameRxReady: e.target.checked }))} className="accent-amber-500" />
                  RX ready
                </label>
              </div>
            </div>
          </details>
        </div>
      ) : null}

      {/* Section 6: Pre-order */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900">{supportsTryOn ? '6' : '5'}</span>
          <span className="text-sm font-semibold text-gray-800">{t('preorder.enableLabel')}</span>
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={formData.preOrderEnabled} onChange={(e) => onChange((prev) => ({ ...prev, preOrderEnabled: e.target.checked }))} className="accent-amber-500" />
            {t('preorder.enableLabel')}
          </label>
        </div>
        {formData.preOrderEnabled ? (
          <div className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Phan tram dat coc (%)" type="number" min={0} max={100} value={formData.preOrderDepositPercent} onChange={(e) => onChange((p) => ({ ...p, preOrderDepositPercent: e.target.value }))} placeholder="30" />
              <Input label="SL toi da / don" type="number" min={1} value={formData.preOrderMaxQuantityPerOrder} onChange={(e) => onChange((p) => ({ ...p, preOrderMaxQuantityPerOrder: e.target.value }))} placeholder="2" />
              <Input label="Bat dau nhan dat" type="datetime-local" value={formData.preOrderStartAt} onChange={(e) => onChange((p) => ({ ...p, preOrderStartAt: e.target.value }))} />
              <Input label="Ket thuc nhan dat" type="datetime-local" value={formData.preOrderEndAt} onChange={(e) => onChange((p) => ({ ...p, preOrderEndAt: e.target.value }))} />
              <Input label="Giao hang tu" type="datetime-local" value={formData.preOrderShipFrom} onChange={(e) => onChange((p) => ({ ...p, preOrderShipFrom: e.target.value }))} />
              <Input label="Giao hang den" type="datetime-local" value={formData.preOrderShipTo} onChange={(e) => onChange((p) => ({ ...p, preOrderShipTo: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Thoi diem thu phi van chuyen</label>
                <Select value={formData.preOrderShippingCollectionTiming} onValueChange={(v) => onChange((p) => ({ ...p, preOrderShippingCollectionTiming: v as PreOrderShippingCollectionTiming }))}>
                  <SelectTrigger><SelectValue placeholder="Chon" /></SelectTrigger>
                  <SelectContent>{PREORDER_SHIPPING_TIMING_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={formData.preOrderAllowCod} onChange={(e) => onChange((p) => ({ ...p, preOrderAllowCod: e.target.checked }))} className="accent-amber-500" />
                  Cho phep COD (phan con lai)
                </label>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Ghi chu pre-order</label>
              <textarea value={formData.preOrderNote} onChange={(e) => onChange((p) => ({ ...p, preOrderNote: e.target.value }))} rows={2} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" placeholder="Ghi chu hien thi cho khach hang" />
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-900 mb-2">Xem truoc thanh toan</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-amber-800">
                <span>Gia goc: {previewBasePrice.toLocaleString('vi-VN')} VND</span>
                <span>Dat coc: {previewDepositPercent}%</span>
                <span className="font-semibold">Tra ngay: {previewPayNow.toLocaleString('vi-VN')} VND</span>
                <span>COD sau: {previewPayLater.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400">Pre-order dang tat. Bat de cau hinh dat coc va lich giao hang.</p>
          </div>
        )}
      </div>

      {/* Section 7: Try-on */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900">{supportsTryOn ? '7' : '6'}</span>
          <span className="text-sm font-semibold text-gray-800">Mobile Try-on</span>
          {!supportsTryOn && <span className="ml-2 text-xs text-gray-400">Chi kha dung cho Frame / Sunglasses</span>}
          {supportsTryOn && (
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={formData.tryOnEnabled} disabled={!supportsTryOn} onChange={(e) => onChange((prev) => ({ ...prev, tryOnEnabled: e.target.checked }))} className="accent-amber-500" />
              {t('tryOn.enableLabel')}
            </label>
          )}
        </div>

        {formData.tryOnEnabled ? (
          <div className="space-y-3 p-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-800 space-y-0.5">
              <p className="font-semibold">Luu y:</p>
              <p>Moi bien the muon thu kinh can co Image, Poster va GLB rieng.</p>
              <p>Toi da {MAX_TRY_ON_MODELS} bien the duoc map try-on trong 1 san pham.</p>
            </div>
            {mappedTryOnModelCount > MAX_TRY_ON_MODELS && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                Can giam xuong {MAX_TRY_ON_MODELS} bien the co GLB truoc khi luu.
              </p>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Trang thai try-on</label>
              <Select value={formData.tryOnStatus} onValueChange={(v) => onChange((p) => ({ ...p, tryOnStatus: v as ProductTryOnStatus }))}>
                <SelectTrigger><SelectValue placeholder="Chon trang thai" /></SelectTrigger>
                <SelectContent>{tryOnStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {formData.tryOnStatus === 'rejected' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Ly do tu choi</label>
                <textarea value={formData.tryOnRejectReason} onChange={(e) => onChange((p) => ({ ...p, tryOnRejectReason: e.target.value }))} rows={2} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none" placeholder="Vi sao try-on nay bi tu choi?" />
              </div>
            )}
            {tryOnModelLimitReached && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                Da dat gioi han {MAX_TRY_ON_MODELS} model. Xoa GLB o 1 bien the de them moi.
              </p>
            )}
            <details open={isTryOnAdvancedOpen} onToggle={(e) => setIsTryOnAdvancedOpen((e.currentTarget as HTMLDetailsElement).open)} className="rounded-lg border border-dashed border-gray-300 bg-gray-50">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 [&::-webkit-details-marker]:hidden">
                <span className="text-gray-400 transition-transform">&#9654;</span>
                Cai dat nang cao (tuy chon)
              </summary>
              <div className="border-t border-gray-200 px-4 pb-4 pt-3 space-y-3">
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Cac gia tri nay ghi de runtime mac dinh. Neu model dang hien thi binh thuong, hay de trong.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Scene / Effect code" value={formData.tryOnScene} onChange={(e) => onChange((p) => ({ ...p, tryOnScene: e.target.value }))} placeholder="effect kx..." />
                  <Input label="Web AR URL" value={formData.tryOnArUrl} onChange={(e) => onChange((p) => ({ ...p, tryOnArUrl: e.target.value }))} placeholder="https://..." />
                  <Input label="Launch URL fallback" value={formData.tryOnLaunchUrl} onChange={(e) => onChange((p) => ({ ...p, tryOnLaunchUrl: e.target.value }))} placeholder="https://..." />
                  <Input label="Effect path (nang cao)" value={formData.tryOnEffectPath} onChange={(e) => onChange((p) => ({ ...p, tryOnEffectPath: e.target.value }))} placeholder="effects/frame_effect" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Resource paths bo sung</label>
                  <textarea value={formData.tryOnResourcePaths} onChange={(e) => onChange((p) => ({ ...p, tryOnResourcePaths: e.target.value }))} rows={2} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none" placeholder="Moi dong 1 resource path" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Thong so Prefab</p>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="py-2 pl-3 pr-2 text-left text-xs font-semibold text-gray-600 w-[30%]">Thuoc tinh</th>
                          <th className="py-2 px-2 text-center text-xs font-bold text-blue-600 w-[23%]">X</th>
                          <th className="py-2 px-2 text-center text-xs font-bold text-green-600 w-[23%]">Y</th>
                          <th className="py-2 px-2 text-center text-xs font-bold text-red-500 w-[24%]">Z</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {([
                          { label: 'Rotation', key: 'tryOnRotation', defaults: ['-90', '0', '0'] },
                          { label: 'Translation', key: 'tryOnTranslation', defaults: ['0', '0', '0'] },
                          { label: 'Scale', key: 'tryOnScale', defaults: ['1', '1', '1'] },
                          { label: 'Gravity', key: 'tryOnGravity', defaults: ['0', '0', '0'] },
                        ] as Array<{ label: string; key: keyof ProductFormState; defaults: string[] }>).map(({ label, key, defaults }) => {
                          const raw = String(formData[key] || '');
                          const parts = raw.trim() ? raw.trim().split(/\s+/) : ['', '', ''];
                          const [vx = '', vy = '', vz = ''] = parts;
                          const setAxis = (axis: 0 | 1 | 2, val: string) => {
                            const next = [vx, vy, vz];
                            next[axis] = val;
                            onChange((prev) => ({ ...prev, [key as string]: next.join(' ').trimEnd() }));
                          };
                          return (
                            <tr key={key} className="hover:bg-gray-50">
                              <td className="py-2 pl-3 pr-2 text-xs font-medium text-gray-700">{label}</td>
                              {([vx, vy, vz] as string[]).map((val, i) => (
                                <td key={i} className="py-1.5 px-1.5">
                                  <input
                                    type="number" value={val}
                                    onChange={(e) => setAxis(i as 0 | 1 | 2, e.target.value)}
                                    placeholder={defaults[i]}
                                    className={`w-full rounded border px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 ${i === 0 ? 'border-blue-200 focus:border-blue-400 focus:ring-blue-100' : i === 1 ? 'border-green-200 focus:border-green-400 focus:ring-green-100' : 'border-red-200 focus:border-red-400 focus:ring-red-100'}`}
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Prefab cut" value={formData.tryOnCut} onChange={(e) => onChange((p) => ({ ...p, tryOnCut: e.target.value }))} placeholder="head" />
                  <div className="flex items-end pb-0.5">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={formData.tryOnUsePhysics} onChange={(e) => onChange((p) => ({ ...p, tryOnUsePhysics: e.target.checked }))} className="accent-amber-500" />
                      Bat physics cho prefab (nang cao)
                    </label>
                  </div>
                </div>
              </div>
            </details>
          </div>
        ) : (
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400">
              {supportsTryOn ? 'Try-on dang tat. Bat de cau hinh trai nghiem thu kinh ao.' : 'Tinh nang nay chi danh cho san pham thuoc danh muc Frame hoac Sunglasses.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {(onCancel || onSubmit) && (
        <div className="flex justify-end gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="min-w-[80px]">
              {t('cancelButton')}
            </Button>
          )}
          {onSubmit && (
            <Button type="button" onClick={onSubmit} disabled={isSubmitting} className="min-w-[100px] bg-amber-400 text-slate-900 hover:bg-amber-500 font-semibold">
              {isSubmitting ? '...' : (submitLabel ?? t('saveButton'))}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
