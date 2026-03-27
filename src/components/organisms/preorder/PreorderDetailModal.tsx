import { useCallback, useEffect, useRef, useState } from 'react';
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
  Check,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Copy,
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
    [
      'transporting',
      'sorting',
      'delivering',
      'money_collect_delivering',
    ].includes(raw)
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

function CopyableCode({
  value,
  placeholder = '-',
  copyLabel,
}: {
  value?: string | null;
  placeholder?: string;
  copyLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);
  const trimmedValue = String(value || '').trim();
  const hasValue = Boolean(trimmedValue);

  const handleCopy = useCallback(async () => {
    if (!hasValue) return;

    try {
      await navigator.clipboard.writeText(trimmedValue);
      setCopied(true);

      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        resetTimerRef.current = null;
      }, 1500);
    } catch {
      // noop
    }
  }, [hasValue, trimmedValue]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  if (!hasValue) {
    return (
      <div className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-500">
        {placeholder}
      </div>
    );
  }

  return (
    <div className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-sky-950 shadow-sm">
      <span className="px-1 font-mono text-sm font-semibold">{trimmedValue}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-md text-sky-700 hover:bg-sky-100 hover:text-sky-950"
        aria-label={copyLabel}
        onClick={() => {
          void handleCopy();
        }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
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

  const sectionClass =
    'rounded-xl border border-border/80 bg-card p-4 shadow-sm';
  const sectionTitleClass = 'mb-3 text-base font-semibold text-foreground';
  const statCardClass =
    'rounded-lg border border-border/70 bg-background p-3 shadow-sm';
  const labelClass = 'font-medium text-foreground/80';
  const valueClass = 'text-sm font-semibold text-foreground';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/80 bg-background text-foreground max-h-[90vh] w-[96vw] max-w-5xl overflow-y-auto border p-4 shadow-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            Chi tiết đơn Pre-order
          </DialogTitle>
          <DialogDescription className="text-foreground/90 text-sm font-medium">
            {order.orderCode} - {formatDate(order.orderDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-border bg-card grid grid-cols-2 gap-3 rounded-lg border p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <User className="text-foreground h-4 w-4" />
              <div>
                <p className="text-foreground text-sm font-medium">
                  Khách hàng
                </p>
                <p className="text-foreground font-semibold">
                  {order.customerName}
                </p>
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
                    <CopyableCode
                      value={order.orderCode}
                      copyLabel="Sao chép mã đơn"
                    />
                  </div>
                ) : null}
                {order.orderDate ? (
                  <div className="space-y-1">
                    <Label className={`flex items-center gap-2 ${labelClass}`}>
                      <CalendarDays className="h-4 w-4" />
                      Ngày tạo
                    </Label>
                    <div className={valueClass}>
                      {formatDate(order.orderDate)}
                    </div>
                  </div>
                ) : null}
                {order.expectedDate ? (
                  <div className="space-y-1">
                    <Label className={labelClass}>Dự kiến về</Label>
                    <div className={valueClass}>
                      {formatDate(order.expectedDate)}
                    </div>
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
              <div className={sectionTitleClass}>
                Sản phẩm đặt trước
              </div>
              <div className="space-y-3">
                {order.products.map((product, idx) => (
                  <div
                    key={idx}
                    className="border-border bg-background flex items-center justify-between rounded-lg border p-3 shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-semibold">
                          {product.name}
                        </span>
                        <PreorderProductStatusBadge status={product.status} />
                      </div>

                      <div className="text-foreground/90 text-xs">
                        Biến thể: {product.variant || '-'} • SL: {product.quantity}
                      </div>
                      <div className="text-foreground/90 text-xs">
                        SKU:{' '}
                        <CopyableCode
                          value={product.sku}
                          copyLabel={`Sao chép SKU ${product.name}`}
                        />
                      </div>
                      <div className="text-foreground/90 text-xs">
                        Nhà cung cấp: {product.supplier || '-'}
                      </div>
                      <div className="text-foreground/90 text-xs">
                        Vị trí kho: {product.warehouseLocation || '-'}
                      </div>

                      {product.batchCode && (
                        <div className="mt-1 flex items-center gap-2">
                          <Truck className="text-foreground h-3 w-3" />
                          <span className="text-foreground/90 text-xs font-medium">
                            Lô: {product.batchCode} - Dự kiến:{' '}
                            {formatDate(product.batchExpectedDate || '')}
                          </span>
                        </div>
                      )}
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
                  <CopyableCode
                    value={order.trackingCode}
                    copyLabel="Sao chép mã giao vận"
                  />
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
              <div className="border-warning/30 bg-warning/10 rounded-xl border p-4 shadow-sm lg:col-span-3">
                <div className="text-warning mb-2 font-semibold">Ghi chú</div>
                <div className="text-foreground text-sm font-medium whitespace-pre-wrap">
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
