'use client';

import type { OrderRecord } from '@/api/orders';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toShortLocation } from '@/lib/readyStockOps';

export function ReadyStockPickListModal({
  open,
  onOpenChange,
  order,
  onPrint,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRecord | null;
  onPrint: () => void;
}) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[720px] max-h-[78vh] overflow-y-auto p-4 text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle>Pick list • {order.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-foreground/80 text-sm">
            <div>
              <span className="text-foreground/60">Người nhận:</span> {order.customerName} •{' '}
              {order.customerPhone || '-'}
            </div>
            <div>
              <span className="text-foreground/60">Khu vực:</span> {toShortLocation(order.customerAddress)}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={item.id || `${order.id}-${idx}`} className="border-border rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-foreground font-semibold truncate">{item.name}</div>
                    <div className="text-foreground/70 text-xs">
                      Type: {item.type || 'other'} • Variant: {item.variant} • SL: {item.quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={onPrint}>In pick list</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

