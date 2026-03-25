import {
  PreorderOrderStatusBadge,
  PreorderPaymentBadge,
  PreorderProductStatusBadge,
} from '@/components/atoms/PreorderStatusBadge';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/data/preorderData';
import { cn } from '@/lib/utils';
import type { PreorderOpsStatus, PreorderOrder } from '@/types/preorder';
import {
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  MapPin,
  Phone,
  Truck,
  User,
} from 'lucide-react';

interface PreorderDetailModalProps {
  order: PreorderOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getOpsStatusMeta(status: PreorderOpsStatus) {
  switch (status) {
    case 'waiting_arrival':
      return { label: 'Chờ hàng về', type: 'warning' as const };
    case 'arrived':
      return { label: 'Hàng đã về', type: 'success' as const };
    case 'stocked':
      return { label: 'Đã nhập kho', type: 'info' as const };
    case 'ready_to_pack':
      return { label: 'Sẵn sàng đóng gói', type: 'info' as const };
    case 'packing':
      return { label: 'Đang đóng gói', type: 'warning' as const };
    case 'shipment_created':
      return { label: 'Đã tạo vận đơn', type: 'info' as const };
    default:
      return { label: status, type: 'default' as const };
  }
}

function getShipmentStatusMeta(order: PreorderOrder) {
  const raw = String(order.shipmentStatus || '')
    .trim()
    .toLowerCase();

  if (raw === 'delivered') {
    return { label: 'Đã giao', type: 'success' as const };
  }

  if (raw === 'returned') {
    return { label: 'Hoàn hàng', type: 'error' as const };
  }

  if (
    ['return', 'return_transporting', 'return_sorting', 'returning'].includes(
      raw
    )
  ) {
    return { label: 'Đang hoàn hàng', type: 'warning' as const };
  }

  if (raw === 'waiting_to_return') {
    return { label: 'Chờ giao lại / hoàn hàng', type: 'warning' as const };
  }

  if (raw === 'delivery_fail') {
    return { label: 'Giao thất bại', type: 'error' as const };
  }

  if (
    ['transporting', 'sorting', 'delivering', 'money_collect_delivering'].includes(
      raw
    )
  ) {
    return { label: 'Đang vận chuyển', type: 'info' as const };
  }

  if (['picking', 'money_collect_picking', 'picked', 'storing'].includes(raw)) {
    return { label: 'GHN đang nhận hàng', type: 'info' as const };
  }

  if (raw === 'ready_to_pick') {
    return { label: 'Đã tạo vận đơn', type: 'info' as const };
  }

  if (order.trackingCode) {
    return { label: 'Đã tạo vận đơn', type: 'info' as const };
  }

  return null;
}

function getStatusTextClass(
  status: 'success' | 'warning' | 'error' | 'info' | 'default'
) {
  switch (status) {
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'error':
      return 'text-destructive';
    case 'info':
      return 'text-primary';
    default:
      return 'text-foreground';
  }
}

export const PreorderDetailModal = ({
  order,
  open,
  onOpenChange,
}: PreorderDetailModalProps) => {
  if (!order) return null;

  const opsStatusMeta = getOpsStatusMeta(order.opsStatus);
  const shipmentStatusMeta = getShipmentStatusMeta(order);
  const remainingAmount = Math.max(0, order.totalAmount - order.depositAmount);
  const totalQuantity = order.products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  const sectionClass = 'rounded-xl border border-border/80 bg-card p-4 shadow-sm';
  const sectionTitleClass = 'mb-3 text-base font-semibold text-foreground';
  const statCardClass =
    'rounded-lg border border-border/70 bg-background p-3 shadow-sm';
  const labelClass = 'font-medium text-foreground/80';
  const valueClass = 'text-sm font-semibold text-foreground';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[96vw] max-w-5xl overflow-y-auto border border-border/80 bg-background p-4 text-foreground shadow-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Chi tiết đơn Pre-order
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-foreground/90">
            {order.orderCode} - {formatDate(order.orderDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className={sectionClass}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="text-lg font-semibold text-foreground">
                  {order.customerName}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PreorderOrderStatusBadge status={order.status} />
                  <PreorderPaymentBadge status={order.paymentStatus} />
                  <StatusBadge status={opsStatusMeta.type}>
                    Ops: {opsStatusMeta.label}
                  </StatusBadge>
                  {shipmentStatusMeta && (
                    <StatusBadge status={shipmentStatusMeta.type}>
                      GHN: {shipmentStatusMeta.label}
                    </StatusBadge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className={statCardClass}>
                  <div className="text-xs font-medium text-foreground/80">
                    Tổng tiền
                  </div>
                  <div className="mt-1 text-base font-semibold text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </div>
                </div>
                <div className={statCardClass}>
                  <div className="text-xs font-medium text-foreground/80">
                    Đã thanh toán
                  </div>
                  <div className="mt-1 text-base font-semibold text-success">
                    {formatCurrency(order.depositAmount)}
                  </div>
                </div>
                <div className={statCardClass}>
                  <div className="text-xs font-medium text-foreground/80">
                    Còn lại
                  </div>
                  <div className="mt-1 text-base font-semibold text-warning">
                    {formatCurrency(remainingAmount)}
                  </div>
                </div>
                <div className={statCardClass}>
                  <div className="text-xs font-medium text-foreground/80">
                    Số lượng
                  </div>
                  <div className="mt-1 text-base font-semibold text-foreground">
                    {totalQuantity} sản phẩm
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={`${sectionClass} lg:col-span-2`}>
              <div className={sectionTitleClass}>Thông tin người nhận</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className={`flex items-center gap-2 ${labelClass}`}>
                    <User className="h-4 w-4" />
                    Khách hàng
                  </Label>
                  <div className={valueClass}>{order.customerName}</div>
                </div>
                <div className="space-y-1">
                  <Label className={`flex items-center gap-2 ${labelClass}`}>
                    <Phone className="h-4 w-4" />
                    Số điện thoại
                  </Label>
                  <div className={valueClass}>{order.customerPhone}</div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className={`flex items-center gap-2 ${labelClass}`}>
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                  </Label>
                  <div className={valueClass}>{order.customerAddress}</div>
                </div>
              </div>
            </div>

            <div className={sectionClass}>
              <div className={sectionTitleClass}>Tóm tắt đơn hàng</div>
              <div className="space-y-3">
                {order.orderCode ? (
                  <div className="space-y-1">
                    <Label className={`flex items-center gap-2 ${labelClass}`}>
                      <ClipboardList className="h-4 w-4" />
                      Mã đơn
                    </Label>
                    <div className="font-mono text-sm font-semibold text-foreground">
                      {order.orderCode}
                    </div>
                  </div>
                ) : null}
                {order.orderDate ? (
                  <div className="space-y-1">
                    <Label className={`flex items-center gap-2 ${labelClass}`}>
                      <CalendarDays className="h-4 w-4" />
                      Ngày tạo
                    </Label>
                    <div className={valueClass}>{formatDate(order.orderDate)}</div>
                  </div>
                ) : null}
                {order.expectedDate ? (
                  <div className="space-y-1">
                    <Label className={labelClass}>Dự kiến về</Label>
                    <div className={valueClass}>{formatDate(order.expectedDate)}</div>
                  </div>
                ) : null}
                {order.paymentStatus ? (
                  <div className="space-y-1">
                    <Label className={`flex items-center gap-2 ${labelClass}`}>
                      <CircleDollarSign className="h-4 w-4" />
                      Thanh toán
                    </Label>
                    <div className={valueClass}>{order.paymentStatus}</div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className={`${sectionClass} lg:col-span-3`}>
              <div className={sectionTitleClass}>Sản phẩm đặt trước</div>
              <div className="space-y-3">
                {order.products.map((product, idx) => (
                  <div
                    key={`${product.sku}-${idx}`}
                    className="rounded-lg border border-border/70 bg-background p-3 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-semibold text-foreground">
                            {product.name}
                          </div>
                          <PreorderProductStatusBadge status={product.status} />
                        </div>
                        <div className="text-sm font-medium text-foreground/90">
                          SKU: {product.sku} - Biến thể: {product.variant} - SL:{' '}
                          {product.quantity}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                        <div className="space-y-1">
                          <Label className={labelClass}>Lô nhập hàng</Label>
                          <div className={valueClass}>{product.batchCode || '-'}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className={labelClass}>Dự kiến batch về</Label>
                          <div className={valueClass}>
                            {product.batchExpectedDate
                              ? formatDate(product.batchExpectedDate)
                              : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${sectionClass} lg:col-span-3`}>
              <div className={sectionTitleClass}>Giao vận</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-1">
                  <Label className={`flex items-center gap-2 ${labelClass}`}>
                    <Truck className="h-4 w-4" />
                    Đơn vị VC
                  </Label>
                  <div className={valueClass}>
                    {order.carrierId ? order.carrierId.toUpperCase() : 'GHN'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Mã giao vận</Label>
                  <div className="font-mono text-sm font-semibold text-foreground">
                    {order.trackingCode || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Trạng thái GHN</Label>
                  {shipmentStatusMeta ? (
                    <div
                      className={cn(
                        valueClass,
                        getStatusTextClass(shipmentStatusMeta.type)
                      )}
                    >
                      {shipmentStatusMeta.label}
                    </div>
                  ) : (
                    <div className={valueClass}>-</div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Dịch vụ</Label>
                  <div className={valueClass}>
                    {order.shipmentServiceName || 'GHN'}
                  </div>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 shadow-sm lg:col-span-3">
                <div className="mb-2 font-semibold text-warning">Ghi chú</div>
                <div className="whitespace-pre-wrap text-sm font-medium text-foreground">
                  {order.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
