import type { OrderRecord } from '@/api/orders';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toPrescriptionOrder, toSupplementOrder } from '@/lib/orderAdapters';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function paymentBadgeType(status: OrderRecord['paymentStatus']) {
  switch (status) {
    case 'paid':
      return 'success' as const;
    case 'partial':
      return 'info' as const;
    case 'cod':
      return 'default' as const;
    case 'pending':
    default:
      return 'warning' as const;
  }
}

function orderBadgeType(status: OrderRecord['status']) {
  switch (status) {
    case 'completed':
      return 'success' as const;
    case 'processing':
      return 'info' as const;
    case 'cancelled':
      return 'error' as const;
    case 'pending':
    default:
      return 'warning' as const;
  }
}

export function OrderDetailModal({
  open,
  onOpenChange,
  order,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRecord | null;
}) {
  if (!order) return null;

  const createdAtLabel = order.createdAt
    ? new Date(order.createdAt).toLocaleString('vi-VN')
    : '-';

  const rx = toPrescriptionOrder(order);
  const supplement = toSupplementOrder(order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn {order.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Trạng thái</p>
              <StatusBadge status={orderBadgeType(order.status)}>
                {order.status}
              </StatusBadge>
              {order.rawStatus && (
                <p className="text-muted-foreground text-xs">
                  Raw: {order.rawStatus}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Thanh toán</p>
              <StatusBadge status={paymentBadgeType(order.paymentStatus)}>
                {order.paymentStatus}
              </StatusBadge>
              <p className="text-muted-foreground text-xs">
                Method: {order.paymentMethod || '-'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Ngày tạo</p>
              <p className="font-medium">{createdAtLabel}</p>
              <p className="text-muted-foreground text-xs">
                Type: {order.orderType || '-'}
              </p>
            </div>
          </div>

          <div className="border-border border-t pt-4">
            <h4 className="mb-3 font-medium">Khách hàng</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Tên</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">SĐT</p>
                <p className="font-medium">{order.customerPhone || '-'}</p>
              </div>
              <div className="space-y-1 sm:col-span-3">
                <p className="text-muted-foreground text-sm">Địa chỉ</p>
                <p className="font-medium">{order.customerAddress || '-'}</p>
              </div>
              {order.note && (
                <div className="space-y-1 sm:col-span-3">
                  <p className="text-muted-foreground text-sm">Ghi chú</p>
                  <p className="text-foreground/90 whitespace-pre-wrap">
                    {order.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-border border-t pt-4">
            <h4 className="mb-3 font-medium">Sản phẩm</h4>
            <div className="space-y-3">
              {order.items.map((item) => {
                const isRx =
                  item.hasPrescription ||
                  item.orderMadeFromPrescriptionImage ||
                  item.prescriptionMode !== 'none';

                return (
                  <div
                    key={item.id || `${item.name}-${item.variant}`}
                    className="bg-muted/30 rounded-lg border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {item.variant} • Qty: {item.quantity}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.preOrder && (
                            <span className="bg-warning/10 text-warning rounded-full border border-warning/20 px-2 py-0.5 text-xs">
                              Pre-order
                            </span>
                          )}
                          {isRx && (
                            <span className="bg-primary/10 text-primary rounded-full border border-primary/20 px-2 py-0.5 text-xs">
                              Rx
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.lineTotal)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatCurrency(item.unitPrice)} / sp
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2" />
              <div className="bg-muted/30 rounded-lg border p-3 text-right">
                <p className="text-muted-foreground text-sm">Tổng tiền</p>
                <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                {order.paidAmount > 0 && (
                  <p className="text-muted-foreground text-xs">
                    Đã trả: {formatCurrency(order.paidAmount)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {(rx || supplement) && (
            <div className="border-border border-t pt-4">
              <h4 className="mb-3 font-medium">Prescription</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {rx && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Trạng thái Rx</p>
                    <p className="font-medium">{rx.prescriptionStatus}</p>
                    <p className="text-muted-foreground text-xs">
                      Source: {rx.source}
                    </p>
                  </div>
                )}
                {supplement && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-muted-foreground text-sm">Cần bổ sung</p>
                    <p className="font-medium">{supplement.missingType}</p>
                    {supplement.missingFields?.length > 0 && (
                      <p className="text-muted-foreground text-xs">
                        {supplement.missingFields.map((f) => f.label).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

