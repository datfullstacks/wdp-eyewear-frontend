'use client';

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
  usdzUrl: string;
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
  tryOnUsdzUrl: string;
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

const PREORDER_SHIPPING_TIMING_OPTIONS: Array<{
  value: PreOrderShippingCollectionTiming;
  label: string;
}> = [
  { value: 'upfront', label: 'Collect upfront' },
  { value: 'with_balance', label: 'Collect with balance' },
  { value: 'on_delivery', label: 'Collect on delivery' },
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
  isSubmitting: boolean;
  uploadingKey: string;
  onChange: (updater: (prev: ProductFormState) => ProductFormState) => void;
  onUploadSingle: (file: File, role: ProductMediaAsset['role']) => Promise<void>;
  onUploadGallery: (files: FileList | null) => Promise<void>;
  onUploadVariantAsset: (
    file: File,
    variantIndex: number,
    field: 'imageUrl' | 'posterUrl' | 'glbUrl' | 'usdzUrl'
  ) => Promise<void>;
  onRemoveGallery: (index: number) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
}

export function ProductForm({
  formData,
  storeOptions = [],
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
  const mappedTryOnModelCount = variantRows.filter(
    (variant) => Boolean(String(variant.glbUrl || '').trim() || String(variant.usdzUrl || '').trim())
  ).length;
  const tryOnModelLimitReached = mappedTryOnModelCount >= MAX_TRY_ON_MODELS;

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
          usdzUrl: '',
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
    <div className="space-y-4">
      <Input
        label="Product Name"
        value={formData.name}
        onChange={(event) =>
          onChange((prev) => ({ ...prev, name: event.target.value }))
        }
        placeholder="Enter product name"
        required
      />

      <Input
        label="Brand"
        value={formData.brand}
        onChange={(event) =>
          onChange((prev) => ({ ...prev, brand: event.target.value }))
        }
        placeholder="Enter brand"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (VND)"
          type="number"
          value={formData.price}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, price: event.target.value }))
          }
          placeholder="0"
        />
        <Input
          label="Stock"
          type="number"
          value={formData.stock}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, stock: event.target.value }))
          }
          placeholder="0"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Category
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
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, description: event.target.value }))
          }
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          placeholder="Optional product description"
        />
      </div>

      <div className="rounded-md border border-gray-200 p-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700">Store network</p>
          <p className="mt-1 text-xs text-gray-500">
            Gan san pham vao cua hang de van hanh theo mo hinh chuoi. Mobile se co the loc san pham theo cua hang nay.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Pham vi cua hang
            </label>
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
                <SelectValue placeholder="Chon pham vi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Ban o tat ca cua hang</SelectItem>
                <SelectItem value="selected">Chi ban o cua hang duoc chon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            label="Ghi chu phan bo cua hang (tuy chon)"
            value={formData.storeScopeNote}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                storeScopeNote: event.target.value,
              }))
            }
            placeholder="Vi du: chi mo ban tai HCM trong thang dau"
          />
        </div>

        {formData.storeScopeMode === 'all' ? (
          <p className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
            San pham nay se duoc coi la ban o tat ca cua hang. Neu ban muon gioi han theo chi nhanh, hay chuyen sang
            "Chi ban o cua hang duoc chon".
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cua hang mac dinh
              </label>
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
                  <SelectValue placeholder="Chon cua hang mac dinh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Chua chon</SelectItem>
                  {storeOptions.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} ({store.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Danh sach cua hang ap dung</p>
              {storeOptions.length === 0 ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Chua co cua hang nao trong he thong. Hay tao cua hang truoc roi quay lai gan vao san pham.
                </p>
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

      <div className="rounded-md border border-gray-200 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Variants and asset mapping
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Map image, GLB, and USDZ per color or size so mobile can switch assets correctly when the customer changes variant.
            </p>
            <p className="mt-2 text-xs font-medium text-amber-800">
              Try-on supports up to {MAX_TRY_ON_MODELS} mapped models per product. Current mapped models: {mappedTryOnModelCount}/{MAX_TRY_ON_MODELS}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addVariant}>
            Add variant
          </Button>
        </div>

        <div className="space-y-4">
          {variantRows.map((variant, index) => (
            <div
              key={variant.id || `${variant.sku}-${index}`}
              className="rounded-md border border-gray-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Variant {index + 1}
                </p>
                {variantRows.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeVariant(index)}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="SKU"
                  value={variant.sku}
                  onChange={(event) =>
                    updateVariant(index, (current) => ({
                      ...current,
                      sku: event.target.value,
                    }))
                  }
                  placeholder="SKU-FRAME-BLK-M"
                />
                <Input
                  label="Warehouse location"
                  value={variant.warehouseLocation}
                  onChange={(event) =>
                    updateVariant(index, (current) => ({
                      ...current,
                      warehouseLocation: event.target.value,
                    }))
                  }
                  placeholder="HCM-FRAME-01"
                />
                <Input
                  label="Color"
                  value={variant.color}
                  onChange={(event) =>
                    updateVariant(index, (current) => ({
                      ...current,
                      color: event.target.value,
                    }))
                  }
                  placeholder="Black"
                />
                <Input
                  label="Size"
                  value={variant.size}
                  onChange={(event) =>
                    updateVariant(index, (current) => ({
                      ...current,
                      size: event.target.value,
                    }))
                  }
                  placeholder="M"
                />
                <Input
                  label="Variant price (VND)"
                  type="number"
                  value={variant.price}
                  onChange={(event) =>
                    updateVariant(index, (current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  placeholder={formData.price || '0'}
                />
                <Input
                  label="Variant stock"
                  type="number"
                  value={variant.stock}
                  onChange={(event) =>
                    updateVariant(index, (current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-md border border-gray-100 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Upload className="h-4 w-4" />
                    Variant image
                  </div>
                  {variant.imageUrl ? (
                    <img
                      src={variant.imageUrl}
                      alt={`Variant ${index + 1}`}
                      className="mb-2 h-20 w-20 rounded-md object-cover"
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSubmitting || uploadingKey === `variant-${index}-image`}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void onUploadVariantAsset(file, index, 'imageUrl');
                    }}
                    className="block w-full text-sm text-gray-600"
                  />
                  <Input
                    label="Image URL"
                    value={variant.imageUrl}
                    onChange={(event) =>
                      updateVariant(index, (current) => ({
                        ...current,
                        imageUrl: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="rounded-md border border-gray-100 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Upload className="h-4 w-4" />
                    Poster image
                  </div>
                  {variant.posterUrl ? (
                    <img
                      src={variant.posterUrl}
                      alt={`Variant poster ${index + 1}`}
                      className="mb-2 h-20 w-20 rounded-md object-cover"
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSubmitting || uploadingKey === `variant-${index}-poster`}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void onUploadVariantAsset(file, index, 'posterUrl');
                    }}
                    className="block w-full text-sm text-gray-600"
                  />
                  <Input
                    label="Poster URL"
                    value={variant.posterUrl}
                    onChange={(event) =>
                      updateVariant(index, (current) => ({
                        ...current,
                        posterUrl: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-md border border-gray-100 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Upload className="h-4 w-4" />
                    GLB asset
                  </div>
                  <input
                    type="file"
                    accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
                    disabled={isSubmitting || uploadingKey === `variant-${index}-glb`}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void onUploadVariantAsset(file, index, 'glbUrl');
                    }}
                    className="block w-full text-sm text-gray-600"
                  />
                  <Input
                    label="GLB URL"
                    value={variant.glbUrl}
                    onChange={(event) =>
                      updateVariant(index, (current) => ({
                        ...current,
                        glbUrl: event.target.value,
                      }))
                    }
                    placeholder="https://...glb"
                  />
                </div>

                <div className="rounded-md border border-gray-100 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Upload className="h-4 w-4" />
                    USDZ asset
                  </div>
                  <input
                    type="file"
                    accept=".usdz,model/vnd.usdz+zip"
                    disabled={isSubmitting || uploadingKey === `variant-${index}-usdz`}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void onUploadVariantAsset(file, index, 'usdzUrl');
                    }}
                    className="block w-full text-sm text-gray-600"
                  />
                  <Input
                    label="USDZ URL"
                    value={variant.usdzUrl}
                    onChange={(event) =>
                      updateVariant(index, (current) => ({
                        ...current,
                        usdzUrl: event.target.value,
                      }))
                    }
                    placeholder="https://...usdz"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {supportsTryOn ? (
        <div className="rounded-md border border-gray-200 p-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">
              Frame and mobile fit specs
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Required to save a real frame or sunglasses product instead of a generic other-type placeholder.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="mt-4 grid grid-cols-2 gap-4">
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

          <div className="mt-4 grid grid-cols-2 gap-4">
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
        </div>
      ) : null}

      <div className="rounded-md border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Pre-order config</p>
            <p className="mt-1 text-xs text-gray-500">
              Manager-owned business config for deposit, split payment, and shipping collection timing.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={formData.preOrderEnabled}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  preOrderEnabled: event.target.checked,
                }))
              }
            />
            Enable pre-order
          </label>
        </div>

        {formData.preOrderEnabled ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Shipping collection timing
                </label>
                <Select
                  value={formData.preOrderShippingCollectionTiming}
                  onValueChange={(value) =>
                    onChange((prev) => ({
                      ...prev,
                      preOrderShippingCollectionTiming:
                        value as PreOrderShippingCollectionTiming,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREORDER_SHIPPING_TIMING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.preOrderAllowCod}
                    onChange={(event) =>
                      onChange((prev) => ({
                        ...prev,
                        preOrderAllowCod: event.target.checked,
                      }))
                    }
                  />
                  Allow COD for pay-later leg
                </label>
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
                <div>COD later: {previewPayLater.toLocaleString('vi-VN')} VND</div>
              </div>
              <p className="mt-2 text-xs text-amber-800">
                Shipping is shown separately to customers and will be collected based on the selected timing.
              </p>
              {!formData.preOrderAllowCod && previewPayLater > 0 ? (
                <p className="mt-2 text-xs font-semibold text-red-700">
                  V1 currently collects the pay-later leg as COD. Keep this enabled if deposit percent is below 100%.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Upload className="h-4 w-4" />
          Hero image (role: hero)
        </div>
        {formData.heroImageUrl && (
          <img
            src={formData.heroImageUrl}
            alt="Hero preview"
            className="mb-2 h-20 w-20 rounded-md object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={isSubmitting || uploadingKey === 'hero'}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUploadSingle(file, 'hero');
          }}
          className="block w-full text-sm text-gray-600"
        />
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Upload className="h-4 w-4" />
          Thumbnail image (role: thumbnail)
        </div>
        {formData.thumbnailUrl && (
          <img
            src={formData.thumbnailUrl}
            alt="Thumbnail preview"
            className="mb-2 h-20 w-20 rounded-md object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={isSubmitting || uploadingKey === 'thumbnail'}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUploadSingle(file, 'thumbnail');
          }}
          className="block w-full text-sm text-gray-600"
        />
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Upload className="h-4 w-4" />
          Gallery images (role: gallery)
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={isSubmitting || uploadingKey === 'gallery'}
          onChange={(event) => void onUploadGallery(event.target.files)}
          className="mb-3 block w-full text-sm text-gray-600"
        />
        {formData.galleryUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {formData.galleryUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="relative">
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveGallery(index)}
                  className="absolute -top-2 -right-2 rounded-full bg-white text-red-600 shadow"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Mobile try-on config</p>
            <p className="mt-1 text-xs text-gray-500">
              Phan nay chi cau hinh workflow va runtime cho try-on tren mobile. File poster, GLB va USDZ
              duoc upload theo tung bien the o phia tren.
            </p>
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
            Bat try-on cho mobile
          </label>
        </div>

        {!supportsTryOn ? (
          <p className="mt-3 text-xs font-medium text-amber-700">
            Try-on chi ap dung cho san pham thuoc category frame hoac sunglasses trong mobile app hien tai.
          </p>
        ) : null}

        {formData.tryOnEnabled ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
              <p className="font-semibold">Manager can nho:</p>
              <p className="mt-1">Moi bien the muon thu kinh nen co image, poster, GLB va USDZ rieng.</p>
              <p className="mt-1">Toi da {MAX_TRY_ON_MODELS} bien the duoc map try-on trong 1 san pham.</p>
              <p className="mt-1">Effect path la tuy chon nang cao. Da so truong hop co the de trong.</p>
            </div>

            {mappedTryOnModelCount > MAX_TRY_ON_MODELS ? (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                Giam so bien the da map GLB/USDZ xuong {MAX_TRY_ON_MODELS} hoac it hon truoc khi luu san pham try-on.
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Trang thai try-on
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
                    <SelectValue placeholder="Chon trang thai" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRY_ON_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                label="Scene / effect code (tuy chon)"
                value={formData.tryOnScene}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    tryOnScene: event.target.value,
                  }))
                }
                placeholder="Vi du: effect kx..."
              />
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
                Neu trang thai la Da duyet hoac Dang hien thi, moi bien the da bat try-on phai co du ca GLB va USDZ.
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

            <p className="rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-600">
              Neu chi dung GLB/USDZ theo tung bien the, ban co the de trong toan bo nhom field nang cao ben duoi.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Web AR URL (tuy chon)"
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
                label="Launch URL fallback (tuy chon)"
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
                label="Effect path (nang cao, thuong de trong)"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Resource paths bo sung (tuy chon)
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
                placeholder="Moi dong 1 resource path"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prefab rotation (tuy chon)"
                value={formData.tryOnRotation}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    tryOnRotation: event.target.value,
                  }))
                }
                placeholder="270 0 0"
              />
              <Input
                label="Prefab scale (tuy chon)"
                value={formData.tryOnScale}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    tryOnScale: event.target.value,
                  }))
                }
                placeholder="0.019 0.019 0.01"
              />
              <Input
                label="Prefab translation (tuy chon)"
                value={formData.tryOnTranslation}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    tryOnTranslation: event.target.value,
                  }))
                }
                placeholder="0 0 0"
              />
              <Input
                label="Prefab gravity (tuy chon)"
                value={formData.tryOnGravity}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    tryOnGravity: event.target.value,
                  }))
                }
                placeholder="0 0 0"
              />
              <Input
                label="Prefab cut (tuy chon)"
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

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
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
              Bat physics cho prefab (nang cao)
            </label>
          </div>
        ) : null}
      </div>

      {(onCancel || onSubmit) && (
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          {onSubmit && (
            <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
