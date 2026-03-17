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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ReadyStockHoldReason } from '@/types/readyStockOps';
import { useEffect, useState } from 'react';

const HOLD_REASON_LABEL: Record<ReadyStockHoldReason, string> = {
  payment: 'Tạm dừng do thanh toán',
  address: 'Tạm dừng do địa chỉ',
  stock: 'Tạm dừng do thiếu hàng/lỗi hàng',
  manual: 'Tạm dừng thủ công',
  other: 'Khác',
};

export function ReadyStockHoldModal({
  open,
  onOpenChange,
  order,
  initialReason,
  initialNote,
  onSubmit,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRecord | null;
  initialReason: ReadyStockHoldReason | null;
  initialNote: string;
  onSubmit: (reason: ReadyStockHoldReason, note: string) => void;
  onClear: () => void;
}) {
  const [reason, setReason] = useState<ReadyStockHoldReason>('manual');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setReason(initialReason || 'manual');
    setNote(initialNote || '');
  }, [initialNote, initialReason, open]);

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground w-[92vw] max-w-[640px] p-4 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Tạm dừng đơn {order.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Lý do tạm dừng</Label>
            <Select
              value={reason}
              onValueChange={(value) =>
                setReason(value as ReadyStockHoldReason)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn lý do" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(HOLD_REASON_LABEL) as ReadyStockHoldReason[]).map(
                  (k) => (
                    <SelectItem key={k} value={k}>
                      {HOLD_REASON_LABEL[k]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Ghi chú tạm dừng</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả lý do tạm dừng + việc cần Sales/Support hỗ trợ (nếu có)..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClear}>
            Gỡ tạm dừng
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            onClick={() => {
              onSubmit(reason, note);
              onOpenChange(false);
            }}
            disabled={!note.trim()}
          >
            Lưu tạm dừng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
