'use client';

import type {
  OrderRecord,
  OrderShippingInfo,
  OrderShippingTestStatus,
} from '@/api/orders';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

function formatDateTime(value?: string) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleString('vi-VN', { hour12: false });
}

const TEST_STATUS_LABEL: Record<OrderShippingTestStatus, string> = {
  ready_to_pick: 'Chờ lấy hàng',
  picking: 'Shipper đang lấy',
  transporting: 'Đang giao',
  delivered: 'Đã giao',
  returned: 'Hoàn hàng',
};

export function ReadyStockShipmentModal({
  open,
  onOpenChange,
  order,
  mode,
  shippingInfo,
  isLoading,
  isSubmitting,
  errorMessage,
  onSubmit,
  onAdvanceStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRecord | null;
  mode: 'create' | 'sync';
  shippingInfo: OrderShippingInfo | null;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: () => void;
  onAdvanceStatus: (status: OrderShippingTestStatus) => void;
}) {
  if (!order) return null;

  const isCreate = mode === 'create';
  const shipment = shippingInfo?.shipment;
  const canSubmit = isCreate
    ? Boolean(shippingInfo?.permissions.create_shipment)
    : Boolean(shippingInfo?.permissions.sync_shipment);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground w-[92vw] max-w-[560px] p-4 shadow-2xl">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? 'Tạo vận đơn GHN' : 'Đồng bộ GHN'} • {order.code}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-border bg-muted/10 rounded-lg border p-3 text-sm">
            <div className="font-medium">
              {isCreate
                ? 'Operation sẽ tạo vận đơn GHN từ shipping address của order.'
                : 'Hệ thống sẽ đồng bộ trạng thái GHN mới nhất về đơn hàng này.'}
            </div>
            <div className="text-foreground/70 mt-1">
              Đơn vị vận chuyển hiện tại: GHN - Giao Hàng Nhanh
            </div>
          </div>

          {isLoading ? (
            <div className="text-foreground/70 text-sm">
              Đang tải thông tin GHN...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Trạng thái đơn hàng</Label>
                  <div className="text-sm font-semibold">
                    {shippingInfo?.orderStatus || order.rawStatus || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Phương thức vận chuyển</Label>
                  <div className="text-sm font-semibold">
                    {shippingInfo?.shippingMethod || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Mã vận đơn GHN</Label>
                  <div className="font-mono text-sm">
                    {shipment?.orderCode || shipment?.trackingCode || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Trạng thái GHN</Label>
                  <div className="text-sm font-semibold">
                    {shipment?.latestStatus || shipment?.state || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Dịch vụ</Label>
                  <div className="text-sm font-semibold">
                    {shipment?.serviceName || 'GHN'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Thời gian dự kiến</Label>
                  <div className="text-sm font-semibold">
                    {formatDateTime(shipment?.leadtime)}
                  </div>
                </div>
              </div>

              {shipment?.latestFailReason && (
                <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-3 text-sm">
                  <div className="text-destructive font-medium">
                    Lý do lỗi GHN
                  </div>
                  <div className="mt-1">{shipment.latestFailReason}</div>
                </div>
              )}

              {shippingInfo?.testMode &&
                Boolean(shippingInfo.permissions.update_test_status) &&
                shippingInfo.testStatusOptions.length > 0 && (
                  <div className="border-border bg-muted/10 rounded-lg border p-3 text-sm">
                    <div className="font-medium">
                      Cập nhật trạng thái GHN theo thứ tự (test mode)
                    </div>
                    <div className="text-foreground/70 mt-1">
                      Chỉ cho phép chuyển sang bước tiếp theo hợp lệ.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {shippingInfo.testStatusOptions.map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          onClick={() => onAdvanceStatus(status)}
                          disabled={isLoading || isSubmitting}
                        >
                          {TEST_STATUS_LABEL[status]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}

          {errorMessage && (
            <div className="text-destructive text-sm">{errorMessage}</div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || isLoading || isSubmitting}
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : isCreate
                ? 'Tạo vận đơn GHN'
                : 'Đồng bộ GHN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
