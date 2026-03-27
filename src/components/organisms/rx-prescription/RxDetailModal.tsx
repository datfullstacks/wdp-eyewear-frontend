import { useCallback, useEffect, useRef, useState } from 'react';

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
import { formatDate } from '@/data/preorderData';
import { cn } from '@/lib/utils';
import type { PrescriptionOrder } from '@/types/rxPrescription';
import {
  CalendarDays,
  Check,
  ClipboardList,
  Copy,
  FileText,
  Glasses,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from 'lucide-react';

interface RxDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PrescriptionOrder | null;
  onInputPrescription: (order: PrescriptionOrder) => void;
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

function getPrescriptionStatusMeta(order: PrescriptionOrder) {
  if (order.prescriptionStatus === 'missing') {
    return { label: 'Thiếu Rx', type: 'error' as const };
  }

  if (order.prescriptionStatus === 'incomplete') {
    return { label: 'Chưa đầy đủ', type: 'warning' as const };
  }

  if (order.prescriptionStatus === 'pending_review') {
    return { label: 'Chờ duyệt', type: 'info' as const };
  }

  return { label: 'Đã duyệt', type: 'success' as const };
}

function getWorkflowMeta(order: PrescriptionOrder) {
  switch (order.workflowStage) {
    case 'waiting_review':
      return { label: 'Chờ duyệt Rx', type: 'warning' as const };
    case 'waiting_lab':
      return { label: 'Chờ vào gia công', type: 'info' as const };
    case 'lens_processing':
      return { label: 'Đang cắt mài tròng', type: 'warning' as const };
    case 'lens_fitting':
      return { label: 'Đang lắp tròng vào gọng', type: 'warning' as const };
    case 'qc_check':
      return { label: 'Đang QC sau gia công', type: 'info' as const };
    case 'ready_to_pack':
      return { label: 'Sẵn sàng đóng gói', type: 'success' as const };
    case 'packing':
      return { label: 'Đang đóng gói', type: 'warning' as const };
    case 'ready_to_ship':
      return { label: 'Chờ tạo vận đơn', type: 'info' as const };
    case 'shipment_created':
      return { label: 'Đã tạo vận đơn GHN', type: 'info' as const };
    case 'handover_to_carrier':
      return { label: 'Đã bàn giao vận chuyển', type: 'info' as const };
    case 'in_transit':
      return { label: 'Đang vận chuyển', type: 'info' as const };
    case 'delivery_failed':
      return { label: 'Giao thất bại', type: 'error' as const };
    case 'waiting_redelivery':
      return { label: 'Chờ giao lại', type: 'warning' as const };
    case 'return_pending':
      return { label: 'Chờ hoàn hàng', type: 'warning' as const };
    case 'return_in_transit':
      return { label: 'Đang hoàn hàng', type: 'warning' as const };
    case 'exception_hold':
      return { label: 'Đang hold ngoại lệ', type: 'error' as const };
    case 'delivered':
      return { label: 'Đã giao', type: 'success' as const };
    case 'returned':
      return { label: 'Đã hoàn hàng', type: 'error' as const };
    default:
      return { label: '-', type: 'default' as const };
  }
}

function getShipmentMeta(order: PrescriptionOrder) {
  const raw = String(order.shipmentStatus || '')
    .trim()
    .toLowerCase();

  if (!raw && !String(order.trackingCode || '').trim()) {
    return { label: 'Chưa có vận đơn', type: 'default' as const };
  }

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

  return {
    label: order.shipmentStatus ? `GHN: ${order.shipmentStatus}` : 'Đã tạo vận đơn',
    type: 'info' as const,
  };
}

function getSourceLabel(source: PrescriptionOrder['source']) {
  switch (source) {
    case 'customer_upload':
      return 'Khách upload';
    case 'customer_input':
      return 'Khách tự nhập thông số';
    default:
      return 'Chờ bổ sung';
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

export const RxDetailModal = ({
  open,
  onOpenChange,
  order,
  onInputPrescription,
}: RxDetailModalProps) => {
  if (!order) return null;

  const workflowMeta = getWorkflowMeta(order);
  const shipmentMeta = getShipmentMeta(order);
  const prescriptionStatusMeta = getPrescriptionStatusMeta(order);

  const sectionClass =
    'rounded-xl border border-border/80 bg-card p-4 shadow-sm';
  const sectionTitleClass = 'mb-3 text-base font-semibold text-foreground';
  const labelClass = 'font-medium text-foreground/80';
  const valueClass = 'text-sm font-semibold text-foreground';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/80 bg-background text-foreground max-h-[90vh] w-[96vw] max-w-5xl overflow-y-auto border p-4 shadow-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            Chi tiết đơn Prescription
          </DialogTitle>
          <DialogDescription className="text-foreground/90 text-sm font-medium">
            {order.orderId} - {formatDate(order.orderDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-border bg-card grid grid-cols-1 gap-3 rounded-lg border p-3 shadow-sm sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <User className="text-foreground h-4 w-4" />
              <div>
                <p className="text-foreground text-sm font-medium">Khách hàng</p>
                <p className="text-foreground font-semibold">{order.customer}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Glasses className="text-foreground h-4 w-4" />
              <div>
                <p className="text-foreground text-sm font-medium">Trạng thái Rx</p>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    getStatusTextClass(prescriptionStatusMeta.type)
                  )}
                >
                  {prescriptionStatusMeta.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="text-foreground h-4 w-4" />
              <div>
                <p className="text-foreground text-sm font-medium">Tiến độ xử lý</p>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    getStatusTextClass(workflowMeta.type)
                  )}
                >
                  {workflowMeta.label}
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
                  <div className={valueClass}>{order.customer}</div>
                </div>
                <div className="space-y-1">
                  <Label className={`flex items-center gap-2 ${labelClass}`}>
                    <Phone className="h-4 w-4" />
                    Số điện thoại
                  </Label>
                  <div className={valueClass}>{order.phone}</div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className={`flex items-center gap-2 ${labelClass}`}>
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                  </Label>
                  <div className={valueClass}>{order.address}</div>
                </div>
              </div>
            </div>

            <div className={sectionClass}>
              <div className={sectionTitleClass}>Tóm tắt đơn hàng</div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className={`flex items-center gap-2 ${labelClass}`}>
                    <ClipboardList className="h-4 w-4" />
                    Mã đơn
                  </Label>
                  <CopyableCode
                    value={order.orderId}
                    copyLabel="Sao chép mã đơn prescription"
                  />
                </div>
                <div className="space-y-1">
                  <Label className={`flex items-center gap-2 ${labelClass}`}>
                    <CalendarDays className="h-4 w-4" />
                    Ngày tạo
                  </Label>
                  <div className={valueClass}>{formatDate(order.orderDate)}</div>
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Nguồn Rx</Label>
                  <div className={valueClass}>{getSourceLabel(order.source)}</div>
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Trạng thái Rx</Label>
                  <div
                    className={cn(
                      valueClass,
                      getStatusTextClass(prescriptionStatusMeta.type)
                    )}
                  >
                    {prescriptionStatusMeta.label}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${sectionClass} lg:col-span-3`}>
              <div className={sectionTitleClass}>Sản phẩm prescription</div>
              <div className="space-y-3">
                {order.products.map((product, index) => (
                  <div
                    key={`${product.sku}-${index}`}
                    className="border-border bg-background rounded-lg border p-3 shadow-sm"
                  >
                    <div className="text-foreground font-semibold">{product.name}</div>
                    <div className="text-foreground/90 mt-1 text-xs">
                      Gọng / biến thể: {product.frame || '-'} • SL: {product.quantity}
                    </div>
                    <div className="text-foreground/90 mt-1 text-xs">
                      SKU:{' '}
                      <CopyableCode
                        value={product.sku}
                        copyLabel={`Sao chép SKU ${product.name}`}
                      />
                    </div>
                    <div className="text-foreground/90 mt-1 text-xs">
                      Vị trí kho: {product.warehouseLocation || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${sectionClass} lg:col-span-3`}>
              <div className={sectionTitleClass}>Vận hành và giao vận</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-1">
                  <Label className={`flex items-center gap-2 ${labelClass}`}>
                    <Package className="h-4 w-4" />
                    Tiến độ xử lý
                  </Label>
                  <div
                    className={cn(valueClass, getStatusTextClass(workflowMeta.type))}
                  >
                    {workflowMeta.label}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Ops stage backend</Label>
                  <div className={valueClass}>{order.opsStage || '-'}</div>
                </div>
                <div className="space-y-1">
                  <Label className={`flex items-center gap-2 ${labelClass}`}>
                    <Truck className="h-4 w-4" />
                    Giao vận
                  </Label>
                  <div
                    className={cn(valueClass, getStatusTextClass(shipmentMeta.type))}
                  >
                    {shipmentMeta.label}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Mã giao vận</Label>
                  <CopyableCode
                    value={order.trackingCode}
                    copyLabel="Sao chép mã giao vận"
                  />
                </div>
              </div>
            </div>

            {order.prescription ? (
              <div className={`${sectionClass} lg:col-span-3`}>
                <div className={sectionTitleClass}>Thông số mắt (Rx)</div>
                <div className="border-border/70 bg-background rounded-lg border p-4 shadow-sm">
                  <div className="grid grid-cols-4 gap-4 border-b border-border/60 pb-3 text-center text-sm">
                    <div className="font-medium text-foreground/70"></div>
                    <div className="font-medium text-foreground">SPH</div>
                    <div className="font-medium text-foreground">CYL</div>
                    <div className="font-medium text-foreground">AXIS</div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 py-3 text-center text-sm">
                    <div className="text-right font-medium text-foreground">
                      Mắt phải (OD)
                    </div>
                    <div>{order.prescription.sphereRight || '-'}</div>
                    <div>{order.prescription.cylinderRight || '-'}</div>
                    <div>{order.prescription.axisRight || '-'}</div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 border-t border-border/60 py-3 text-center text-sm">
                    <div className="text-right font-medium text-foreground">
                      Mắt trái (OS)
                    </div>
                    <div>{order.prescription.sphereLeft || '-'}</div>
                    <div>{order.prescription.cylinderLeft || '-'}</div>
                    <div>{order.prescription.axisLeft || '-'}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 border-t border-border/60 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-foreground/70 text-sm">PD</p>
                      <p className="text-foreground font-semibold">
                        {order.prescription.pd
                          ? `${order.prescription.pd}mm`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/70 text-sm">ADD phải</p>
                      <p className="text-foreground font-semibold">
                        {order.prescription.addRight || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/70 text-sm">ADD trái</p>
                      <p className="text-foreground font-semibold">
                        {order.prescription.addLeft || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/70 text-sm">Loại tròng</p>
                      <p className="text-foreground font-semibold">
                        {order.prescription.lensType || '-'}
                      </p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <p className="text-foreground/70 text-sm">Lớp phủ</p>
                      <p className="text-foreground font-semibold">
                        {order.prescription.coating || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${sectionClass} lg:col-span-3`}>
                <div className={sectionTitleClass}>Thông số mắt (Rx)</div>
                <div className="border-border rounded-xl border border-dashed p-6 text-center">
                  <Glasses className="text-foreground/70 mx-auto h-8 w-8" />
                  <p className="text-foreground/70 mt-2">Chưa có thông số mắt</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      onOpenChange(false);
                      onInputPrescription(order);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Nhập thông số
                  </Button>
                </div>
              </div>
            )}

            {order.notes ? (
              <div className="border-warning/30 bg-warning/10 rounded-xl border p-4 shadow-sm lg:col-span-3">
                <div className="text-warning mb-2 font-semibold">Ghi chú</div>
                <div className="text-foreground text-sm font-medium whitespace-pre-wrap">
                  {order.notes}
                </div>
              </div>
            ) : null}
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
