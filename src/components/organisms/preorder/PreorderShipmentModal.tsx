'use client';

import { useEffect, useState } from 'react';

import type { PreorderOrder } from '@/types/preorder';
import { carriers } from '@/types/fulfillment';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function PreorderShipmentModal({
  open,
  onOpenChange,
  order,
  mode,
  initialCarrierId,
  initialTrackingCode,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PreorderOrder | null;
  mode: 'create' | 'update';
  initialCarrierId: string;
  initialTrackingCode: string;
  onSubmit: (carrierId: string, trackingCode: string) => void;
}) {
  const [carrierId, setCarrierId] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    if (!open) return;

    setCarrierId(initialCarrierId || '');
    setTrackingCode(initialTrackingCode || '');
  }, [initialCarrierId, initialTrackingCode, open]);

  if (!order) return null;

  const isUpdate = mode === 'update';
  const canSubmit = Boolean(carrierId && trackingCode.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground w-[92vw] max-w-[560px] p-4 shadow-2xl">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? 'Cập nhật tracking' : 'Tạo vận đơn'} • {order.orderCode}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Đơn vị vận chuyển</Label>
            <Select value={carrierId} onValueChange={setCarrierId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn đơn vị vận chuyển" />
              </SelectTrigger>
              <SelectContent>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Mã tracking</Label>
            <Input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="VD: GHN123456789"
            />
          </div>

          {isUpdate && initialTrackingCode && (
            <div className="text-foreground/70 text-xs">
              Tracking hiện tại:{' '}
              <span className="font-mono">{initialTrackingCode}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            onClick={() => {
              onSubmit(carrierId, trackingCode.trim());
              onOpenChange(false);
            }}
            disabled={!canSubmit}
          >
            {isUpdate ? 'Lưu tracking' : 'Lưu vận đơn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
