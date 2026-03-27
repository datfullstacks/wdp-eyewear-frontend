import { CheckCircle, MapPin, Phone, ShoppingBag, User, XCircle } from 'lucide-react';

import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface PendingDetailModalProps {
  scope?: 'sale' | 'manager';
  order: PendingOrder | null;
  onClose: () => void;
  onProcess: (order: PendingOrder) => void;
  onReject: (order: PendingOrder) => void;
  onEscalate: (order: PendingOrder) => void;
  onSendBack: (order: PendingOrder) => void;
}

export const PendingDetailModal = ({
  scope = 'sale',
  order,
  onClose,
  onProcess,
  onReject,
  onEscalate,
  onSendBack,
}: PendingDetailModalProps) => {
  if (!order) return null;

  const orderTypeLabel = getPendingOrderTypeLabel(order);
  const isEscalated = needsManagerReview(order);
  const isSentBack = wasSentBackToSale(order);
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
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] w-[92vw] max-w-md flex-col overflow-hidden border-0 p-0 shadow-2xl [&>button.absolute]:bg-slate-950/10 [&>button.absolute]:text-slate-950/80 [&>button.absolute]:hover:bg-slate-950/15 [&>button.absolute]:hover:text-slate-950">
        <div className="relative shrink-0 overflow-hidden border-b border-yellow-500/40 bg-yellow-400 px-5 py-3 sm:px-6 sm:py-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-slate-950">
              <span className="text-xs font-semibold tracking-[0.25em] text-slate-950/60">
                ĐƠN HÀNG
              </span>
              <span className="mt-1 block text-lg font-extrabold leading-tight tracking-tight">
                {order.id}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge
              status={paymentStatusConfig[order.paymentStatus].color}
              className="border-slate-950/15 bg-slate-950/10 text-slate-950"
            >
              {paymentStatusConfig[order.paymentStatus].label}
            </StatusBadge>
            <span className="inline-flex items-center rounded-full border border-slate-950/15 bg-slate-950/10 px-2.5 py-1 text-xs font-semibold text-slate-950">
              Loại đơn: {orderTypeLabel}
            </span>
          </div>
        </div>

        <div className="bg-background flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="bg-muted/20 border-border rounded-xl border p-4">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.18em]">
              <User className="h-4 w-4 text-yellow-600" />
              THÔNG TIN KHÁCH HÀNG
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs font-medium">Họ tên</p>
                <p className="text-foreground mt-1 font-semibold">{order.customer}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Số điện thoại
                </p>
                <p className="text-foreground mt-1 flex items-center gap-2 font-semibold">
                  <Phone className="h-4 w-4 text-yellow-600" />
                  {order.phone}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-xs font-medium">
                  Địa chỉ giao hàng
                </p>
                <p className="text-foreground mt-1 flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  {order.address}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-muted/20 border-border rounded-xl border p-4">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.18em]">
              <ShoppingBag className="h-4 w-4 text-yellow-600" />
              SẢN PHẨM ĐẶT MUA
            </div>

            <div className="mt-4 space-y-3">
              {order.products.map((product, idx) => (
                <div
                  key={`${product.name}-${idx}`}
                  className="bg-background/60 border-border flex items-center gap-3 rounded-xl border p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-700">
                    <span className="text-xs font-bold">WD</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate font-semibold">
                      {product.name}
                    </p>
                    <span className="bg-muted text-muted-foreground mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium">
                      {product.variant || 'Mặc định'}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-foreground font-semibold">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-muted-foreground text-xs font-medium">
                      Số lượng: {product.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-border mt-4 flex items-end justify-between border-t pt-4">
              <p className="text-muted-foreground text-sm font-medium">Tổng cộng</p>
              <p className="text-foreground text-2xl font-extrabold tracking-tight">
                {formatCurrency(order.total)}
              </p>
            </div>
          </section>

          {order.note && (
            <section className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 p-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-yellow-700">
                GHI CHÚ
              </p>
              <p className="text-foreground mt-2 text-sm font-medium">
                {order.note}
              </p>
            </section>
          )}
        </div>

        <div className="bg-background shrink-0 px-5 pb-5 sm:px-6 sm:pb-6">
          {!!helperText && <p className="mb-3 text-sm text-amber-700">{helperText}</p>}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              variant="outline"
              className="border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 sm:flex-1"
              onClick={() => {
                onClose();
                onReject(order);
              }}
            >
              <XCircle className="h-4 w-4" />
              Từ chối
            </Button>

            {scope === 'sale' && !canApprove && !isEscalated && (
              <Button
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 sm:flex-1"
                onClick={() => {
                  onClose();
                  onEscalate(order);
                }}
              >
                <CheckCircle className="h-4 w-4" />
                Chuyển manager
              </Button>
            )}

            {scope === 'manager' && isEscalated && (
              <Button
                variant="outline"
                className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100 sm:flex-1"
                onClick={() => {
                  onClose();
                  onSendBack(order);
                }}
              >
                <CheckCircle className="h-4 w-4" />
                Trả lại sale
              </Button>
            )}

            <Button
              className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-yellow-500/25 hover:from-yellow-500 hover:to-amber-600 sm:flex-1"
              disabled={!canApprove}
              onClick={() => {
                onClose();
                onProcess(order);
              }}
            >
              <CheckCircle className="h-4 w-4" />
              {scope === 'manager' ? 'Manager xác nhận' : 'Xác nhận xử lý'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
