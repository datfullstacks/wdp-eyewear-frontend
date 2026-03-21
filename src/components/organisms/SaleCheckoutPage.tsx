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
  SaleCheckoutPaymentMethod,
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
  {
    field: 'fullName',
    label: 'H\u1ecd v\u00e0 t\u00ean',
    placeholder: 'Nguy\u1ec5n V\u0103n A',
  },
  {
    field: 'phone',
    label: 'S\u1ed1 \u0111i\u1ec7n tho\u1ea1i',
    placeholder: '0901 234 567',
  },
  {
    field: 'email',
    label: '\u0110\u1ecba ch\u1ec9 email',
    placeholder: 'example@mail.com',
  },
  {
    field: 'line1',
    label: '\u0110\u1ecba ch\u1ec9 1',
    placeholder: 'S\u1ed1 nh\u00e0, t\u00ean \u0111\u01b0\u1eddng',
  },
  {
    field: 'line2',
    label: '\u0110\u1ecba ch\u1ec9 2',
    placeholder: 'T\u00f2a nh\u00e0, t\u1ea7ng',
  },
  {
    field: 'ward',
    label: 'Ph\u01b0\u1eddng / X\u00e3',
    placeholder: 'Ph\u01b0\u1eddng / X\u00e3',
  },
  {
    field: 'district',
    label: 'Qu\u1eadn / Huy\u1ec7n',
    placeholder: 'Qu\u1eadn / Huy\u1ec7n',
  },
  {
    field: 'province',
    label: 'T\u1ec9nh / Th\u00e0nh',
    placeholder: 'T\u1ec9nh / Th\u00e0nh',
  },
  { field: 'country', label: 'Qu\u1ed1c gia', placeholder: 'VN', fullWidth: true },
];

const inputClassName =
  'h-11 w-full rounded-xl border border-[#e7e2d6] bg-white px-3 text-sm font-medium text-[#201600] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition placeholder:text-[#887243] focus:border-[#cc9600] focus:ring-4 focus:ring-[#f7bf00]/20';

const panelTitleClassName =
  'text-sm font-black uppercase tracking-[0.08em] text-[#201600]';

const metaLabelClassName =
  'mb-2 block text-[11px] font-black tracking-[0.04em] text-[#7b641f]';

type SummaryData = {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
};

function formatMoney(value?: number): string {
  return Number(value || 0).toLocaleString('vi-VN');
}

const DONG_SYMBOL = '\u20ab';

const SALE_CHECKOUT_PAYMENT_OPTIONS: Array<{
  id: SaleCheckoutPaymentMethod;
  label: string;
  description: string;
}> = [
  {
    id: 'sepay',
    label: 'SePay (QR)',
    description: 'Thu truoc qua QR/SePay cho phan thanh toan ngay.',
  },
  {
    id: 'cod',
    label: 'COD',
    description: 'Thu khi giao hang voi cac don hang du dieu kien.',
  },
];

function getShippingFieldLabel(field: keyof ShippingAddressForm): string {
  return shippingFields.find((item) => item.field === field)?.label ?? field;
}

function formatStatusValue(value?: string): string {
  return String(value || 'unknown')
    .replace(/_/g, ' ')
    .trim()
    .toUpperCase();
}

