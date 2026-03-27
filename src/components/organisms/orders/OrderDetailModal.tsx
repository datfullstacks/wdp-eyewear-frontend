import type { OrderRecord } from '@/api/orders';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { OrderDetailContent } from './OrderDetailContent';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-h-[72vh] max-w-[640px] overflow-y-auto p-4 text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn {order.code}</DialogTitle>
        </DialogHeader>

        <OrderDetailContent order={order} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
