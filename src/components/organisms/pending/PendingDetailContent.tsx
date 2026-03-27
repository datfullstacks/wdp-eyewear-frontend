import { CheckCircle, MapPin, Phone, ShoppingBag, User, XCircle } from 'lucide-react';

import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatCurrency, paymentStatusConfig } from '@/data/pendingData';
import {
  canManagerApprovePendingOrder,
  canSaleHandlePendingOrder,
  getPendingOrderTypeLabel,
  needsManagerReview,
  PENDING_ORDER_APPROVAL_MESSAGE,
  PENDING_ORDER_MANAGER_APPROVAL_MESSAGE,
  PENDING_ORDER_MANAGER_MESSAGE,
  PENDING_ORDER_SENT_BACK_MESSAGE,
  wasSentBackToSale,
} from '@/lib/pendingOrders';
import { PendingOrder } from '@/types/pending';

interface PendingDetailContentProps {
  scope?: 'sale' | 'manager';
  order: PendingOrder;
  onProcess: (order: PendingOrder) => void;
  onReject: (order: PendingOrder) => void;
  onEscalate: (order: PendingOrder) => void;
  onSendBack: (order: PendingOrder) => void;
}

export const PendingDetailContent = ({
  scope = 'sale',
  order,
  onProcess,
  onReject,
  onEscalate,
  onSendBack,
}: PendingDetailContentProps) => {
  const orderTypeLabel = getPendingOrderTypeLabel(order);
  const isEscalated = needsManagerReview(order);
  const isSentBack = wasSentBackToSale(order);
  const isPaid = order.paymentStatus === 'paid';
  const canApprove =
    scope === 'manager'
      ? canManagerApprovePendingOrder(order)
      : canSaleHandlePendingOrder(order);
  const helperText =
    scope === 'manager'
      ? isEscalated
        ? canApprove
          ? order.managerReviewReason || PENDING_ORDER_MANAGER_MESSAGE
          : order.managerReviewReason || PENDING_ORDER_MANAGER_APPROVAL_MESSAGE
        : ''
      : isEscalated
        ? 'Đã chuyển manager xử lý.'
        : isSentBack
          ? order.managerReviewReason || PENDING_ORDER_SENT_BACK_MESSAGE
          : !canApprove
            ? PENDING_ORDER_APPROVAL_MESSAGE
            : '';

  return (
    <div className="space-y-3">
      <div className="min-h-[108px] overflow-hidden rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-slate-950">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-slate-950/60">
              ĐƠN HÀNG
            </span>
            <span className="mt-1 block text-base font-extrabold leading-tight tracking-tight sm:text-lg">
              {order.id}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={paymentStatusConfig[order.paymentStatus].color}
              className={
                isPaid
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-amber-200 bg-white text-slate-900'
              }
            >
              {paymentStatusConfig[order.paymentStatus].label}
            </StatusBadge>
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900">
              Loại đơn: {orderTypeLabel}
            </span>
          </div>
        </div>
      </div>

      <section className="bg-muted/20 border-border rounded-xl border p-3.5">
        <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em]">
          <User className="h-4 w-4 text-yellow-600" />
          THÔNG TIN KHÁCH HÀNG
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs font-medium">Họ tên</p>
            <p className="text-foreground mt-1 text-sm font-semibold">
              {order.customer}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs font-medium">
              Số điện thoại
            </p>
            <p className="text-foreground mt-1 flex items-center gap-1.5 text-sm font-semibold">
              <Phone className="h-3.5 w-3.5 text-yellow-600" />
              {order.phone}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-muted-foreground text-xs font-medium">
              Địa chỉ giao hàng
            </p>
            <p className="text-foreground mt-1 flex items-start gap-1.5 text-sm font-semibold">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
              <span>{order.address}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/20 border-border rounded-xl border p-3.5">
        <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em]">
          <ShoppingBag className="h-4 w-4 text-yellow-600" />
          SẢN PHẨM ĐẶT MUA
        </div>

        <div className="mt-3 space-y-2.5">
          {order.products.map((product, idx) => (
            <div
              key={`${product.name}-${idx}`}
              className="bg-background/60 border-border flex items-center gap-2.5 rounded-lg border p-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 text-yellow-700">
                <span className="text-xs font-bold">WD</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-semibold">
                  {product.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="bg-muted text-muted-foreground inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium">
                    {product.variant || 'Mặc định'}
                  </span>
                  <span className="text-muted-foreground text-[11px] font-medium">
                    SL: {product.qty}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-foreground text-sm font-semibold">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-border mt-3 flex items-end justify-between border-t pt-3">
          <p className="text-muted-foreground text-sm font-medium">Tổng cộng</p>
          <p className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
            {formatCurrency(order.total)}
          </p>
        </div>
      </section>

      {order.note && (
        <section className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 p-3.5">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-yellow-700">
            GHI CHÚ
          </p>
          <p className="text-foreground mt-1.5 text-sm font-medium leading-6">
            {order.note}
          </p>
        </section>
      )}

      <div className="border-t border-slate-200/70 pt-3">
        {!!helperText && (
          <p className="mb-2 text-sm leading-6 text-amber-700">{helperText}</p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 sm:flex-1"
            onClick={() => onReject(order)}
          >
            <XCircle className="h-4 w-4" />
            Từ chối
          </Button>

          {scope === 'sale' && !canApprove && !isEscalated && (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 sm:flex-1"
              onClick={() => onEscalate(order)}
            >
              <CheckCircle className="h-4 w-4" />
              Chuyển manager
            </Button>
          )}

          {scope === 'manager' && isEscalated && (
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100 sm:flex-1"
              onClick={() => onSendBack(order)}
            >
              <CheckCircle className="h-4 w-4" />
              Trả lại sale
            </Button>
          )}

          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-green-700 sm:flex-1"
            disabled={!canApprove}
            onClick={() => onProcess(order)}
          >
            <CheckCircle className="h-4 w-4" />
            {scope === 'manager' ? 'Manager xác nhận' : 'Xác nhận xử lý'}
          </Button>
        </div>
      </div>
    </div>
  );
};