function statusPillClassName(status?: string): string {
  const normalized = String(status || 'unknown').toLowerCase();

  if (normalized === 'cod') {
    return 'border-[#d5cfbf] bg-[#f7f4ec] text-[#5a513d]';
  }

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
        {'Gi\u1ecf h\u00e0ng \u0111ang tr\u1ed1ng'}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f5830]">
        {
          'H\u00e3y ch\u1ecdn s\u1ea3n ph\u1ea9m v\u00e0 bi\u1ebfn th\u1ec3 \u1edf trang s\u1ea3n ph\u1ea9m r\u1ed3i quay l\u1ea1i \u0111\u00e2y \u0111\u1ec3 t\u00ednh ti\u1ec1n v\u00e0 t\u1ea1o \u0111\u01a1n.'
        }
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
                {item.brand || '-'} {'\u2022'} {item.productType || '-'}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold tracking-[0.08em] text-[#927138] uppercase">
                {'\u0110\u01a1n gi\u00e1'}
              </p>
              <p className="mt-1 text-lg font-black text-[#d08b00]">
                {formatMoney(item.price)} {DONG_SYMBOL}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#e8cf89] bg-white px-3 py-1 text-xs font-bold text-[#6d5000]">
              {'Bi\u1ebfn th\u1ec3'}: {item.variantOptions.color || '-'} /{' '}
              {item.variantOptions.size || '-'}
            </span>
            <span className="rounded-full border border-[#e8cf89] bg-white px-3 py-1 text-xs font-bold text-[#6d5000]">
              {'S\u1ed1 l\u01b0\u1ee3ng'}: {item.quantity}
            </span>
            <span className="rounded-full border border-[#e8cf89] bg-white px-3 py-1 text-xs font-bold text-[#6d5000]">
              {'T\u1ed3n kho'}: {item.stock}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#ecd690] pt-3">
            <span className="text-sm font-semibold text-[#7c6330]">
              {'Th\u00e0nh ti\u1ec1n'}
            </span>
            <span className="text-lg font-black text-[#201600]">
              {formatMoney(item.price * item.quantity)} {DONG_SYMBOL}
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
  paymentMethod,
  onBackToProducts,
  onShippingChange,
  onPaymentMethodChange,
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
  paymentMethod: SaleCheckoutPaymentMethod;
  onBackToProducts: () => void;
  onShippingChange: (field: keyof ShippingAddressForm, value: string) => void;
  onPaymentMethodChange: (method: SaleCheckoutPaymentMethod) => void;
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
            {'Quay l\u1ea1i s\u1ea3n ph\u1ea9m'}
          </button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f1d67f] bg-[#fff8df] text-[#d08b00] shadow-[0_12px_20px_-16px_rgba(95,63,0,0.24)]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className={panelTitleClassName}>
                {'Danh s\u00e1ch s\u1ea3n ph\u1ea9m t\u1eeb gi\u1ecf h\u00e0ng'}
              </h2>
              <p className="mt-1 text-xs font-medium text-[#876e2f]">
                {
                  'Ch\u1ecdn b\u00e1o gi\u00e1 \u0111\u1ec3 kh\u00f3a t\u1ed5ng ti\u1ec1n tr\u01b0\u1edbc khi thanh to\u00e1n.'
                }
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5c86d] bg-white px-3 py-2 text-right">
            <div className="text-[11px] font-black tracking-[0.1em] text-[#7b641f] uppercase">
              {'S\u1ea3n ph\u1ea9m'}
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
            {'T\u1ea1m t\u00ednh'}
          </span>
          <span className="text-[28px] leading-none font-black text-[#201600]">
            {formatMoney(subtotal)} {DONG_SYMBOL}
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
              <h2 className={panelTitleClassName}>
                {'\u0110\u1ecba ch\u1ec9 giao h\u00e0ng'}
              </h2>
              <p className="mt-1 text-xs font-medium text-[#876e2f]">
                {
                  'B\u1eaft bu\u1ed9c nh\u1eadp: h\u1ecd v\u00e0 t\u00ean, s\u1ed1 \u0111i\u1ec7n tho\u1ea1i, email, \u0111\u1ecba ch\u1ec9 d\u00f2ng 1, ph\u01b0\u1eddng/x\u00e3, qu\u1eadn/huy\u1ec7n, t\u1ec9nh/th\u00e0nh ph\u1ed1, qu\u1ed1c gia.'
                }
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
          <label className={metaLabelClassName}>{'Ghi ch\u00fa'}</label>
          <textarea
            value={shippingForm.note}
            onChange={(event) => onShippingChange('note', event.target.value)}
            rows={4}
            placeholder={'Ghi ch\u00fa \u0111\u01a1n h\u00e0ng (t\u00f9y ch\u1ecdn)...'}
            className="w-full rounded-xl border border-[#e6c873] bg-white px-3 py-3 text-sm font-medium text-[#201600] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition outline-none placeholder:text-[#887243] focus:border-[#cc9600] focus:ring-4 focus:ring-[#f7bf00]/20"
          />
        </div>

        <div className="mt-4">
          <label className={metaLabelClassName}>{'M\u00e3 gi\u1ea3m gi\u00e1'}</label>
          <input
            disabled
            value=""
            placeholder={'Ch\u01b0a h\u1ed7 tr\u1ee3 backend'}
            className="h-11 w-full cursor-not-allowed rounded-xl border border-[#ebe5d8] bg-[#faf8f3] px-3 text-sm font-medium text-[#8d7649]"
          />
        </div>

        <div className="mt-4">
          <label className={metaLabelClassName}>{'Phuong thuc thanh toan'}</label>
          <div className="grid gap-3 sm:grid-cols-2">
            {SALE_CHECKOUT_PAYMENT_OPTIONS.map((option) => {
              const active = paymentMethod === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onPaymentMethodChange(option.id)}
                  className={cn(
                    'rounded-2xl border px-4 py-4 text-left transition',
                    active
                      ? 'border-[#d39a00] bg-[#fff8df] shadow-[0_12px_24px_-18px_rgba(208,139,0,0.38)]'
                      : 'border-[#e8deca] bg-white hover:border-[#d6b454] hover:bg-[#fff9eb]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border',
                        active
                          ? 'border-[#e7c35b] bg-[#fff1bc] text-[#a86a00]'
                          : 'border-[#eee4d0] bg-[#faf6ee] text-[#7a6540]'
                      )}
                    >
                      {option.id === 'cod' ? (
                        <Package className="h-5 w-5" />
                      ) : (
                        <QrCode className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-[#201600]">
                        {option.label}
                      </div>
                      <p className="mt-1 text-xs font-medium leading-5 text-[#7b6641]">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs font-medium text-[#876e2f]">
            {'COD chi ap dung cho don du dieu kien. Neu gio hang co pre-order, backend se yeu cau quay ve SePay.'}
          </p>
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
                {'\u0110ang t\u00ednh...'}
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5 text-[#d48200]" />
                {'T\u00ednh ti\u1ec1n'}
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
                {'\u0110ang t\u1ea1o \u0111\u01a1n...'}
              </>
            ) : (
              <>
                {paymentMethod === 'cod' ? (
                  <Package className="h-5 w-5 text-[#0b5c2e]" />
                ) : (
                  <CreditCard className="h-5 w-5 text-[#0b5c2e]" />
                )}
                {paymentMethod === 'cod'
                  ? 'Tao don COD'
                  : 'Thanh toan ngay'}
              </>
            )}
          </ActionButton>

          <ActionButton
            type="button"
            onClick={onClearCart}
            className="border border-[#d8bc67] bg-white text-[#3e2a00] hover:-translate-y-0.5 hover:bg-[#fff9e8]"
          >
            <Trash2 className="h-5 w-5 text-[#9a3a27]" />
            {'X\u00f3a gi\u1ecf h\u00e0ng'}
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
              {'Tr\u1ea1ng th\u00e1i th\u1eddi gian th\u1ef1c'}
            </h2>
            <p className="mt-1 text-xs font-medium text-[#876e2f]">
              {
                'Theo d\u00f5i thanh to\u00e1n, \u0111\u01a1n h\u00e0ng v\u00e0 h\u00f3a \u0111\u01a1n sau khi ho\u00e0n t\u1ea5t \u0111\u1eb7t h\u00e0ng.'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        {(
          [
            ['Tr\u1ea1ng th\u00e1i thanh to\u00e1n', statuses.paymentStatus],
            ['Tr\u1ea1ng th\u00e1i \u0111\u01a1n h\u00e0ng', statuses.orderStatus],
            ['Tr\u1ea1ng th\u00e1i h\u00f3a \u0111\u01a1n', statuses.invoiceStatus],
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
            {'\u0110\u1ed3ng b\u1ed9 l\u1ea1i tr\u1ea1ng th\u00e1i'}
          </button>
          <button
            type="button"
            onClick={onStopPolling}
            disabled={!isPolling}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#d4c3a0] bg-white px-4 text-sm font-black text-[#22170a] transition hover:-translate-y-0.5 hover:bg-[#fff9e8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {'D\u1eebng \u0111\u1ed3ng b\u1ed9'}
          </button>
        </div>

        <p className="text-xs font-medium text-[#8b7860]">
          {'Ki\u1ec3m tra tr\u1ea1ng th\u00e1i m\u1ed7i 3 gi\u00e2y, t\u1ed1i \u0111a trong 10 ph\u00fat'}
        </p>

        {isPolling && (
          <p className="rounded-2xl border border-[#ebd690] bg-[#fff8db] px-3 py-2 text-sm font-medium text-[#7b5f00]">
            {'\u0110ang \u0111\u1ed3ng b\u1ed9 tr\u1ea1ng th\u00e1i \u0111\u01a1n h\u00e0ng...'}
          </p>
        )}
        {pollingError && (
          <p className="rounded-2xl border border-[#e8b5ae] bg-[#fff0ed] px-3 py-2 text-sm font-medium text-[#a03c2e]">
            {pollingError}
          </p>
        )}
        {pollingTimedOut && (
          <p className="rounded-2xl border border-[#ebd690] bg-[#fff8db] px-3 py-2 text-sm font-medium text-[#7b5f00]">
            {
              '\u0110\u00e3 h\u1ebft th\u1eddi gian ki\u1ec3m tra t\u1ef1 \u0111\u1ed9ng. B\u1ea5m "Ki\u1ec3m tra l\u1ea1i" \u0111\u1ec3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i m\u1edbi nh\u1ea5t.'
            }
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryPanel({
  summary,
  quoteResult,
  checkoutResult,
}: {
  summary: SummaryData;
  quoteResult: QuoteData | null;
  checkoutResult: CheckoutData | null;
}) {
  const breakdown = checkoutResult?.breakdown;
  const payNow = Number(breakdown?.payNow ?? quoteResult?.payNow ?? 0);
  const payLater = Number(breakdown?.payLater ?? quoteResult?.payLater ?? 0);
  const payNowMethod = String(
    breakdown?.payNowMethod || quoteResult?.payNowMethod || 'sepay'
  ).toUpperCase();
  const payLaterMethod = payLater
    ? String(
        breakdown?.payLaterMethod || quoteResult?.payLaterMethod || 'cod'
      ).toUpperCase()
    : '';
  const shippingCollectionTiming = String(
    breakdown?.shippingCollectionTiming ||
      quoteResult?.shippingCollectionTiming ||
      'upfront'
  )
    .trim()
    .toLowerCase();
  const shippingTimingLabel =
    shippingCollectionTiming === 'with_balance'
      ? 'Thu cung dot thanh toan con lai'
      : shippingCollectionTiming === 'on_delivery'
        ? 'Thu khi giao hang'
        : 'Thu ngay';

  return (
    <div className="rounded-[28px] border border-[#d39a00] bg-white p-5 shadow-[0_26px_55px_-36px_rgba(117,78,0,0.16)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f1d67f] bg-[#fff8df] text-[#d08b00]">
          <ReceiptText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-[0.12em] text-[#201600] uppercase">
            {'T\u00f3m t\u1eaft \u0111\u01a1n h\u00e0ng'}
          </h2>
          <p className="mt-1 text-xs font-medium text-[#876e2f]">
            {'T\u1ed5ng k\u1ebft t\u1eeb gi\u1ecf h\u00e0ng v\u00e0 b\u00e1o gi\u00e1 hi\u1ec7n t\u1ea1i.'}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#f1e8d1] pb-3 text-sm font-semibold text-[#4c3400]">
          <span>{'T\u1ea1m t\u00ednh'}</span>
          <span>
            {formatMoney(summary.subtotal)} {DONG_SYMBOL}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-[#f1e8d1] pb-3 text-sm font-semibold text-[#4c3400]">
          <span>{'Ph\u00ed v\u1eadn chuy\u1ec3n'}</span>
          <span>
            {summary.shippingFee > 0
              ? `${formatMoney(summary.shippingFee)} ${DONG_SYMBOL}`
              : 'Mi\u1ec5n ph\u00ed'}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-[#f1e8d1] pb-3 text-sm font-semibold text-[#4c3400]">
          <span>{'Gi\u1ea3m gi\u00e1'}</span>
          <span>
            {summary.discountAmount > 0
              ? `- ${formatMoney(summary.discountAmount)} ${DONG_SYMBOL}`
              : '-'}
          </span>
        </div>
        {(payNow > 0 || payLater > 0) && (
          <>
            {payNow > 0 && (
              <div className="flex items-center justify-between border-b border-[#f1e8d1] pb-3 text-sm font-semibold text-[#4c3400]">
                <span>{`Tra truoc (${payNowMethod})`}</span>
                <span>
                  {formatMoney(payNow)} {DONG_SYMBOL}
                </span>
              </div>
            )}
            {payLater > 0 && (
              <div className="flex items-center justify-between border-b border-[#f1e8d1] pb-3 text-sm font-semibold text-[#4c3400]">
                <span>{`Con lai (${payLaterMethod || 'COD'})`}</span>
                <span>
                  {formatMoney(payLater)} {DONG_SYMBOL}
                </span>
              </div>
            )}
            <div className="rounded-2xl border border-[#efe2be] bg-[#fffbf2] px-3 py-2 text-xs font-medium text-[#7b6641]">
              {'Thu phi ship: '} {shippingTimingLabel}
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black tracking-[0.12em] text-[#4c3400] uppercase">
            {'T\u1ed5ng c\u1ed9ng'}
          </p>
          <p className="mt-1 text-xs font-medium text-[#876e2f]">
            {quoteResult
              ? '\u0110\u00e3 c\u1eadp nh\u1eadt theo b\u00e1o gi\u00e1'
              : 'T\u1ea1m t\u00ednh theo gi\u1ecf h\u00e0ng hi\u1ec7n t\u1ea1i'}
          </p>
        </div>
        <div className="text-right text-[34px] leading-none font-black text-[#d08b00]">
          {formatMoney(summary.total)} {DONG_SYMBOL}
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

  const paymentMethod = String(
    checkoutResult.payment?.method ||
      checkoutResult.paymentMethod ||
      checkoutResult.breakdown?.paymentMethod ||
      ''
  )
    .trim()
    .toLowerCase();
  const isCod = paymentMethod === 'cod';
  const payNow = Number(checkoutResult.breakdown?.payNow || 0);
  const payLater = Number(checkoutResult.breakdown?.payLater || 0);
  const amountDue = Number(
    checkoutResult.payment?.amount ?? (isCod ? payLater : payNow)
  );
  const instruction =
    checkoutResult.payment?.instruction ||
    (isCod
      ? 'Khach thanh toan khi giao hang thanh cong.'
      : 'Thanh toan qua SePay/QR cho phan thu truoc.');

  return (
    <div className="rounded-[28px] border border-[#ead9a3] bg-white p-5 shadow-[0_28px_60px_-42px_rgba(84,57,0,0.14)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f1d67f] bg-[#fff8df] text-[#d08b00]">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-[0.12em] text-[#201600] uppercase">
            {'Th\u00f4ng tin thanh to\u00e1n'}
          </h2>
          <p className="mt-1 text-xs font-medium text-[#78633d]">
            {'M\u00e3 \u0111\u01a1n h\u00e0ng'}: {checkoutResult.orderId || '-'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#efe2be] bg-white p-3 text-sm">
          <div className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
            {'Phuong thuc'}
          </div>
          <div className="mt-2 font-semibold text-[#201600]">
            {isCod ? 'COD' : 'SePay (QR)'}
          </div>
        </div>
        <div className="rounded-2xl border border-[#efe2be] bg-white p-3 text-sm">
          <div className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
            {'So tien can thu'}
          </div>
          <div className="mt-2 font-semibold text-[#201600]">
            {formatMoney(amountDue)} {DONG_SYMBOL}
          </div>
        </div>
        <div className="rounded-2xl border border-[#efe2be] bg-white p-3 text-sm">
          <div className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
            {'Huong dan'}
          </div>
          <div className="mt-2 font-semibold text-[#201600]">
            {instruction}
          </div>
        </div>
        {!isCod && (
          <>
            <div className="rounded-2xl border border-[#efe2be] bg-white p-3 text-sm">
              <div className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
                {'Ngan hang'}
              </div>
              <div className="mt-2 font-semibold text-[#201600]">
                {checkoutResult.payment?.bankName || '-'}
              </div>
            </div>
            <div className="rounded-2xl border border-[#efe2be] bg-white p-3 text-sm">
              <div className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
                {'So tai khoan'}
              </div>
              <div className="mt-2 font-semibold text-[#201600]">
                {checkoutResult.payment?.bankAccountNumber || '-'}
              </div>
            </div>
            <div className="rounded-2xl border border-[#efe2be] bg-white p-3 text-sm sm:col-span-2">
              <div className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
                {'Noi dung chuyen khoan'}
              </div>
              <div className="mt-2 font-semibold text-[#201600]">
                {checkoutResult.payment?.content || '-'}
              </div>
            </div>
          </>
        )}
      </div>

      {payLater > 0 && (
        <div className="mt-4 rounded-[24px] border border-[#efe2be] bg-[#fffbf2] p-4 text-sm text-[#6e5a33]">
          {'COD con lai: '}
          <span className="font-black text-[#201600]">
            {formatMoney(payLater)} {DONG_SYMBOL}
          </span>
        </div>
      )}

      {!isCod && checkoutResult.payment?.qrUrl && (
        <div className="mt-4 rounded-[24px] border border-[#efe2be] bg-white p-4">
          <p className="text-[11px] font-black tracking-[0.12em] text-[#866d36] uppercase">
            {'M\u00e3 QR thanh to\u00e1n'}
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={checkoutResult.payment.qrUrl}
              alt={'M\u00e3 QR thanh to\u00e1n'}
              className="h-40 w-40 rounded-2xl border border-[#ecd690] bg-white object-contain p-2"
            />
            <a
              href={checkoutResult.payment.qrUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#d6b454] bg-white px-4 text-sm font-black text-[#201600] transition hover:-translate-y-0.5 hover:bg-[#fff9e8]"
            >
              {'M\u1edf m\u00e3 QR'}
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
  const [paymentMethod, setPaymentMethod] =
    useState<SaleCheckoutPaymentMethod>('sepay');
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
    if (cartItems.length === 0) return 'Gi\u1ecf h\u00e0ng \u0111ang tr\u1ed1ng.';

    const invalidQtyItem = cartItems.find((item) => item.quantity < 1);
    if (invalidQtyItem) {
      return `S\u1ed1 l\u01b0\u1ee3ng kh\u00f4ng h\u1ee3p l\u1ec7 \u1edf s\u1ea3n ph\u1ea9m: ${invalidQtyItem.productName}`;
    }

    const missingField = REQUIRED_SHIPPING_FIELDS.find(
      (field) => !String(shippingForm[field] || '').trim()
    );

    if (missingField) {
      return `Thi\u1ebfu th\u00f4ng tin giao h\u00e0ng b\u1eaft bu\u1ed9c: ${getShippingFieldLabel(missingField)}`;
    }

    return '';
  };

  const fillSwaggerSampleShipping = () => {
    setShippingForm({
      fullName: 'Nguy\u1ec5n V\u0103n A',
      phone: '0901234567',
      email: 'example@mail.com',
      line1: 'S\u1ed1 1 Nguy\u1ec5n Hu\u1ec7',
      line2: 'T\u1ea7ng 5',
      ward: 'B\u1ebfn Ngh\u00e9',
      district: 'Qu\u1eadn 1',
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
        paymentMethod,
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
        'T\u00ednh ti\u1ec1n th\u1ea5t b\u1ea1i.';
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
      setCheckoutError(
        'B\u1ea1n c\u1ea7n b\u1ea5m "T\u00ednh ti\u1ec1n" tr\u01b0\u1edbc khi thanh to\u00e1n.'
      );
      return;
    }

    try {
      setIsCheckingOut(true);
      const payload = buildCheckoutPayload({
        cartItems,
        shippingAddress: shippingForm,
        note: shippingForm.note,
        paymentMethod,
      });

      const checkout = await createCheckout(payload);
      setCheckoutResult(checkout);

      const resolvedPaymentMethod = String(
        checkout.payment?.method || checkout.paymentMethod || paymentMethod
      )
        .trim()
        .toLowerCase();

      setOrderDetail({
        _id: checkout.orderId,
        paymentStatus:
          resolvedPaymentMethod === 'cod'
            ? 'cod'
            : checkout.payment?.status || checkout.paymentStatus || 'pending',
        paymentMethod: resolvedPaymentMethod,
        status: 'pending',
        invoiceId: checkout.invoice ? { status: checkout.invoice.status } : null,
        payment: checkout.payment,
      });

      if (checkout.orderId && resolvedPaymentMethod !== 'cod') {
        startOrderPolling(checkout.orderId);
      } else {
        stopOrderPolling();
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
        'T\u1ea1o \u0111\u01a1n thanh to\u00e1n th\u1ea5t b\u1ea1i.';
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

  const handlePaymentMethodChange = (method: SaleCheckoutPaymentMethod) => {
    if (method === paymentMethod) return;
    setPaymentMethod(method);
    resetCheckoutArtifacts();
  };

  const errorMessage = quoteError || checkoutError;

  return (
    <>
      <Header
        title={'Thanh to\u00e1n b\u00e1n h\u00e0ng'}
        subtitle={
          'Lu\u1ed3ng: gi\u1ecf h\u00e0ng \u2192 b\u00e1o gi\u00e1 \u2192 thanh to\u00e1n \u2192 theo d\u00f5i tr\u1ea1ng th\u00e1i'
        }
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
                paymentMethod={paymentMethod}
                onBackToProducts={() => router.push('/sale/products')}
                onShippingChange={handleShippingChange}
                onPaymentMethodChange={handlePaymentMethodChange}
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
                <SummaryPanel
                  summary={summary}
                  quoteResult={quoteResult}
                  checkoutResult={checkoutResult}
                />
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
