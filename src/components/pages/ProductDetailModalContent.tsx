'use client';

import { cn } from '@/lib/utils';
import type { ProducgitDetail } from '@/api/products';

type Props = {
  product: ProductDetail;
};

const formatCurrency = (value?: number, currency = 'VND') => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(
    value
  );
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
};

const formatBoolean = (value?: boolean) => {
  if (typeof value !== 'boolean') return '-';
  return value ? 'Có' : 'Không';
};

const formatLeadTime = (value?: string) => {
  if (!value) return '-';
  const match = value.match(/^(\d+)\s*d$/i);
  if (match) return `${match[1]} ngày`;
  return value;
};

const toTitle = (value?: string) => {
  const trimmed = (value || '').trim();
  if (!trimmed) return '-';
  const normalized = trimmed.replace(/_/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export function ProductDetailModalContent({ product }: Props) {
  const currency = product.pricing?.currency || 'VND';
  const basePrice = product.pricing?.basePrice;
  const taxRate = product.pricing?.taxRate;
  const priceAfterTax =
    typeof basePrice === 'number' && typeof taxRate === 'number'
      ? basePrice * (1 + taxRate / 100)
      : undefined;

  const variants = product.variants || [];
  const variantStockSum =
    variants.length > 0
      ? variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
      : product.stock;

  const threshold = product.inventory?.threshold;
  const trackInventory = product.inventory?.track;
  const isLowStock =
    typeof threshold === 'number' &&
    typeof variantStockSum === 'number' &&
    variantStockSum <= threshold;

  const specs = (product.specs || {}) as Record<string, any>;
  const common = specs.common || {};
  const frame = specs.frame || {};
  const dimensions = specs.dimensions || {};

  const mediaAssets = product.media?.assets || [];
  const hero2d = mediaAssets.find(
    (a) => a.assetType === '2d' && a.role === 'hero'
  );
  const model3d = mediaAssets.find((a) => a.assetType === '3d');
  const hasViewer3d = !!model3d;
  const hasArTryOn = !!product.media?.tryOn?.enabled;

  return (
    <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-2">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-sm font-semibold text-slate-900">
            1️⃣ Thông tin cơ bản
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
            <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-500 uppercase">
                {product.brand || 'WDP'}
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                {product.name}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div>
                  <p className="text-xs text-slate-500">Loại</p>
                  <p className="font-semibold text-slate-900">
                    {toTitle(product.type)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Trạng thái</p>
                  <p className="font-semibold text-slate-900">
                    {toTitle(product.status)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Cập nhật ngày</p>
                  <p className="font-semibold text-slate-900">
                    {formatDate(product.updatedAt)}
                  </p>
                </div>
              </div>
              {product.description ? (
                <div className="pt-1">
                  <p className="text-xs text-slate-500">Mô tả</p>
                  <p className="text-sm text-slate-700">
                    {product.description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
            <p className="text-sm font-semibold text-slate-900">
              💰 2️⃣ Giá bán
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div>
                <p className="text-xs text-slate-500">Giá cơ bản</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(basePrice, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Thuế</p>
                <p className="font-semibold text-slate-900">
                  {typeof taxRate === 'number' ? `${taxRate}%` : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500">
                  Giá sau thuế (tính sẵn)
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {formatCurrency(priceAfterTax, currency)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'rounded-2xl border bg-white/90 p-4',
              isLowStock && trackInventory
                ? 'border-amber-300 bg-amber-50'
                : 'border-slate-200/70'
            )}
          >
            <p className="text-sm font-semibold text-slate-900">
              📦 3️⃣ Tồn kho & kho hàng
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div>
                <p className="text-xs text-slate-500">Theo dõi hàng tồn kho</p>
                <p className="font-semibold text-slate-900">
                  {formatBoolean(trackInventory)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Số lượng tồn kho của biến thể
                </p>
                <p className="font-semibold text-slate-900">
                  {typeof variantStockSum === 'number' ? variantStockSum : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Mức cảnh báo</p>
                <p className="font-semibold text-slate-900">
                  {typeof threshold === 'number' ? threshold : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Kho hàng</p>
                <p className="font-semibold text-slate-900">
                  {product.inventory?.warehouseDefaultLocation || '-'}
                </p>
              </div>
            </div>
            {isLowStock && trackInventory ? (
              <p className="mt-3 text-sm font-semibold text-amber-700">
                Cảnh báo: stock ≤ threshold
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
        <p className="text-sm font-semibold text-slate-900">
          🎨 4️⃣ Biến thể sản phẩm
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/70 text-xs text-slate-500">
                <th className="py-2 pr-3 font-semibold">SKU</th>
                <th className="py-2 pr-3 font-semibold">Màu</th>
                <th className="py-2 pr-3 font-semibold">Kích thướt</th>
                <th className="py-2 pr-3 font-semibold">Giá</th>
                <th className="py-2 pr-3 font-semibold">Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {variants.length > 0 ? (
                variants.map((variant, idx) => (
                  <tr
                    key={`${variant.sku || 'variant'}-${idx}`}
                    className="border-b border-slate-100 text-slate-700 last:border-b-0"
                  >
                    <td className="py-2 pr-3 font-semibold text-slate-900">
                      {variant.sku || '-'}
                    </td>
                    <td className="py-2 pr-3">
                      {variant.options?.color || '-'}
                    </td>
                    <td className="py-2 pr-3">
                      {variant.options?.size || '-'}
                    </td>
                    <td className="py-2 pr-3">
                      {formatCurrency(variant.price ?? basePrice, currency)}
                    </td>
                    <td className="py-2 pr-3">
                      {typeof variant.stock === 'number' ? variant.stock : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-slate-600" colSpan={5}>
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
          <p className="text-sm font-semibold text-slate-900">🚚 5️⃣ Vận hành</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
            <div className="col-span-2">
              <p className="text-xs text-slate-500">Nhà cung cấp</p>
              <p className="font-semibold text-slate-900">
                {product.fulfillment?.supplier || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Thời gian chuẩn bị hàng</p>
              <p className="font-semibold text-slate-900">
                {formatLeadTime(product.fulfillment?.leadTime)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Thời gian đổi trả</p>
              <p className="font-semibold text-slate-900">
                {typeof product.fulfillment?.returnWindowDays === 'number'
                  ? `${product.fulfillment.returnWindowDays} ngày`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Thời gian bảo hành</p>
              <p className="font-semibold text-slate-900">
                {typeof product.fulfillment?.warrantyMonths === 'number'
                  ? `${product.fulfillment.warrantyMonths} tháng`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Kho hàng</p>
              <p className="font-semibold text-slate-900">
                {product.fulfillment?.warehouseDefaultLocation || '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-sm font-semibold text-slate-900">⭐ 8️⃣ Đánh giá</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
            <div>
              <p className="text-xs text-slate-500">Đánh giá trung bình</p>
              <p className="font-semibold text-slate-900">
                {typeof product.ratingsAverage === 'number'
                  ? product.ratingsAverage
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Số lượt đánh giá</p>
              <p className="font-semibold text-slate-900">
                {typeof product.ratingsQuantity === 'number'
                  ? product.ratingsQuantity
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
        <p className="text-sm font-semibold text-slate-900">
          🛠 6️⃣ Thông số kỹ thuật (Frame)
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-900">Chung</p>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Kiểu hình</span>
                <span className="font-semibold text-slate-900">
                  {toTitle(common.shape)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Giới tính phù hợp</span>
                <span className="font-semibold text-slate-900">
                  {toTitle(common.gender)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-900">Gọng kính</p>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Chất liệu</span>
                <span className="font-semibold text-slate-900">
                  {toTitle(frame.material)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Bản lề</span>
                <span className="font-semibold text-slate-900">
                  {toTitle(frame.hingeType)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Đệm mũi của kính</span>
                <span className="font-semibold text-slate-900">
                  {formatBoolean(frame.nosePads)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Viền gọng</span>
                <span className="font-semibold text-slate-900">
                  {toTitle(frame.rimType)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-900">Kích thước</p>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Cầu kính</span>
                <span className="font-semibold text-slate-900">
                  {typeof dimensions.bridgeMm === 'number'
                    ? `${dimensions.bridgeMm}mm`
                    : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Chiều ngang tròng kính</span>
                <span className="font-semibold text-slate-900">
                  {typeof dimensions.lensWidthMm === 'number'
                    ? `${dimensions.lensWidthMm}mm`
                    : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Chiều cao tròng kính</span>
                <span className="font-semibold text-slate-900">
                  {typeof dimensions.lensHeightMm === 'number'
                    ? `${dimensions.lensHeightMm}mm`
                    : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Khung(Càng kính)</span>
                <span className="font-semibold text-slate-900">
                  {typeof dimensions.templeLengthMm === 'number'
                    ? `${dimensions.templeLengthMm}mm`
                    : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Chiều rộng tổng thể</span>
                <span className="font-semibold text-slate-900">
                  {typeof dimensions.frameWidthMm === 'number'
                    ? `${dimensions.frameWidthMm}mm`
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-sm font-semibold text-slate-900">🖼 7️⃣ Media</p>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-900">
                  2D (hero)
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {hero2d?.url ? '1 ảnh 2D (hero)' : '-'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-900">
                  Mô hình 3D
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {model3d?.url ? '1 model 3D (.glb)' : '-'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Viewer 3D</p>
                <p className="font-semibold text-slate-900">
                  {hasViewer3d ? 'Có viewer 3D' : 'Không'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Thử kính ảo(AR)</p>
                <p className="font-semibold text-slate-900">
                  {hasArTryOn ? 'Có AR try-on' : 'Chưa có AR try-on'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-sm font-semibold text-slate-900">
            🔎 9️⃣ Mô tả bổ sung
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
            <div>
              <p className="text-xs text-slate-500">Mã</p>
              <p className="font-semibold text-slate-900">
                {product.seo?.modelCode || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Bộ sửu tập</p>
              <p className="font-semibold text-slate-900">
                {product.seo?.collections?.[0] || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Xuất xứ </p>
              <p className="font-semibold text-slate-900">
                {product.seo?.countryOfOrigin || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Slug</p>
              <p className="font-semibold break-all text-slate-900">
                {product.slug || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
