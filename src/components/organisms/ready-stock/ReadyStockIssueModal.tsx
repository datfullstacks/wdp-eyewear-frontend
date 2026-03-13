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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ReadyStockIssueType } from '@/types/readyStockOps';
import { useEffect, useMemo, useState } from 'react';

const ISSUE_LABELS: Record<ReadyStockIssueType, string> = {
  out_of_stock: 'Thiếu hàng / sai tồn kho',
  wrong_sku: 'Sai SKU / sai số lượng',
  damaged_item: 'Hàng lỗi trước khi đóng gói',
  address_issue: 'Sai địa chỉ / thiếu thông tin giao',
  shipping_label_error: 'Sai vận đơn / sai thông tin vận chuyển',
  other: 'Khác',
};

export function ReadyStockIssueModal({
  open,
  onOpenChange,
  order,
  initialType,
  initialNote,
  onSubmit,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRecord | null;
  initialType: ReadyStockIssueType | null;
  initialNote: string;
  onSubmit: (type: ReadyStockIssueType, note: string) => void;
  onClear: () => void;
}) {
  const [type, setType] = useState<ReadyStockIssueType>('out_of_stock');
  const [note, setNote] = useState('');

  const resolvedTitle = useMemo(() => (order ? `Ngoại lệ đơn ${order.code}` : 'Ngoại lệ'), [order]);

  useEffect(() => {
    if (!open) return;
    setType(initialType || 'out_of_stock');
    setNote(initialNote || '');
  }, [initialNote, initialType, open]);

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[640px] p-4 text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle>{resolvedTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Loại ngoại lệ</Label>
            <Select value={type} onValueChange={(value) => setType(value as ReadyStockIssueType)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ISSUE_LABELS) as ReadyStockIssueType[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {ISSUE_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Ghi chú nội bộ</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả vấn đề + hướng xử lý (đẩy ngược Sales/Support nếu cần tương tác khách)..."
              rows={5}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClear}>
            Gỡ ngoại lệ
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            onClick={() => {
              onSubmit(type, note);
              onOpenChange(false);
            }}
            disabled={!note.trim()}
          >
            Lưu & chặn xử lý
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
