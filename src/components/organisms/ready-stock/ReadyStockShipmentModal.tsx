'use client';

import type {
  OrderRecord,
  OrderShippingInfo,
  OrderShippingTestStatus,
} from '@/api/orders';
import { getCustomerShippingStatusMeta } from '@/lib/customerOrderStatus';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';

function formatDateTime(value?: string) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleString('vi-VN', { hour12: false });
}

const TEST_STATUS_LABEL: Record<OrderShippingTestStatus, string> = {
  ready_to_pick: 'Cho lay hang',
  picking: 'Dang lay hang',
  storing: 'Dang luu kho',
  transporting: 'Dang van chuyen',
  delivering: 'Dang giao hang',
  delivery_fail: 'Giao that bai',
  waiting_to_return: 'Cho giao lai / hoan',
  return: 'Bat dau hoan hang',
  return_transporting: 'Dang van chuyen hoan',
  returning: 'Dang tra ve shop',
  delivered: 'Da giao',
  return_fail: 'Hoan that bai',
  damage: 'Hu hong',
  lost: 'That lac',
  returned: 'Da hoan hang',
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
  const tc = useTranslations('manager.common');
  if (!order) return null;

  const isCreate = mode === 'create';
  const shipment = shippingInfo?.shipment;
  const shippingStatusMeta = getCustomerShippingStatusMeta({
    shipment: shipment || order.shipment || undefined,
    opsStage: shippingInfo?.opsStage ?? order.opsStage,
    rawStatus: shippingInfo?.orderStatus || order.rawStatus,
  });
  const canSubmit = isCreate
    ? Boolean(shippingInfo?.permissions.create_shipment)
    : Boolean(shippingInfo?.permissions.sync_shipment);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground w-[92vw] max-w-[560px] p-4 shadow-2xl">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? 'Tao van don GHN' : 'Dong bo GHN'} • {order.code}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-border bg-muted/10 rounded-lg border p-3 text-sm">
            <div className="font-medium">
              {isCreate
                ? 'Operation se tao van don GHN tu shipping address cua order.'
                : 'He thong se dong bo trang thai GHN moi nhat ve don hang nay.'}
            </div>
            <div className="text-foreground/70 mt-1">
              Don vi van chuyen hien tai: GHN - Giao Hang Nhanh
            </div>
          </div>

          {isLoading ? (
            <div className="text-foreground/70 text-sm">
              Dang tai thong tin GHN...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Trang thai don hang</Label>
                  <div className="text-sm font-semibold">
                    {shippingInfo?.orderStatus || order.rawStatus || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Phuong thuc van chuyen</Label>
                  <div className="text-sm font-semibold">
                    {shippingInfo?.shippingMethod || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Ma van don GHN</Label>
                  <div className="font-mono text-sm">
                    {shipment?.orderCode || shipment?.trackingCode || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Trang thai GHN</Label>
                  <div className="text-sm font-semibold">
                    {shippingStatusMeta?.labelKey
                      ? tc(`shippingStatus.${shippingStatusMeta.labelKey}` as any)
                      : (shippingStatusMeta?.label || '-')}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Dich vu</Label>
                  <div className="text-sm font-semibold">
                    {shipment?.serviceName || 'GHN'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Leadtime</Label>
                  <div className="text-sm font-semibold">
                    {formatDateTime(shipment?.leadtime)}
                  </div>
                </div>
              </div>

              {shipment?.latestFailReason && (
                <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-3 text-sm">
                  <div className="text-destructive font-medium">
                    Ly do loi GHN
                  </div>
                  <div className="mt-1">{shipment.latestFailReason}</div>
                </div>
              )}

              {shippingInfo?.testMode &&
                Boolean(shippingInfo.permissions.update_test_status) &&
                shippingInfo.testStatusOptions.length > 0 && (
                  <div className="border-border bg-muted/10 rounded-lg border p-3 text-sm">
                    <div className="font-medium">
                      Cap nhat trang thai GHN theo thu tu (test mode)
                    </div>
                    <div className="text-foreground/70 mt-1">
                      Chi cho phep chuyen sang buoc tiep theo hop le.
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
            Dong
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || isLoading || isSubmitting}
          >
            {isSubmitting
              ? 'Dang xu ly...'
              : isCreate
                ? 'Tao van don GHN'
                : 'Dong bo GHN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
