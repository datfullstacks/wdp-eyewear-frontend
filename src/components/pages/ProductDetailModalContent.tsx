'use client';

import productApi, { type ProductDetail } from '@/api/products';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type Props = {
  product: ProductDetail;
};

const TYPE_LABELS: Record<string, string> = {
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

function toTitle(value?: string) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '-';
  const normalized = trimmed.replace(/_/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function toTypeLabel(value?: string) {
  if (!value) return '-';
  return TYPE_LABELS[value] || toTitle(value);
}

function toStatusLabel(value?: string) {
  const normalized = (value || '').toLowerCase();
  if (!normalized) return '-';
  if (normalized === 'active') return 'Đang bán';
  if (normalized === 'inactive') return 'Ngừng bán';
  if (normalized === 'draft') return 'Nháp';
  if (normalized === 'out_of_stock') return 'Hết hàng';
  return toTitle(value);
}

function statusTone(value?: string) {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'inactive') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (normalized === 'active') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (normalized === 'draft') return 'border-slate-200 bg-slate-50 text-slate-700';
  if (normalized === 'out_of_stock') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-slate-200 bg-white text-slate-700';
}

function formatCurrency(value?: number, currency = 'VND') {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value);
}

function formatBoolean(value?: boolean) {
  if (typeof value !== 'boolean') return '-';
  return value ? 'Có' : 'Không';
}

function formatLeadTime(value?: string) {
  if (!value) return '-';
  const match = value.match(/^(\d+)\s*d$/i);
  if (match) return `${match[1]} ngày`;
  return value;
}

