'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Calculator,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  QrCode,
  ReceiptText,
  RefreshCcw,
  Trash2,
} from 'lucide-react';

import { createCheckout, createQuote } from '@/api/saleCheckout';
import { Header } from '@/components/organisms/Header';
import { useOrderPolling } from '@/hooks/useOrderPolling';
import { buildCheckoutPayload } from '@/lib/saleCheckout';
import { cn } from '@/lib/utils';
import { useSaleCartStore } from '@/stores/saleCartStore';
import type {
  CheckoutData,
  QuoteData,
  SaleCartItem,
  ShippingAddressForm,
} from '@/types/saleCheckout';

const REQUIRED_SHIPPING_FIELDS: Array<keyof ShippingAddressForm> = [
  'fullName',
  'phone',
  'email',
  'line1',
  'ward',
  'district',
  'province',
  'country',
];

const defaultShippingForm: ShippingAddressForm = {
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  line2: '',
  ward: '',
  district: '',
  province: '',
  country: 'VN',
  note: '',
};

const shippingFields: Array<{
  field: keyof ShippingAddressForm;
  label: string;
  placeholder: string;
  fullWidth?: boolean;
}> = [
  { field: 'fullName', label: 'FULLNAME', placeholder: 'Nguyen Van A' },
  { field: 'phone', label: 'PHONE', placeholder: '0901 234 567' },
  { field: 'email', label: 'EMAIL', placeholder: 'example@mail.com' },
  { field: 'line1', label: 'LINE1', placeholder: 'So nha, ten duong' },
  { field: 'line2', label: 'LINE2', placeholder: 'Toa nha, tang' },
  { field: 'ward', label: 'WARD', placeholder: 'Phuong / Xa' },
  { field: 'district', label: 'DISTRICT', placeholder: 'Quan / Huyen' },
  { field: 'province', label: 'PROVINCE', placeholder: 'Tinh / Thanh' },
  { field: 'country', label: 'COUNTRY', placeholder: 'VN', fullWidth: true },
];

const inputClassName =
  'h-11 w-full rounded-xl border border-[#e7e2d6] bg-white px-3 text-sm font-medium text-[#201600] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition placeholder:text-[#887243] focus:border-[#cc9600] focus:ring-4 focus:ring-[#f7bf00]/20';

const panelTitleClassName =
  'text-sm font-black uppercase tracking-[0.08em] text-[#201600]';

const metaLabelClassName =
  'mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-[#7b641f]';

type SummaryData = {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
};

function formatMoney(value?: number): string {
  return Number(value || 0).toLocaleString('vi-VN');
}

function formatStatusValue(value?: string): string {
  return String(value || 'unknown')
    .replace(/_/g, ' ')
    .trim()
    .toUpperCase();
}

function statusPillClassName(status?: string): string {
  const normalized = String(status || 'unknown').toLowerCase();

  if (
    normalized === 'paid' ||
    normalized === 'confirmed' ||
    normalized === 'issued'
  ) {
    return 'border-[#d6b34f] bg-[#fff0b8] text-[#5f4500]';
  }

  if (
    normalized === 'failed' ||
    normalized === 'cancelled' ||
    normalized === 'void'
  ) {
    return 'border-[#e6a19d] bg-[#fff0ee] text-[#9d2d1d]';
  }

  if (normalized === 'pending') {
    return 'border-[#ead58d] bg-[#fff7d2] text-[#7a5a00]';
  }

  return 'border-[#ead58d] bg-[#fff9de] text-[#8b6808]';
}

function resolveSummary(
  subtotal: number,
  quoteResult: QuoteData | null,
  checkoutResult: CheckoutData | null
): SummaryData {
  const breakdown = checkoutResult?.breakdown;

  return {
    subtotal: breakdown?.subtotal ?? quoteResult?.subtotal ?? subtotal,
    shippingFee: breakdown?.shippingFee ?? quoteResult?.shippingFee ?? 0,
    discountAmount:
      breakdown?.discountAmount ?? quoteResult?.discountAmount ?? 0,
    total: breakdown?.total ?? quoteResult?.total ?? subtotal,
  };
}

function ActionButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex min-h-[72px] items-center justify-center gap-2 rounded-[22px] px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {children}
    </button>
  );
}

function EmptyCheckoutState() {
  return (
    <div className="rounded-[28px] border border-[#ead9a3] bg-white p-8 shadow-[0_28px_60px_-40px_rgba(120,82,0,0.18)]">
      <h2 className="text-lg font-black tracking-[0.08em] text-[#201600] uppercase">
        Giỏ hàng đang trống
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f5830]">
        Hãy chọn sản phẩm và biến thể ở trang sản phẩm rồi quay lai đây để tính
        tiền và tạo đơn.
      </p>
    </div>
  );
}

function CartItemCard({ item }: { item: SaleCartItem }) {
  return (
    <div className="rounded-[24px] border border-[#ece7da] bg-white p-4 shadow-[0_18px_35px_-26px_rgba(92,63,0,0.12)]">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#ecd690] bg-white p-2">
          {item.image ? (
            <img
              src={item.image}
              alt={item.productName}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <Package className="h-8 w-8 text-[#d08b00]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="line-clamp-2 text-base font-black text-[#201600]">
                {item.productName}
              </p>
              <p className="mt-1 text-sm text-[#6e5a33]">
                {item.brand || '-'} • {item.productType || '-'}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold tracking-[0.08em] text-[#927138] uppercase">
                Đơn giá
              </p>
              <p className="mt-1 text-lg font-black text-[#d08b00]">
                {formatMoney(item.price)} ₫
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#e8cf89] bg-white px-3 py-1 text-xs font-bold text-[#6d5000]">
              Biến thể: {item.variantOptions.color || '-'} /{' '}
              {item.variantOptions.size || '-'}
            </span>
            <span className="rounded-full border border-[#e8cf89] bg-white px-3 py-1 text-xs font-bold text-[#6d5000]">
              Qty: {item.quantity}
            </span>
            <span className="rounded-full border border-[#e8cf89] bg-white px-3 py-1 text-xs font-bold text-[#6d5000]">
              Tồn kho: {item.stock}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#ecd690] pt-3">
            <span className="text-sm font-semibold text-[#7c6330]">
              Thành tiền
            </span>
            <span className="text-lg font-black text-[#201600]">
              {formatMoney(item.price * item.quantity)} ₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeftCheckoutPanel({
  cartItems,
  subtotal,
  shippingForm,
  onBackToProducts,
  onShippingChange,
  onFillSwagger,
  errorMessage,
  isQuoting,
  isCheckingOut,
  canCheckout,
  onQuote,
  onCheckout,
  onClearCart,
}: {
  cartItems: SaleCartItem[];
  subtotal: number;
  shippingForm: ShippingAddressForm;
  onBackToProducts: () => void;
  onShippingChange: (field: keyof ShippingAddressForm, value: string) => void;
  onFillSwagger: () => void;
  errorMessage: string;
  isQuoting: boolean;
  isCheckingOut: boolean;
  canCheckout: boolean;
  onQuote: () => void;
  onCheckout: () => void;
  onClearCart: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[#ead9a3] bg-white shadow-[0_32px_80px_-48px_rgba(122,84,0,0.14)]">
      <div className="border-b border-[#f1e8d1] px-5 py-5 sm:px-6">
        <div className="mb-4">
          <button
            type="button"
            onClick={onBackToProducts}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lai trang
          </button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f1d67f] bg-[#fff8df] text-[#d08b00] shadow-[0_12px_20px_-16px_rgba(95,63,0,0.24)]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className={panelTitleClassName}>
                Danh sách sản phẩm từ giỏ hàng
              </h2>
              <p className="mt-1 text-xs font-medium text-[#876e2f]">
                Chọn báo giá để khóa tổng tiền trước khi thanh toán.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5c86d] bg-white px-3 py-2 text-right">
            <div className="text-[11px] font-black tracking-[0.1em] text-[#7b641f] uppercase">
              Sản phẩm
            </div>
            <div className="mt-1 text-lg font-black text-[#201600]">
              {cartItems.length}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        {cartItems.map((item) => (
          <CartItemCard
            key={`${item.productId}-${item.variantId}`}
            item={item}
          />
        ))}

        <div className="flex items-center justify-between border-t border-[#f1e8d1] pt-4">
          <span className="text-sm font-bold tracking-[0.08em] text-[#7c6330] uppercase">
            Tổng thanh toán tạm tính
          </span>
          <span className="text-[28px] leading-none font-black text-[#201600]">
            {formatMoney(subtotal)} ₫
          </span>
        </div>
      </div>

      <div className="border-t border-[#f1e8d1] px-5 py-5 sm:px-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f1d67f] bg-[#fff8df] text-[#d08b00] shadow-[0_12px_20px_-16px_rgba(95,63,0,0.24)]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className={panelTitleClassName}>Địa chỉ giao hàng</h2>
              <p className="mt-1 text-xs font-medium text-[#876e2f]">
                *Bắt buộc nhập:*`` họ và tên, số điện thoại, email, địa chỉ dòng
                1, phường/xã, quận/huyện, tỉnh/thành phố, quốc gia.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {shippingFields.map(({ field, label, placeholder, fullWidth }) => {
            const isRequired = REQUIRED_SHIPPING_FIELDS.includes(field);

            return (
              <div key={field} className={cn(fullWidth && 'md:col-span-2')}>
                <label className={metaLabelClassName}>
                  {label}
                  {isRequired ? ' *' : ''}
                </label>
                <input
                  value={shippingForm[field]}
                  onChange={(event) =>
                    onShippingChange(field, event.target.value)
                  }
                  placeholder={placeholder}
                  className={inputClassName}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <label className={metaLabelClassName}>Ghi chú</label>
          <textarea
            value={shippingForm.note}
            onChange={(event) => onShippingChange('note', event.target.value)}
            rows={4}
            placeholder="Ghi chú đơn hàng (tùy chọn)..."
            className="w-full rounded-xl border border-[#e6c873] bg-white px-3 py-3 text-sm font-medium text-[#201600] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition outline-none placeholder:text-[#887243] focus:border-[#cc9600] focus:ring-4 focus:ring-[#f7bf00]/20"
          />
        </div>

        <div className="mt-4">
          <label className={metaLabelClassName}>Mã Voucher</label>
          <input
            disabled
            value=""
            placeholder="Chua ho tro backend"
            className="h-11 w-full cursor-not-allowed rounded-xl border border-[#ebe5d8] bg-[#faf8f3] px-3 text-sm font-medium text-[#8d7649]"
          />
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e8b5ae] bg-[#fff0ed] p-4 text-sm text-[#a03c2e]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-6">{errorMessage}</p>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ActionButton
            type="button"
            onClick={onQuote}
            disabled={isQuoting}
            className="border border-[#d8bc67] bg-white text-[#201600] hover:-translate-y-0.5 hover:bg-[#fff9e8]"
          >
            {isQuoting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tính...
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5 text-[#d48200]" />
                Tính tiền
              </>
            )}
          </ActionButton>

          <ActionButton
            type="button"
            onClick={onCheckout}
            disabled={isCheckingOut || !canCheckout}
            className="border border-[#d09a00] bg-[#f7bf00] text-[#201600] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] hover:-translate-y-0.5 hover:bg-[#ffcf31]"
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo đơn...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 text-[#0b5c2e]" />
                Thanh toán
              </>
            )}
          </ActionButton>

          <ActionButton
            type="button"
            onClick={onClearCart}
            className="border border-[#d8bc67] bg-white text-[#3e2a00] hover:-translate-y-0.5 hover:bg-[#fff9e8]"
          >
            <Trash2 className="h-5 w-5 text-[#9a3a27]" />
            Xóa giỏ hàng
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function RealtimePanel({
  statuses,
  checkoutResult,
  isPolling,
  pollingError,
  pollingTimedOut,
  onPollAgain,
  onStopPolling,
}: {
  statuses: {
    paymentStatus: string;
    orderStatus: string;
    invoiceStatus: string;
  };
  checkoutResult: CheckoutData | null;
  isPolling: boolean;
  pollingError: string;
  pollingTimedOut: boolean;
  onPollAgain: () => void;
  onStopPolling: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#ead9a3] bg-white shadow-[0_28px_65px_-44px_rgba(51,38,10,0.14)]">
      <div className="border-b border-[#f1e8d1] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#f1d67f] bg-[#fff8df] text-[#d08b00]">
            <RefreshCcw className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-[0.12em] text-[#201600] uppercase">
              Trạng thái thời gian thực
            </h2>
            <p className="mt-1 text-xs font-medium text-[#876e2f]">
              Theo dõi thanh toán, đơn hàng và hóa đơn sau khi hoàn tất đặt
              hàng/thanh toán.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        {(
          [
            ['Payment Status', statuses.paymentStatus],
            ['Order Status', statuses.orderStatus],
            ['Invoice Status', statuses.invoiceStatus],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b border-[#efe6d1] pb-3 last:border-b-0 last:pb-0"
          >
            <span className="text-sm font-medium text-[#6a5740]">{label}</span>
            <span
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-black tracking-[0.08em]',
                statusPillClassName(value)
              )}
            >
              {formatStatusValue(value)}
            </span>
          </div>
        ))}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onPollAgain}
            disabled={!checkoutResult?.orderId || isPolling}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#d4c3a0] bg-white px-4 text-sm font-black text-[#22170a] transition hover:-translate-y-0.5 hover:bg-[#fff9e8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Đồng bộ lại trạng thái
          </button>
          <button
            type="button"
            onClick={onStopPolling}
            disabled={!isPolling}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#d4c3a0] bg-white px-4 text-sm font-black text-[#22170a] transition hover:-translate-y-0.5 hover:bg-[#fff9e8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Dừng đồng bộ
          </button>
        </div>

        <p className="text-xs font-medium text-[#8b7860]">
          Kiểm tra trạng thái mỗi 3 giây, tối đa trong 10 phút
        </p>

        {isPolling && (
          <p className="rounded-2xl border border-[#ebd690] bg-[#fff8db] px-3 py-2 text-sm font-medium text-[#7b5f00]">
            Đang đồng bộ trạng thái đơn hàng...
          </p>
        )}
        {pollingError && (
          <p className="rounded-2xl border border-[#e8b5ae] bg-[#fff0ed] px-3 py-2 text-sm font-medium text-[#a03c2e]">
            {pollingError}
          </p>
        )}
        {pollingTimedOut && (
          <p className="rounded-2xl border border-[#ebd690] bg-[#fff8db] px-3 py-2 text-sm font-medium text-[#7b5f00]">
            Đã hết thời gian kiểm tra tự động. Bấm “Kiểm tra lại” để cập nhật
            trạng thái mới nhất.
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryPanel({
  summary,
  quoteResult,
}: {
  summary: SummaryData;
  quoteResult: QuoteData | null;
}) {
  return (
    <div className="rounded-[28px] border border-[#d39a00] bg-white p-5 shadow-[0_26px_55px_-36px_rgba(117,78,0,0.16)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f1d67f] bg-[#fff8df] text-[#d08b00]">
          <ReceiptText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-[0.12em] text-[#201600] uppercase">
            Tóm tắt đơn hàng
          </h2>
          <p className="mt-1 text-xs font-medium text-[#876e2f]">
            Tổng kết từ giỏ hàng va quote hiện tại.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#f1e8d1] pb-3 text-sm font-semibold text-[#4c3400]">
          <span>Tổng thanh toán</span>
          <span>{formatMoney(summary.subtotal)} ₫</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#f1e8d1] pb-3 text-sm font-semibold text-[#4c3400]">
          <span>Phí ship</span>
          <span>
            {summary.shippingFee > 0
              ? `${formatMoney(summary.shippingFee)} ₫`
              : 'Miễn phí'}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-[#f1e8d1] pb-3 text-sm font-semibold text-[#4c3400]">
          <span>Voucher</span>
          <span>
            {summary.discountAmount > 0
              ? `- ${formatMoney(summary.discountAmount)} ₫`
              : '-'}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black tracking-[0.12em] text-[#4c3400] uppercase">
            Tổng cộng
          </p>
          <p className="mt-1 text-xs font-medium text-[#876e2f]">
            {quoteResult
              ? 'Đã cập nhật theo quote'
              : 'Tạm tính theo cart hiện tại'}
          </p>
        </div>
        <div className="text-right text-[34px] leading-none font-black text-[#d08b00]">
          {formatMoney(summary.total)} ₫
        </div>
      </div>
    </div>
  );
}

function PaymentPanel({
  checkoutResult,
}: {
  checkoutResult: CheckoutData | null;
}) {
  if (!checkoutResult) return null;

  return (
    <div className="rounded-[28px] border border-[#ead9a3] bg-white p-5 shadow-[0_28px_60px_-42px_rgba(84,57,0,0.14)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f1d67f] bg-[#fff8df] text-[#d08b00]">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-[0.12em] text-[#201600] uppercase">
            Thông tin thanh toán
          </h2>
          <p className="mt-1 text-xs font-medium text-[#78633d]">
            Order ID: {checkoutResult.orderId || '-'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#efe2be] bg-white p-3 text-sm">
          <div className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
            Mã giao dịch
          </div>
          <div className="mt-2 font-semibold text-[#201600]">
            {checkoutResult.payment?.paymentCode || '-'}
          </div>
        </div>
        <div className="rounded-2xl border border-[#efe2be] bg-white p-3 text-sm">
          <div className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
            Ngân hàng
          </div>
          <div className="mt-2 font-semibold text-[#201600]">
            {checkoutResult.payment?.bankName || '-'}
          </div>
        </div>
        <div className="rounded-2xl border border-[#efe2be] bg-white p-3 text-sm">
          <div className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
            Tài khoản
          </div>
          <div className="mt-2 font-semibold text-[#201600]">
            {checkoutResult.payment?.bankAccountNumber || '-'}
          </div>
        </div>
        <div className="rounded-2xl border border-[#efe2be] bg-white p-3 text-sm">
          <div className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
            Nội dung
          </div>
          <div className="mt-2 font-semibold text-[#201600]">
            {checkoutResult.payment?.content || '-'}
          </div>
        </div>
      </div>

      {checkoutResult.payment?.qrUrl && (
        <div className="mt-4 rounded-[24px] border border-[#efe2be] bg-white p-4">
          <p className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
            QR thanh toán
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={checkoutResult.payment.qrUrl}
              alt="Payment QR"
              className="h-40 w-40 rounded-2xl border border-[#ecd690] bg-white object-contain p-2"
            />
            <a
              href={checkoutResult.payment.qrUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#d6b454] bg-white px-4 text-sm font-black text-[#201600] transition hover:-translate-y-0.5 hover:bg-[#fff9e8]"
            >
              Mở QR URL
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export const SaleCheckoutPage: React.FC = () => {
  const router = useRouter();

  const cartItems = useSaleCartStore((state) => state.items);
  const clearCart = useSaleCartStore((state) => state.clearCart);

  const [shippingForm, setShippingForm] =
    useState<ShippingAddressForm>(defaultShippingForm);
  const [quoteResult, setQuoteResult] = useState<QuoteData | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutData | null>(
    null
  );

  const [quoteError, setQuoteError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const {
    orderDetail,
    statuses,
    isPolling,
    pollingError,
    pollingTimedOut,
    setOrderDetail,
    startOrderPolling,
    stopOrderPolling,
  } = useOrderPolling();

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const summary = useMemo(
    () => resolveSummary(subtotal, quoteResult, checkoutResult),
    [checkoutResult, quoteResult, subtotal]
  );

  const resetCheckoutArtifacts = () => {
    setQuoteResult(null);
    setCheckoutResult(null);
    setQuoteError('');
    setCheckoutError('');
    setOrderDetail(null);
    stopOrderPolling();
  };

  const validateCheckoutInput = (): string => {
    if (cartItems.length === 0) return 'Giỏ hàng đang trống.';

    const invalidQtyItem = cartItems.find((item) => item.quantity < 1);
    if (invalidQtyItem) {
      return `Số lượng không hợp lệ ở sản phẩm: ${invalidQtyItem.productName}`;
    }

    const missingField = REQUIRED_SHIPPING_FIELDS.find(
      (field) => !String(shippingForm[field] || '').trim()
    );

    if (missingField) {
      return `Thiếu thông tin giao hàng bắt buộc: ${missingField}`;
    }

    return '';
  };

  const fillSwaggerSampleShipping = () => {
    setShippingForm({
      fullName: 'Nguyen Van A',
      phone: '0901234567',
      email: 'example@mail.com',
      line1: 'So 1 Nguyen Hue',
      line2: 'Tang 5',
      ward: 'Ben Nghe',
      district: 'Quan 1',
      province: 'TP HCM',
      country: 'VN',
      note: '',
    });
  };

  const handleCalculateQuote = async () => {
    const validationError = validateCheckoutInput();
    setQuoteError(validationError);
    setCheckoutError('');
    if (validationError) return;

    try {
      setIsQuoting(true);
      const payload = buildCheckoutPayload({
        cartItems,
        shippingAddress: shippingForm,
        note: shippingForm.note,
      });
      const quote = await createQuote(payload);
      setQuoteResult(quote);
      setCheckoutResult(null);
      setOrderDetail(null);
    } catch (error) {
      const message =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Tính tiền thất bại.';
      setQuoteError(message);
      setQuoteResult(null);
    } finally {
      setIsQuoting(false);
    }
  };

  const handleCheckout = async () => {
    const validationError = validateCheckoutInput();
    setCheckoutError(validationError);
    if (validationError) return;

    if (!quoteResult) {
      setCheckoutError('Bạn cần bấm "Tính tiền" trước khi thanh toán.');
      return;
    }

    try {
      setIsCheckingOut(true);
      const payload = buildCheckoutPayload({
        cartItems,
        shippingAddress: shippingForm,
        note: shippingForm.note,
      });

      const checkout = await createCheckout(payload);
      setCheckoutResult(checkout);

      if (checkout.orderId) {
        startOrderPolling(checkout.orderId);
      }
    } catch (error) {
      const message =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Tạo đơn thanh toán thất bại.';
      setCheckoutError(message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setShippingForm({ ...defaultShippingForm });
    resetCheckoutArtifacts();
  };

  const handleShippingChange = (
    field: keyof ShippingAddressForm,
    value: string
  ) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const errorMessage = quoteError || checkoutError;

  return (
    <>
      <Header
        title="Sale Checkout"
        subtitle="Flow: cart items → quote → checkout → poll payment status"
      />

      <div className="min-h-[calc(100vh-4rem)] bg-[#fffdfa]">
        <div className="mx-auto max-w-[1380px] space-y-6 p-6">
          {cartItems.length === 0 ? (
            <EmptyCheckoutState />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
              <LeftCheckoutPanel
                cartItems={cartItems}
                subtotal={subtotal}
                shippingForm={shippingForm}
                onBackToProducts={() => router.push('/sale/products')}
                onShippingChange={handleShippingChange}
                onFillSwagger={fillSwaggerSampleShipping}
                errorMessage={errorMessage}
                isQuoting={isQuoting}
                isCheckingOut={isCheckingOut}
                canCheckout={Boolean(quoteResult)}
                onQuote={() => {
                  void handleCalculateQuote();
                }}
                onCheckout={() => {
                  void handleCheckout();
                }}
                onClearCart={handleClearCart}
              />

              <div className="space-y-5">
                <RealtimePanel
                  statuses={statuses}
                  checkoutResult={checkoutResult}
                  isPolling={isPolling}
                  pollingError={pollingError}
                  pollingTimedOut={pollingTimedOut}
                  onPollAgain={() => {
                    if (checkoutResult?.orderId) {
                      startOrderPolling(checkoutResult.orderId);
                    }
                  }}
                  onStopPolling={stopOrderPolling}
                />
                <SummaryPanel summary={summary} quoteResult={quoteResult} />
                <PaymentPanel checkoutResult={checkoutResult} />

                {orderDetail && (
                  <div className="rounded-[24px] border border-[#ead9a3] bg-white px-4 py-3 text-sm font-medium text-[#6e5a33] shadow-[0_18px_40px_-36px_rgba(84,57,0,0.12)]">
                    orderRef:{' '}
                    <span className="font-black text-[#201600]">
                      {orderDetail._id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
