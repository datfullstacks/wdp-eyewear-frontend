'use client';

import { useEffect, useCallback, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  Upload,
  XCircle,
  Save,
  SendHorizonal,
  Eye,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { uploadApi } from '@/api';
import { generateSlug } from '@/lib/productHelpers';
import {
  productUpsertSchema,
  type ProductUpsertFormValues,
  PRODUCT_TYPES,
  PRODUCT_STATUS_VALUES,
  SEASON_VALUES,
  GENDER_VALUES,
  SHAPE_VALUES,
  FRAME_MATERIAL_VALUES,
  RIM_TYPE_VALUES,
  LENS_TYPE_VALUES,
  LENS_MATERIAL_VALUES,
} from '@/lib/validation/product.schema';

/* ───────── Label Maps ───────── */

const TYPE_LABELS: Record<string, string> = {
  sunglasses: 'Kính mát',
  frame: 'Gọng kính',
  lens: 'Tròng kính',
  contact_lens: 'Lens áp tròng',
  accessory: 'Phụ kiện',
  service: 'Dịch vụ',
  bundle: 'Combo / Bộ sản phẩm',
  gift_card: 'Thẻ quà tặng',
  other: 'Khác',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  active: 'Đang bán',
  inactive: 'Ngừng bán',
  out_of_stock: 'Hết hàng',
};

/* ───────── Props ───────── */

export interface ProductFormFullProps {
  defaultValues?: Partial<ProductUpsertFormValues>;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
  onSubmit: (values: ProductUpsertFormValues, action: 'draft' | 'active') => void;
  onCancel?: () => void;
}

/* ───────── Helper: Field wrapper ───────── */

function Field({
  label,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ───────── Main Component ───────── */

export function ProductFormFull({
  defaultValues,
  mode,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ProductFormFullProps) {
  const [uploadingKey, setUploadingKey] = useState('');
  const [uploadError, setUploadError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductUpsertFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productUpsertSchema) as any,
    defaultValues: {
      type: 'frame',
      status: 'draft',
      inventoryTrack: true,
      preOrderAllowCod: true,
      comboDefaultNonRx: true,
      galleryUrls: [],
      variants: [{ sku: '', color: '', size: '', stock: 0 }],
      ...defaultValues,
    },
  });

  const { fields: variantFields, append: addVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const productType = watch('type');
  const productName = watch('name');
  const preOrderEnabled = watch('preOrderEnabled');
  const presetComboEnabled = watch('presetComboEnabled');
  const tryOnEnabled = watch('tryOnEnabled');
  const heroImageUrl = watch('heroImageUrl');
  const thumbnailUrl = watch('thumbnailUrl');
  const galleryUrls = watch('galleryUrls') || [];

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' && productName) {
      const s = generateSlug(productName);
      setValue('slug', s);
    }
  }, [productName, mode, setValue]);

  // Show/hide type-dependent sections
  const isFrameOrSunglasses = productType === 'frame' || productType === 'sunglasses';
  const isLens = productType === 'lens';
  const isContactLens = productType === 'contact_lens';
  const isAccessory = productType === 'accessory';
  const isBundle = productType === 'bundle';
  const supportsTryOn = isFrameOrSunglasses;

  /* ───────── File Upload ───────── */

  const handleUploadSingle = useCallback(
    async (file: File, role: 'hero' | 'thumbnail') => {
      setUploadingKey(role);
      setUploadError('');
      try {
        const result = await uploadApi.uploadFile(file);
        if (role === 'hero') {
          setValue('heroImageUrl', result.url);
        } else {
          setValue('thumbnailUrl', result.url);
        }
      } catch (err) {
        setUploadError(`Upload ${role} thất bại: ${err instanceof Error ? err.message : 'Lỗi'}`);
      } finally {
        setUploadingKey('');
      }
    },
    [setValue]
  );

  const handleUploadGallery = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploadingKey('gallery');
      setUploadError('');
      try {
        const results = await Promise.all(
          Array.from(files).map((f) => uploadApi.uploadFile(f))
        );
        const newUrls = results.map((r) => r.url);
        setValue('galleryUrls', [...(galleryUrls || []), ...newUrls]);
      } catch (err) {
        setUploadError(`Upload gallery thất bại: ${err instanceof Error ? err.message : 'Lỗi'}`);
      } finally {
        setUploadingKey('');
      }
    },
    [galleryUrls, setValue]
  );

  const handleRemoveGallery = useCallback(
    (index: number) => {
      setValue(
        'galleryUrls',
        (galleryUrls || []).filter((_, i) => i !== index)
      );
    },
    [galleryUrls, setValue]
  );

  /* ───────── Submit handlers ───────── */

  const doSubmit = (action: 'draft' | 'active') =>
    handleSubmit((values) => onSubmit(values, action))();

  /* ───────── Render helpers for tabs ───────── */

  const errMsg = (path: string) => {
    const parts = path.split('.');
    let obj: Record<string, unknown> = errors as Record<string, unknown>;
    for (const p of parts) {
      if (!obj || typeof obj !== 'object') return undefined;
      obj = obj[p] as Record<string, unknown>;
    }
    return (obj as unknown as { message?: string })?.message;
  };

  /* ═══════════════════════ RENDER ═══════════════════════ */

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="flex w-full flex-wrap gap-1">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="pricing">Giá &amp; Tồn kho</TabsTrigger>
          <TabsTrigger value="variants">Biến thể</TabsTrigger>
          <TabsTrigger value="specs">Thông số</TabsTrigger>
          <TabsTrigger value="media">Hình ảnh &amp; Try-on</TabsTrigger>
          <TabsTrigger value="seo">SEO &amp; Phân loại</TabsTrigger>
          {(preOrderEnabled || isBundle || presetComboEnabled) && (
            <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
          )}
        </TabsList>

        {/* ──── TAB 1: Basic Info ──── */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card className="space-y-4 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Loại sản phẩm" error={errMsg('type')} required>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {TYPE_LABELS[t] || t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field label="Trạng thái" error={errMsg('status')}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value || 'draft'} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_STATUS_VALUES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABELS[s] || s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <Field label="Tên sản phẩm" error={errMsg('name')} required>
              <Input {...register('name')} placeholder="VD: Gọng kính Titanium Classic" />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Slug (URL)" error={errMsg('slug')} hint="Tự động sinh từ tên, có thể sửa">
                <Input {...register('slug')} placeholder="gong-kinh-titanium-classic" />
              </Field>

              <Field label="Thương hiệu" error={errMsg('brand')} required>
                <Input {...register('brand')} placeholder="VD: Ray-Ban" />
              </Field>
            </div>

            <Field label="Mô tả" error={errMsg('description')}>
              <Textarea
                {...register('description')}
                rows={3}
                placeholder="Mô tả sản phẩm..."
              />
            </Field>
          </Card>
        </TabsContent>

        {/* ──── TAB 2: Pricing & Inventory ──── */}
        <TabsContent value="pricing" className="space-y-4 pt-4">
          <Card className="space-y-4 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Giá sản phẩm</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Giá gốc (VND)" error={errMsg('basePrice')} required>
                <Input
                  type="number"
                  {...register('basePrice', { valueAsNumber: true })}
                  placeholder="0"
                />
              </Field>
              <Field
                label="Giá khuyến mãi (VND)"
                error={errMsg('salePrice')}
                hint="Để trống nếu không giảm giá"
              >
                <Input
                  type="number"
                  {...register('salePrice', { valueAsNumber: true })}
                  placeholder="Tuỳ chọn"
                />
              </Field>
              <Field label="MSRP (VND)" error={errMsg('msrp')} hint="Giá đề xuất nhà sản xuất">
                <Input
                  type="number"
                  {...register('msrp', { valueAsNumber: true })}
                  placeholder="Tuỳ chọn"
                />
              </Field>
            </div>
            <p className="text-xs text-slate-500">
              * Currency (VND) và Tax Rate là config hệ thống, không cần nhập.
              Discount % tự tính từ giá gốc và giá khuyến mãi.
            </p>
          </Card>

          <Card className="space-y-4 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Tồn kho</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="inventoryTrack"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                      id="inventoryTrack"
                    />
                  )}
                />
                <Label htmlFor="inventoryTrack">Theo dõi tồn kho</Label>
              </div>
              <Field label="Ngưỡng cảnh báo" error={errMsg('inventoryThreshold')}>
                <Input
                  type="number"
                  {...register('inventoryThreshold', { valueAsNumber: true })}
                  placeholder="5"
                />
              </Field>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="preOrderEnabled"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    id="preOrderEnabled"
                  />
                )}
              />
              <Label htmlFor="preOrderEnabled" className="font-semibold">
                Cho phép đặt trước (Pre-order)
              </Label>
            </div>
            {preOrderEnabled && (
              <div className="space-y-4 border-l-2 border-indigo-200 pl-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Mở đặt từ" error={errMsg('preOrderStartAt')}>
                    <Input type="date" {...register('preOrderStartAt')} />
                  </Field>
                  <Field label="Đóng đặt lúc" error={errMsg('preOrderEndAt')}>
                    <Input type="date" {...register('preOrderEndAt')} />
                  </Field>
                  <Field label="Dự kiến giao từ" error={errMsg('preOrderShipFrom')}>
                    <Input type="date" {...register('preOrderShipFrom')} />
                  </Field>
                  <Field label="Dự kiến giao đến" error={errMsg('preOrderShipTo')}>
                    <Input type="date" {...register('preOrderShipTo')} />
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="% đặt cọc" error={errMsg('preOrderDepositPercent')} hint="0 = thanh toán 100%">
                    <Input
                      type="number"
                      {...register('preOrderDepositPercent', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </Field>
                  <Field label="Số lượng tối đa/đơn" error={errMsg('preOrderMaxQty')}>
                    <Input
                      type="number"
                      {...register('preOrderMaxQty', { valueAsNumber: true })}
                      placeholder="Không giới hạn"
                    />
                  </Field>
                  <div className="flex items-center gap-2 pt-6">
                    <Controller
                      control={control}
                      name="preOrderAllowCod"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                          id="preOrderAllowCod"
                        />
                      )}
                    />
                    <Label htmlFor="preOrderAllowCod">Cho phép COD</Label>
                  </div>
                </div>
                <Field label="Ghi chú đặt trước" error={errMsg('preOrderNote')}>
                  <Input {...register('preOrderNote')} placeholder='VD: "Ships in week 3/2"' />
                </Field>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ──── TAB 3: Variants ──── */}
        <TabsContent value="variants" className="space-y-4 pt-4">
          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Biến thể sản phẩm</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addVariant({ sku: '', color: '', size: '', stock: 0 })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Thêm biến thể
              </Button>
            </div>

            {variantFields.length === 0 && (
              <p className="text-sm text-slate-500">
                Chưa có biến thể. Thêm ít nhất 1 biến thể để quản lý SKU, màu, size, tồn kho.
              </p>
            )}

            {variantFields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 md:grid-cols-5"
              >
                <Field label="SKU" error={errors.variants?.[index]?.sku?.message} required>
                  <Input
                    {...register(`variants.${index}.sku`)}
                    placeholder="VD: RB-AVT-BLK-M"
                  />
                </Field>
                <Field label="Màu" error={errors.variants?.[index]?.color?.message}>
                  <Input
                    {...register(`variants.${index}.color`)}
                    placeholder="VD: Đen"
                  />
                </Field>
                <Field label="Size" error={errors.variants?.[index]?.size?.message}>
                  <Input
                    {...register(`variants.${index}.size`)}
                    placeholder="VD: M"
                  />
                </Field>
                <Field label="Giá riêng" error={errors.variants?.[index]?.price?.message} hint="Để trống = giá gốc">
                  <Input
                    type="number"
                    {...register(`variants.${index}.price`, { valueAsNumber: true })}
                    placeholder="Tuỳ chọn"
                  />
                </Field>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Tồn kho" error={errors.variants?.[index]?.stock?.message} required>
                      <Input
                        type="number"
                        {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </Field>
                  </div>
                  {variantFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mb-0.5 text-red-600 hover:text-red-700"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* ──── TAB 4: Specs (type-dependent) ──── */}
        <TabsContent value="specs" className="space-y-4 pt-4">
          {/* Common specs */}
          <Card className="space-y-4 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Thông số chung</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Hình dạng" error={errMsg('specsCommon.shape')}>
                <Controller
                  control={control}
                  name="specsCommon.shape"
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHAPE_VALUES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Giới tính" error={errMsg('specsCommon.gender')}>
                <Controller
                  control={control}
                  name="specsCommon.gender"
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_VALUES.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Trọng lượng (gram)" error={errMsg('specsCommon.weightGram')}>
                <Input
                  type="number"
                  {...register('specsCommon.weightGram', { valueAsNumber: true })}
                  placeholder="VD: 28"
                />
              </Field>
            </div>
          </Card>

          {/* Dimensions - for frame/sunglasses/lens */}
          {(isFrameOrSunglasses || isLens) && (
            <Card className="space-y-4 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Kích thước (mm)</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Ngang gọng" error={errMsg('specsDimensions.frameWidthMm')}>
                  <Input
                    type="number"
                    {...register('specsDimensions.frameWidthMm', { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Cầu kính" error={errMsg('specsDimensions.bridgeMm')}>
                  <Input
                    type="number"
                    {...register('specsDimensions.bridgeMm', { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Càng kính" error={errMsg('specsDimensions.templeLengthMm')}>
                  <Input
                    type="number"
                    {...register('specsDimensions.templeLengthMm', { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Ngang tròng" error={errMsg('specsDimensions.lensWidthMm')}>
                  <Input
                    type="number"
                    {...register('specsDimensions.lensWidthMm', { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Cao tròng" error={errMsg('specsDimensions.lensHeightMm')}>
                  <Input
                    type="number"
                    {...register('specsDimensions.lensHeightMm', { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Độ ôm (fit)">
                  <Controller
                    control={control}
                    name="specsDimensions.fit"
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="narrow">Narrow</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="wide">Wide</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>
            </Card>
          )}

          {/* Frame specs - for frame/sunglasses */}
          {isFrameOrSunglasses && (
            <Card className="space-y-4 p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Thông số gọng {productType === 'sunglasses' ? '& kính mát' : ''}
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Chất liệu gọng">
                  <Controller
                    control={control}
                    name="specsFrame.material"
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                        <SelectContent>
                          {FRAME_MATERIAL_VALUES.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Loại viền">
                  <Controller
                    control={control}
                    name="specsFrame.rimType"
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                        <SelectContent>
                          {RIM_TYPE_VALUES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Loại bản lề">
                  <Input {...register('specsFrame.hingeType')} placeholder="VD: spring, standard" />
                </Field>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name="specsFrame.nosePads"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        id="nosePads"
                      />
                    )}
                  />
                  <Label htmlFor="nosePads">Có nose pads</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name="specsFrame.rxReady"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        id="rxReady"
                      />
                    )}
                  />
                  <Label htmlFor="rxReady">Hỗ trợ lắp độ (Rx-ready)</Label>
                </div>
                {productType === 'sunglasses' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name="specsFrame.polarized"
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            id="polarized"
                          />
                        )}
                      />
                      <Label htmlFor="polarized">Phân cực (Polarized)</Label>
                    </div>
                    <Field label="Chống UV">
                      <Input
                        {...register('specsFrame.uvProtection')}
                        placeholder="VD: UV400"
                        className="w-32"
                      />
                    </Field>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Lens specs */}
          {isLens && (
            <Card className="space-y-4 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Thông số tròng kính</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Loại tròng">
                  <Controller
                    control={control}
                    name="specsLens.lensType"
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                        <SelectContent>
                          {LENS_TYPE_VALUES.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Chất liệu tròng">
                  <Controller
                    control={control}
                    name="specsLens.material"
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                        <SelectContent>
                          {LENS_MATERIAL_VALUES.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Chiết suất (index)">
                  <Input {...register('specsLens.index')} placeholder="VD: 1.67" />
                </Field>
                <Field label="Khoảng độ hỗ trợ">
                  <Input {...register('specsLens.prescriptionRange')} placeholder="VD: -12.00 ~ +6.00" />
                </Field>
                <Field label="Lớp phủ (coatings)">
                  <Input {...register('specsLens.coatings')} placeholder="VD: anti-reflective, hydrophobic" />
                </Field>
                <div className="flex items-center gap-2 pt-6">
                  <Controller
                    control={control}
                    name="specsLens.blueLightFilter"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        id="blueLightFilter"
                      />
                    )}
                  />
                  <Label htmlFor="blueLightFilter">Chống ánh sáng xanh</Label>
                </div>
              </div>
            </Card>
          )}

          {/* Contact Lens specs */}
          {isContactLens && (
            <Card className="space-y-4 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Thông số lens áp tròng</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Khoảng độ">
                  <Input {...register('specsContactLens.powerRange')} placeholder="VD: -0.50 ~ -10.00" />
                </Field>
                <Field label="Chu kỳ thay">
                  <Input {...register('specsContactLens.replacementCycle')} placeholder="VD: daily, monthly" />
                </Field>
                <Field label="Độ cong (BC mm)">
                  <Input {...register('specsContactLens.baseCurveMm')} placeholder="VD: 8.6" />
                </Field>
                <Field label="Đường kính (mm)">
                  <Input {...register('specsContactLens.diameterMm')} placeholder="VD: 14.2" />
                </Field>
                <Field label="Độ ẩm (%)">
                  <Input
                    type="number"
                    {...register('specsContactLens.waterContentPercent', { valueAsNumber: true })}
                    placeholder="VD: 38"
                  />
                </Field>
              </div>
            </Card>
          )}

          {/* Accessory specs */}
          {isAccessory && (
            <Card className="space-y-4 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Thông số phụ kiện</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Loại phụ kiện">
                  <Input {...register('specsAccessory.accessoryType')} placeholder="VD: case, cloth, chain" />
                </Field>
                <Field label="Chất liệu">
                  <Input {...register('specsAccessory.material')} placeholder="VD: leather, microfiber" />
                </Field>
                <Field label="Tương thích với">
                  <Input {...register('specsAccessory.compatibleWith')} placeholder="VD: all frames" />
                </Field>
              </div>
            </Card>
          )}

          {/* No type-specific specs */}
          {!isFrameOrSunglasses && !isLens && !isContactLens && !isAccessory && (
            <Card className="p-5">
              <p className="text-sm text-slate-500">
                Không có thông số kỹ thuật riêng cho loại {TYPE_LABELS[productType] || productType}.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* ──── TAB 5: Media & Try-on ──── */}
        <TabsContent value="media" className="space-y-4 pt-4">
          {uploadError && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4" />
              {uploadError}
            </div>
          )}

          <Card className="space-y-4 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Ảnh sản phẩm</h3>

            {/* Hero */}
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Upload className="h-4 w-4" /> Ảnh chính (Hero)
              </div>
              {heroImageUrl && (
                <div className="relative mb-2 inline-block">
                  <img src={heroImageUrl} alt="Hero" className="h-24 w-24 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setValue('heroImageUrl', '')}
                    className="absolute -right-2 -top-2 rounded-full bg-white text-red-600 shadow"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                disabled={isSubmitting || uploadingKey === 'hero'}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUploadSingle(f, 'hero');
                }}
                className="block w-full text-sm text-slate-600"
              />
              {uploadingKey === 'hero' && (
                <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                  <Loader2 className="h-3 w-3 animate-spin" /> Đang tải...
                </div>
              )}
            </div>

            {/* Thumbnail */}
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Upload className="h-4 w-4" /> Ảnh thumbnail
              </div>
              {thumbnailUrl && (
                <div className="relative mb-2 inline-block">
                  <img src={thumbnailUrl} alt="Thumbnail" className="h-20 w-20 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setValue('thumbnailUrl', '')}
                    className="absolute -right-2 -top-2 rounded-full bg-white text-red-600 shadow"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                disabled={isSubmitting || uploadingKey === 'thumbnail'}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUploadSingle(f, 'thumbnail');
                }}
                className="block w-full text-sm text-slate-600"
              />
            </div>

            {/* Gallery */}
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Upload className="h-4 w-4" /> Thư viện ảnh (Gallery)
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isSubmitting || uploadingKey === 'gallery'}
                onChange={(e) => void handleUploadGallery(e.target.files)}
                className="mb-3 block w-full text-sm text-slate-600"
              />
              {uploadingKey === 'gallery' && (
                <div className="mb-2 flex items-center gap-1 text-xs text-amber-600">
                  <Loader2 className="h-3 w-3 animate-spin" /> Đang tải...
                </div>
              )}
              {galleryUrls.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {galleryUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative">
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGallery(index)}
                        className="absolute -right-1 -top-1 rounded-full bg-white text-red-600 shadow"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Try-on section */}
          {supportsTryOn && (
            <Card className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="tryOnEnabled"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      id="tryOnEnabled"
                    />
                  )}
                />
                <Label htmlFor="tryOnEnabled" className="font-semibold">
                  Bật thử kính ảo (Banuba AR)
                </Label>
              </div>
              {tryOnEnabled && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-slate-700">
                  <p className="font-medium text-amber-800">Thông tin try-on</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
                    <li>Asset try-on đã được team AR chuẩn bị sẵn trên hệ thống.</li>
                    <li>Sau khi lưu sản phẩm, team AR sẽ gắn asset vào từng biến thể màu.</li>
                    <li>Trạng thái try-on sẽ chuyển qua luồng: Draft → Submitted → Approved → Published.</li>
                    <li>Manager không cần upload file 3D thủ công.</li>
                  </ul>
                  <p className="mt-2 text-xs text-slate-500">
                    * Các trường audit (submittedBy, approvedBy, publishedAt…) do hệ thống tự quản lý.
                  </p>
                </div>
              )}
            </Card>
          )}
        </TabsContent>

        {/* ──── TAB 6: SEO & Classification ──── */}
        <TabsContent value="seo" className="space-y-4 pt-4">
          <Card className="space-y-4 p-5">
            <h3 className="text-sm font-semibold text-slate-900">SEO &amp; Phân loại</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Model code" hint="Mã model của nhà sản xuất">
                <Input {...register('modelCode')} placeholder="VD: RB3025" />
              </Field>
              <Field label="Xuất xứ">
                <Input {...register('countryOfOrigin')} placeholder="VD: Italy" />
              </Field>
              <Field label="Collections" hint="Phân cách bằng dấu phẩy">
                <Input {...register('collections')} placeholder="VD: summer-2025, bestseller" />
              </Field>
              <Field label="Mùa">
                <Controller
                  control={control}
                  name="season"
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn mùa" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEASON_VALUES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
            <Field label="Keywords SEO" hint="Phân cách bằng dấu phẩy">
              <Input
                {...register('keywords')}
                placeholder="VD: kính mát, aviator, ray-ban, chống UV"
              />
            </Field>
          </Card>

          <Card className="space-y-4 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Hậu mãi</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Đổi trả trong (ngày)">
                <Input
                  type="number"
                  {...register('returnWindowDays', { valueAsNumber: true })}
                  placeholder="VD: 30"
                />
              </Field>
              <Field label="Bảo hành (tháng)">
                <Input
                  type="number"
                  {...register('warrantyMonths', { valueAsNumber: true })}
                  placeholder="VD: 12"
                />
              </Field>
            </div>
            <Field label="Dịch vụ đi kèm" hint="Phân cách bằng dấu phẩy">
              <Input
                {...register('servicesIncluded')}
                placeholder="VD: Tặng hộp, khăn lau, thay mắt kính miễn phí 1 năm"
              />
            </Field>
            <Field label="Ghi chú tương thích">
              <Textarea
                {...register('compatibilityNotes')}
                rows={2}
                placeholder="VD: Tương thích với tất cả tròng kính WDP series..."
              />
            </Field>
          </Card>
        </TabsContent>

        {/* ──── TAB 7: Advanced (conditional) ──── */}
        <TabsContent value="advanced" className="space-y-4 pt-4">
          {/* Preset Combo */}
          {isBundle && (
            <Card className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="presetComboEnabled"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      id="presetComboEnabled"
                    />
                  )}
                />
                <Label htmlFor="presetComboEnabled" className="font-semibold">
                  Cấu hình Combo gọng + tròng
                </Label>
              </div>
              {presetComboEnabled && (
                <div className="space-y-4 border-l-2 border-amber-200 pl-4">
                  <Field label="ID sản phẩm gọng" hint="Product ID của gọng kính trong combo">
                    <Input {...register('comboFrameProductId')} placeholder="ObjectId" />
                  </Field>
                  <Field label="ID sản phẩm tròng" hint="Product ID của tròng kính trong combo">
                    <Input {...register('comboLensProductId')} placeholder="ObjectId" />
                  </Field>
                  <div className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name="comboDefaultNonRx"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                          id="comboDefaultNonRx"
                        />
                      )}
                    />
                    <Label htmlFor="comboDefaultNonRx">Mặc định không cần toa (non-Rx)</Label>
                  </div>
                </div>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ──── Action bar ──── */}
      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {Object.keys(errors).length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {Object.keys(errors).length} lỗi validation
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Huỷ
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => doSubmit('draft')}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Lưu nháp
          </Button>
          <Button
            type="button"
            onClick={() => doSubmit('active')}
            disabled={isSubmitting}
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            {isSubmitting ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="mr-1 h-4 w-4" />
            )}
            {mode === 'create' ? 'Tạo & Kích hoạt' : 'Cập nhật & Kích hoạt'}
          </Button>
        </div>
      </div>
    </form>
  );
}