function formatListValue(value: unknown) {
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '-';
  if (typeof value === 'boolean') return formatBoolean(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value || '-';
  return '-';
}

function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={cn(
          'break-words font-semibold text-slate-900',
          mono ? 'font-mono text-[13px]' : ''
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ProductDetailModalContent({ product }: Props) {
  const productType = (product.type || '').toLowerCase();
  const currency = product.pricing?.currency || 'VND';

  const basePrice = product.pricing?.basePrice ?? product.price;
  const salePrice = product.pricing?.salePrice;
  const currentPrice = salePrice ?? basePrice;
  const discountPercent =
    product.pricing?.discountPercent ??
    (typeof basePrice === 'number' &&
    typeof salePrice === 'number' &&
    basePrice > 0 &&
    salePrice < basePrice
      ? Math.round(((basePrice - salePrice) / basePrice) * 100)
      : undefined);

  const taxRate = product.pricing?.taxRate;
  const priceAfterTax =
    typeof currentPrice === 'number' && typeof taxRate === 'number'
      ? currentPrice * (1 + taxRate / 100)
      : undefined;

  const variants = product.variants || [];
  const stockTotal =
    variants.length > 0 ? variants.reduce((sum, v) => sum + Number(v.stock || 0), 0) : product.stock;

  const preOrderEnabled = !!product.preOrder?.enabled;
  const allowCod = product.preOrder?.allowCod;

  const availability = useMemo(() => {
    if (preOrderEnabled) {
      return { label: 'Pre-order', tone: 'border-indigo-200 bg-indigo-50 text-indigo-700' };
    }
    const qty = typeof stockTotal === 'number' ? stockTotal : 0;
    if (qty <= 0 || String(product.status || '').toLowerCase() === 'out_of_stock') {
      return { label: 'Hết hàng', tone: 'border-rose-200 bg-rose-50 text-rose-700' };
    }
    return { label: 'Còn hàng', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
  }, [preOrderEnabled, product.status, stockTotal]);

  const specs = (product.specs || {}) as Record<string, any>;
  const common = (specs.common || {}) as Record<string, any>;
  const dimensions = (specs.dimensions || {}) as Record<string, any>;
  const frame = (specs.frame || {}) as Record<string, any>;
  const lens = (specs.lens || {}) as Record<string, any>;
  const contactLens = (specs.contactLens || specs.contact_lens || {}) as Record<string, any>;
  const accessory = (specs.accessory || {}) as Record<string, any>;
  const sunglasses = (specs.sunglasses || {}) as Record<string, any>;
  const service = (specs.service || {}) as Record<string, any>;
  const bundle = (specs.bundle || {}) as Record<string, any>;
  const giftCard = (specs.giftCard || specs.gift_card || {}) as Record<string, any>;

  const mediaAssets = product.media?.assets || [];
  const hero2d = mediaAssets.find((a) => a?.assetType === '2d' && a?.role === 'hero' && a?.url);
  const gallery2d = mediaAssets
    .filter((a) => a?.assetType === '2d')
    .filter((a) => ['gallery', 'lifestyle', 'thumbnail', 'hero'].includes(String(a?.role || '')))
    .filter((a) => Boolean(a?.url))
    .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0));
  const model3d = mediaAssets.find((a) => a?.assetType === '3d' && a?.url);
  const hasViewer3d = Boolean(model3d?.url);
  const tryOn = product.media?.tryOn;

  const compatibilityIds = useMemo(() => {
    const ids = product.compatibility?.productIds || [];
    const unique = Array.from(new Set(ids.filter(Boolean)));
    return unique.filter((id) => id !== product.id);
  }, [product.compatibility?.productIds, product.id]);

  const compatCacheRef = useRef(
    new Map<
      string,
      { id: string; name: string; imageUrl?: string; code?: string; sku?: string }
    >()
  );
  const [compatLoading, setCompatLoading] = useState(false);
  const [compatError, setCompatError] = useState<string | null>(null);
  const [compatItems, setCompatItems] = useState<
    Array<{ id: string; name: string; imageUrl?: string; code?: string; sku?: string }>
  >([]);

  useEffect(() => {
    const ids = compatibilityIds.slice(0, 12);
    if (ids.length === 0) {
      setCompatItems([]);
      setCompatLoading(false);
      setCompatError(null);
      return;
    }

    const cache = compatCacheRef.current;
    setCompatItems(ids.map((id) => cache.get(id)).filter(Boolean) as any);

    const toFetch = ids.filter((id) => !cache.has(id));
    if (toFetch.length === 0) return;

    let mounted = true;
    const load = async () => {
      try {
        setCompatLoading(true);
        setCompatError(null);
        const results = await Promise.allSettled(toFetch.map((id) => productApi.getById(id)));
        for (let i = 0; i < results.length; i += 1) {
          const res = results[i];
          const requestedId = toFetch[i];
          if (res.status !== 'fulfilled') {
            cache.set(requestedId, { id: requestedId, name: '(Không tải được)' });
            continue;
          }
          const p = res.value;
          const sku =
            p?.variants?.find((v) => typeof v?.sku === 'string' && v.sku)?.sku || undefined;
          cache.set(requestedId, {
            id: requestedId,
            name: p.name || requestedId,
            imageUrl: p.imageUrl,
            code: p.seo?.modelCode,
            sku,
          });
        }
        if (!mounted) return;
        setCompatItems(ids.map((id) => cache.get(id)).filter(Boolean) as any);
      } catch {
        if (!mounted) return;
        setCompatError('Không thể tải danh sách sản phẩm tương thích.');
      } finally {
        if (mounted) setCompatLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [compatibilityIds]);

  return (
    <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-2">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-sm font-semibold text-slate-900">1) Thông tin tổng quan sản phẩm</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
            <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50">
              <img
                src={hero2d?.url || product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-amber-500">{product.brand || 'WDP'}</p>
              <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>

              <div className="mt-2 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <InfoItem label="Loại sản phẩm" value={toTypeLabel(product.type)} />
                <InfoItem label="Thương hiệu" value={product.brand || '-'} />
                <div>
                  <p className="text-xs text-slate-500">Trạng thái bán</p>
                  <p
                    className={cn(
                      'mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                      statusTone(product.status)
                    )}
                  >
                    {toStatusLabel(product.status)}
                  </p>
                </div>
                <InfoItem
                  label="Đánh giá"
                  value={
                    typeof product.ratingsAverage === 'number'
                      ? (
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span>
                              {product.ratingsAverage}{' '}
                              <span className="text-slate-600 font-semibold">
                                ({product.ratingsQuantity || 0})
                              </span>
                            </span>
                          </span>
                        )
                      : '-'
                  }
                />
              </div>

              {product.description ? (
                <div className="pt-1">
                  <p className="text-xs text-slate-500">Mô tả ngắn</p>
                  <p className="whitespace-pre-line text-sm text-slate-700">{product.description}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
            <p className="text-sm font-semibold text-slate-900">2) Giá bán và điều kiện bán</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <InfoItem label="Giá gốc" value={formatCurrency(basePrice, currency)} />
              <InfoItem label="Giá khuyến mãi" value={formatCurrency(salePrice, currency)} />
              <InfoItem
                label="Giảm giá"
                value={typeof discountPercent === 'number' ? `${discountPercent}%` : '-'}
              />
              <InfoItem label="Tiền tệ" value={currency} />
              <InfoItem label="Thuế" value={typeof taxRate === 'number' ? `${taxRate}%` : '-'} />
              <InfoItem label="Cho COD" value={formatBoolean(allowCod)} />
              <InfoItem label="Cho đặt trước" value={formatBoolean(preOrderEnabled)} />
              <div className="col-span-2">
                <p className="text-xs text-slate-500">Giá sau thuế</p>
                <p className="text-base font-semibold text-slate-900">
                  {formatCurrency(priceAfterTax, currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
            <p className="text-sm font-semibold text-slate-900">3) Tồn kho và khả dụng</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div>
                <p className="text-xs text-slate-500">Trạng thái tồn kho</p>
                <p
                  className={cn(
                    'mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                    availability.tone
                  )}
                >
                  {availability.label}
                </p>
              </div>
              <InfoItem
                label="Tổng tồn kho"
                value={typeof stockTotal === 'number' ? stockTotal : '-'}
              />
              <InfoItem
                label="Kho mặc định"
                value={
                  product.fulfillment?.warehouseDefaultLocation ||
                  product.inventory?.warehouseDefaultLocation ||
                  '-'
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
        <p className="text-sm font-semibold text-slate-900">4) Danh sách biến thể</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/70 text-xs text-slate-500">
                <th className="py-2 pr-3 font-semibold">SKU</th>
                <th className="py-2 pr-3 font-semibold">Màu</th>
                <th className="py-2 pr-3 font-semibold">Size</th>
                <th className="py-2 pr-3 font-semibold">Giá</th>
                <th className="py-2 pr-3 font-semibold">Tồn kho</th>
                <th className="py-2 pr-3 font-semibold">Vị trí kho</th>
              </tr>
            </thead>
            <tbody>
              {variants.length > 0 ? (
                variants.map((variant, idx) => (
                  <tr
                    key={`${variant.sku || 'variant'}-${idx}`}
                    className="border-b border-slate-100 text-slate-700 last:border-b-0"
                  >
                    <td className="py-2 pr-3 font-semibold text-slate-900">{variant.sku || '-'}</td>
                    <td className="py-2 pr-3">{variant.options?.color || '-'}</td>
                    <td className="py-2 pr-3">{variant.options?.size || '-'}</td>
                    <td className="py-2 pr-3">
                      {formatCurrency(variant.price ?? currentPrice, currency)}
                    </td>
                    <td className="py-2 pr-3">
                      {typeof variant.stock === 'number' ? variant.stock : '-'}
                    </td>
                    <td className="py-2 pr-3">{variant.warehouseLocation || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-slate-600" colSpan={6}>
                    Không có biến thể.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-sm font-semibold text-slate-900">
            5) Thông tin prescription / khả năng lắp kính
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
            {productType === 'frame' || productType === 'sunglasses' ? (
              <>
                <InfoItem label="Có hỗ trợ lắp độ" value={formatBoolean(frame.rxReady)} />
                <InfoItem label="Chất liệu gọng" value={toTitle(frame.material)} />
                <InfoItem label="Loại bản lề" value={toTitle(frame.hingeType)} />
                <InfoItem label="Kiểu viền" value={toTitle(frame.rimType)} />
                <InfoItem label="Có nose pads" value={formatBoolean(frame.nosePads)} />
                {productType === 'sunglasses' ? (
                  <>
                    <InfoItem
                      label="Phân cực"
                      value={formatListValue(sunglasses.polarized ?? frame.polarized)}
                    />
                    <InfoItem
                      label="Chống UV"
                      value={formatListValue(sunglasses.uv ?? sunglasses.uvProtection ?? frame.uv)}
                    />
                  </>
                ) : null}
              </>
            ) : null}

            {productType === 'lens' ? (
              <>
                <InfoItem label="Loại tròng" value={toTitle(lens.lensType)} />
                <InfoItem label="Khoảng độ hỗ trợ" value={formatListValue(lens.prescriptionRange)} />
                <InfoItem label="Chiết suất" value={formatListValue(lens.index)} />
                <InfoItem label="Chất liệu" value={toTitle(lens.material)} />
                <InfoItem label="Chống ánh sáng xanh" value={formatBoolean(lens.blueLightFilter)} />
                <InfoItem label="Lớp phủ" value={formatListValue(lens.coatings)} />
              </>
            ) : null}

            {productType === 'contact_lens' ? (
              <>
                <InfoItem label="Khoảng độ" value={formatListValue(contactLens.powerRange)} />
                <InfoItem
                  label="Chu kỳ thay"
                  value={formatListValue(contactLens.replacementCycle)}
                />
                <InfoItem
                  label="Độ cong"
                  value={formatListValue(contactLens.baseCurveMm)}
                />
                <InfoItem label="Đường kính" value={formatListValue(contactLens.diameterMm)} />
                <InfoItem
                  label="Độ ẩm"
                  value={
                    typeof contactLens.waterContentPercent === 'number'
                      ? `${contactLens.waterContentPercent}%`
                      : formatListValue(contactLens.waterContentPercent)
                  }
                />
              </>
            ) : null}

            {productType !== 'frame' &&
            productType !== 'sunglasses' &&
            productType !== 'lens' &&
            productType !== 'contact_lens' ? (
              <div className="col-span-2 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-slate-600">
                (Không có thông số prescription cho loại sản phẩm này)
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-sm font-semibold text-slate-900">
            6) Kích thước & thông số kỹ thuật để gia công
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <InfoItem label="Form kính" value={toTitle(common.shape)} />
            <InfoItem label="Giới tính" value={toTitle(common.gender)} />
            <InfoItem
              label="Trọng lượng"
              value={
                typeof common.weightGram === 'number'
                  ? `${common.weightGram}g`
                  : formatListValue(common.weightGram)
              }
            />
            <InfoItem label="Độ ôm/fit" value={toTitle(dimensions.fit)} />
            <InfoItem
              label="Ngang gọng"
              value={typeof dimensions.frameWidthMm === 'number' ? `${dimensions.frameWidthMm}mm` : '-'}
            />
            <InfoItem
              label="Cầu kính"
              value={typeof dimensions.bridgeMm === 'number' ? `${dimensions.bridgeMm}mm` : '-'}
            />
            <InfoItem
              label="Càng kính"
              value={
                typeof dimensions.templeLengthMm === 'number'
                  ? `${dimensions.templeLengthMm}mm`
                  : '-'
              }
            />
            <InfoItem
              label="Ngang tròng"
              value={typeof dimensions.lensWidthMm === 'number' ? `${dimensions.lensWidthMm}mm` : '-'}
            />
            <InfoItem
              label="Cao tròng"
              value={
                typeof dimensions.lensHeightMm === 'number'
                  ? `${dimensions.lensHeightMm}mm`
                  : '-'
              }
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
        <p className="text-sm font-semibold text-slate-900">7) Tương thích sản phẩm</p>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {compatibilityIds.length === 0 ? (
            <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-slate-600">
              Không có dữ liệu tương thích.
            </div>
          ) : (
            <>
              {compatError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
                  {compatError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {compatibilityIds.slice(0, 12).map((id) => {
                  const found =
                    compatItems.find((x) => x.id === id) || compatCacheRef.current.get(id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-3"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200/70 bg-white">
                        {found?.imageUrl ? (
                          <img
                            src={found.imageUrl}
                            alt={found.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                            IMG
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">
                          {found?.name || (compatLoading ? 'Đang tải...' : id)}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {found?.sku
                            ? `SKU: ${found.sku}`
                            : found?.code
                              ? `Mã: ${found.code}`
                              : `ID: ${id}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {compatibilityIds.length > 12 ? (
                <p className="text-xs text-slate-500">(Đang hiển thị 12/{compatibilityIds.length})</p>
              ) : null}
            </>
          )}

          {product.compatibility?.notes ? (
            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-3">
              <p className="text-xs font-semibold text-slate-900">Ghi chú tương thích</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                {product.compatibility.notes}
              </p>
            </div>
          ) : null}

          {productType === 'accessory' && accessory.compatibleWith ? (
            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-3">
              <p className="text-xs font-semibold text-slate-900">
                Phụ kiện dùng được với loại nào
              </p>
              <p className="mt-1 text-sm text-slate-700">{formatListValue(accessory.compatibleWith)}</p>
            </div>
          ) : null}
        </div>
      </div>

      {preOrderEnabled ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm font-semibold text-indigo-900">8) Thông tin đặt trước</p>
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-indigo-900 sm:grid-cols-2">
            <InfoItem label="Trạng thái đặt trước" value={formatBoolean(preOrderEnabled)} />
            <InfoItem label="Cho COD" value={formatBoolean(allowCod)} />
            <InfoItem
              label="Thời gian chuẩn bị"
              value={formatLeadTime(product.fulfillment?.leadTime)}
            />
            <InfoItem label="Nhà cung cấp" value={product.fulfillment?.supplier || '-'} />
            <InfoItem
              label="Kho mặc định"
              value={
                product.fulfillment?.warehouseDefaultLocation ||
                product.inventory?.warehouseDefaultLocation ||
                '-'
              }
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-sm font-semibold text-slate-900">9) Thông tin vận hành</p>
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <InfoItem label="Nhà cung cấp" value={product.fulfillment?.supplier || '-'} />
            <InfoItem
              label="Thời gian chuẩn bị"
              value={formatLeadTime(product.fulfillment?.leadTime)}
            />
            <InfoItem
              label="Kho mặc định"
              value={
                product.fulfillment?.warehouseDefaultLocation ||
                product.inventory?.warehouseDefaultLocation ||
                '-'
              }
            />
            <InfoItem
              label="Đổi trả trong"
              value={
                typeof product.fulfillment?.returnWindowDays === 'number'
                  ? `${product.fulfillment.returnWindowDays} ngày`
                  : '-'
              }
            />
            <InfoItem
              label="Bảo hành"
              value={
                typeof product.fulfillment?.warrantyMonths === 'number'
                  ? `${product.fulfillment.warrantyMonths} tháng`
                  : '-'
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-sm font-semibold text-slate-900">
            10) Hậu mãi: đổi trả, bảo hành, hoàn tiền
          </p>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoItem
                label="Đổi trả"
                value={
                  typeof product.fulfillment?.returnWindowDays === 'number'
                    ? `${product.fulfillment.returnWindowDays} ngày`
                    : '-'
                }
              />
              <InfoItem
                label="Bảo hành"
                value={
                  typeof product.fulfillment?.warrantyMonths === 'number'
                    ? `${product.fulfillment.warrantyMonths} tháng`
                    : '-'
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {preOrderEnabled ? (
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  đặt trước
                </span>
              ) : null}
              {productType === 'service' ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  dịch vụ
                </span>
              ) : null}
              {productType === 'gift_card' ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  thẻ quà tặng
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
        <p className="text-sm font-semibold text-slate-900">11) Media hỗ trợ tư vấn / xác nhận mẫu</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Ảnh hero</p>
                <p className="font-semibold text-slate-900">
                  {hero2d?.url || product.imageUrl ? 'Có' : 'Không'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Thư viện ảnh</p>
                <p className="font-semibold text-slate-900">{gallery2d.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Thử kính ảo</p>
                <p className="font-semibold text-slate-900">{tryOn?.enabled ? 'Bật' : 'Tắt'}</p>
                {tryOn?.status ? (
                  <p className="mt-1 text-xs text-slate-500">Trạng thái: {tryOn.status}</p>
                ) : null}
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Trình xem 3D</p>
                <p className="font-semibold text-slate-900">{hasViewer3d ? 'Có' : 'Không'}</p>
              </div>
            </div>
          </div>

          <div>
            {gallery2d.length === 0 ? (
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-600">
                Không có ảnh gallery.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {gallery2d.slice(0, 9).map((asset, idx) => (
                  <div
                    key={`${asset.url}-${idx}`}
                    className="aspect-square overflow-hidden rounded-lg border border-slate-200/70 bg-white"
                    title={String(asset.role || '')}
                  >
                    <img
                      src={asset.url as string}
                      alt={`${product.name} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
        <p className="text-sm font-semibold text-slate-900">12) Thông tin theo từng loại sản phẩm</p>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
          {productType === 'accessory' ? (
            <>
              <InfoItem label="Loại phụ kiện" value={formatListValue(accessory.accessoryType ?? accessory.type)} />
              <InfoItem label="Chất liệu" value={toTitle(accessory.material)} />
              <InfoItem label="Kích thước/Dung tích" value={formatListValue(accessory.size ?? accessory.capacity)} />
              <InfoItem label="Tương thích" value={formatListValue(accessory.compatibleWith)} />
            </>
          ) : productType === 'service' ? (
            <>
              <InfoItem label="Thời lượng" value={formatListValue(service.duration ?? service.durationMinutes ?? service.durationMin)} />
              <InfoItem label="Cần booking" value={formatBoolean(service.bookingRequired ?? service.requiresBooking)} />
              <InfoItem label="Phạm vi dịch vụ" value={formatListValue(service.scope ?? service.serviceScope)} />
            </>
          ) : productType === 'bundle' ? (
            <>
              <InfoItem
                label="Số item trong bundle"
                value={
                  Array.isArray(bundle.items)
                    ? bundle.items.length
                    : Array.isArray(bundle.bundleItems)
                      ? bundle.bundleItems.length
                      : '-'
                }
              />
              <InfoItem label="Ghi chú bundle" value={formatListValue(bundle.note ?? bundle.notes)} />
            </>
          ) : productType === 'gift_card' ? (
            <>
              <InfoItem label="Mệnh giá" value={formatListValue(giftCard.denomination ?? giftCard.value)} />
              <InfoItem label="Hạn sử dụng" value={formatListValue(giftCard.expiryDays ?? giftCard.expiresInDays ?? giftCard.expiry)} />
              <InfoItem label="Cách giao" value={formatListValue(giftCard.deliveryMethod ?? giftCard.delivery)} />
            </>
          ) : (
            <div className="col-span-2 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-slate-600">
              (Chưa có cấu hình hiển thị riêng cho loại: {toTypeLabel(product.type)})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
