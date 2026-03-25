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
import {
  getCustomerOrderStatusMeta,
  getCustomerShippingStatusMeta,
} from '@/lib/customerOrderStatus';
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

const PAYMENT_STATUS_TEXT: Record<OrderRecord['paymentStatus'], string> = {
  paid: 'Đã thanh toán',
  pending: 'Chưa thanh toán',
  partial: 'Thanh toán một phần',
  cod: 'COD',
};

const ORDER_TYPE_TEXT: Record<string, string> = {
  ready_stock: 'Hàng có sẵn',
  pre_order: 'Đặt trước',
};

function orderTypeLabel(order: OrderRecord, hasRx: boolean) {
  const orderType = String(order.orderType || '').toLowerCase();
  if (orderType && ORDER_TYPE_TEXT[orderType]) return ORDER_TYPE_TEXT[orderType];
  if (hasRx) return 'Làm theo đơn';
  return order.orderType || '-';
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground/70 text-xs font-medium">{children}</p>;
}

function Value({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground text-sm font-semibold">{children}</p>;
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
  const orderTypeText = orderTypeLabel(order, Boolean(rx || supplement));
  const orderStatusMeta = getCustomerOrderStatusMeta(order);
  const shippingStatusMeta = getCustomerShippingStatusMeta(order);
  const trackingCode =
    order.shipment?.orderCode || order.shipment?.trackingCode || '-';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-h-[72vh] max-w-[640px] overflow-y-auto p-4 text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn {order.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <Label>Trạng thái đơn</Label>
              <StatusBadge status={orderStatusMeta.type}>
                {orderStatusMeta.label}
              </StatusBadge>
            </div>

            <div className="space-y-1">
              <Label>Thanh toán</Label>
              <StatusBadge status={paymentBadgeType(order.paymentStatus)}>
                {PAYMENT_STATUS_TEXT[order.paymentStatus]}
              </StatusBadge>
              <p className="text-foreground/60 text-xs">
                Phương thức: {order.paymentMethod || '-'}
              </p>
            </div>

            <div className="space-y-1">
              <Label>Ngày tạo</Label>
              <Value>{createdAtLabel}</Value>
              <p className="text-foreground/60 text-xs">
                Loại đơn: {orderTypeText}
              </p>
            </div>

            <div className="space-y-1">
              <Label>Vận chuyển</Label>
              {shippingStatusMeta ? (
                <>
                  <StatusBadge status={shippingStatusMeta.type}>
                    {shippingStatusMeta.label}
                  </StatusBadge>
                  <p className="text-foreground/60 text-xs">
                    Tracking: {trackingCode}
                  </p>
                </>
              ) : (
                <Value>Chưa tạo vận đơn</Value>
              )}
            </div>
          </div>

          {(order.shipment?.latestStatus || order.shipment?.orderCode) && (
            <div className="border-border bg-muted/20 rounded-lg border p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label>Trạng thái GHN</Label>
                  <Value>{order.shipment?.latestStatus || '-'}</Value>
                </div>
                <div className="space-y-1">
                  <Label>Mã vận đơn</Label>
                  <Value>{trackingCode}</Value>
                </div>
                <div className="space-y-1">
                  <Label>Dịch vụ</Label>
                  <Value>{order.shipment?.serviceName || 'GHN'}</Value>
                </div>
              </div>
            </div>
          )}

          <div className="border-border border-t pt-4">
            <h4 className="text-foreground mb-3 font-semibold">Khách hàng</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label>Tên</Label>
                <Value>{order.customerName}</Value>
              </div>
              <div className="space-y-1">
                <Label>SĐT</Label>
                <Value>{order.customerPhone || '-'}</Value>
              </div>
              <div className="space-y-1 sm:col-span-3">
                <Label>Địa chỉ</Label>
                <Value>{order.customerAddress || '-'}</Value>
              </div>
              {order.note && (
                <div className="space-y-1 sm:col-span-3">
                  <Label>Ghi chú</Label>
                  <p className="text-foreground whitespace-pre-wrap text-sm">
                    {order.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-border border-t pt-4">
            <h4 className="text-foreground mb-3 font-semibold">Sản phẩm</h4>
            <div className="space-y-2">
              {order.items.map((item) => {
                const isRx =
                  item.hasPrescription ||
                  item.orderMadeFromPrescriptionImage ||
                  item.prescriptionMode !== 'none';

                return (
                  <div
                    key={item.id || `${item.name}-${item.variant}`}
                    className="bg-card border-border rounded-lg border p-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-foreground truncate font-semibold">
                          {item.name}
                        </p>
                        <p className="text-foreground/70 text-sm">
                          {item.variant} • SL: {item.quantity}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.preOrder && (
                            <span className="bg-warning/10 text-warning rounded-full border border-warning/20 px-2 py-0.5 text-xs font-medium">
                              Đặt trước
                            </span>
                          )}
                          {isRx && (
                            <span className="bg-primary/10 text-primary rounded-full border border-primary/20 px-2 py-0.5 text-xs font-medium">
                              Rx
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-extrabold">
                          {formatCurrency(item.lineTotal)}
                        </p>
                        <p className="text-foreground/60 text-xs">
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
              <div className="text-right">
                <p className="text-muted-foreground text-xs font-medium">
                  Tổng tiền
                </p>
                <p className="text-primary text-2xl font-extrabold leading-none">
                  {formatCurrency(order.total)}
                </p>
                {order.paidAmount > 0 && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Đã trả: {formatCurrency(order.paidAmount)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {(rx || supplement) && (
            <div className="border-border border-t pt-4">
              <h4 className="text-foreground mb-3 font-semibold">Toa kính</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {rx && (
                  <div className="space-y-1">
                    <Label>Trạng thái Rx</Label>
                    <Value>{rx.prescriptionStatus}</Value>
                    <p className="text-foreground/60 text-xs">
                      Nguồn: {rx.source}
                    </p>
                  </div>
                )}
                {supplement && (
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Cần bổ sung</Label>
                    <Value>{supplement.missingType}</Value>
                    {supplement.missingFields?.length > 0 && (
                      <p className="text-foreground/60 text-xs">
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
