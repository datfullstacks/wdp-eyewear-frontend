import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SeverityBadge } from '@/components/atoms/SeverityBadge';
import { DelayTypeBadge } from '@/components/atoms/DelayTypeBadge';
import { DelayedOrder } from '@/types/delayed';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface DelayedDetailModalProps {
  order: DelayedOrder | null;
  onClose: () => void;
  onResolve: (order: DelayedOrder) => void;
}

export const DelayedDetailModal = ({
  order,
  onClose,
  onResolve,
}: DelayedDetailModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-warning h-5 w-5" />
            Chi tiết cảnh báo - {order.id}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-foreground/70 text-sm font-medium">
                    Khách hàng
                  </label>
                  <p className="text-foreground font-medium">
                    {order.customerName}
                  </p>
                  <p className="text-foreground/80 text-sm">
                    {order.customerPhone}
                  </p>
                </div>
                <div>
                  <label className="text-foreground/70 text-sm font-medium">
                    Ngày đặt
                  </label>
                  <p className="text-foreground font-medium">
                    {order.orderDate}
                  </p>
                </div>
                <div>
                  <label className="text-foreground/70 text-sm font-medium">
                    Loại cảnh báo
                  </label>
                  <div className="mt-1">
                    <DelayTypeBadge delayType={order.delayType} />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-foreground/70 text-sm font-medium">
                    Mức độ
                  </label>
                  <div className="mt-1">
                    <SeverityBadge severity={order.severity} />
                  </div>
                </div>
                <div>
                  <label className="text-foreground/70 text-sm font-medium">
                    Thời gian trễ
                  </label>
                  <p className="text-destructive text-lg font-bold">
                    {order.delayDuration}
                  </p>
                </div>
                <div>
                  <label className="text-foreground/70 text-sm font-medium">
                    Deadline SLA
                  </label>
                  <p className="text-foreground font-medium">
                    {order.slaDeadline}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
            <div>
              <label className="text-foreground/70 text-sm font-medium">
                Trạng thái hiện tại
              </label>
              <p className="text-foreground font-medium">
                {order.currentStatus}
              </p>
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium">
                Người xử lý
              </label>
              <p className="text-foreground font-medium">
                {order.assignedTo}
              </p>
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium">
                Hành động cuối
              </label>
              <p className="text-foreground font-medium">
                {order.lastAction}
              </p>
            </div>
            {order.notes && (
              <div>
                <label className="text-foreground/70 text-sm font-medium">
                  Ghi chú
                </label>
                <p className="text-foreground bg-muted/50 rounded-md p-3">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            onClick={() => {
              onResolve(order);
              onClose();
            }}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Xử lý ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
