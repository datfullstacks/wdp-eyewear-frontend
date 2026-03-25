import { useEffect, useState } from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefundRequest, formatCurrency } from '@/types/refund';

interface RefundRejectModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    rejectReason: string;
    note: string;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
  scope?: 'sale' | 'manager';
}

export const RefundRejectModal = ({
  refund,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  scope = 'sale',
}: RefundRejectModalProps) => {
  const [rejectReason, setRejectReason] = useState('');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (!open) {
      setRejectReason('');
      setDetail('');
    }
  }, [open]);

  const title =
    scope === 'manager'
      ? 'Manager từ chối refund'
      : 'Từ chối yêu cầu hoàn tiền';
  const description =
    scope === 'manager'
      ? `Từ chối case ${refund?.id || ''}`
      : `Từ chối yêu cầu hoàn tiền ${refund?.id || ''}`;

  const handleSubmit = async () => {
    const parts = [rejectReason, detail.trim()].filter(Boolean);
    if (parts.length === 0) return;

    await onSubmit({
      rejectReason: parts.join(': '),
      note: detail.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-md p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Xác nhận từ chối hoàn tiền</span>
            </div>
            <p className="text-sm text-slate-700">
              Số tiền: {refund && formatCurrency(refund.amount)}
            </p>
          </div>

          <div>
            <Label className="text-foreground/80">Lý do từ chối *</Label>
            <Select value={rejectReason} onValueChange={setRejectReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn lý do từ chối" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expired">Quá thời hạn hoàn tiền</SelectItem>
                <SelectItem value="used">Sản phẩm đã qua sử dụng</SelectItem>
                <SelectItem value="damaged">
                  Sản phẩm bị hư hỏng do khách hàng
                </SelectItem>
                <SelectItem value="invalid">Yêu cầu không hợp lệ</SelectItem>
                <SelectItem value="other">Lý do khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-foreground/80">Chi tiết lý do</Label>
            <Textarea
              placeholder="Nhập chi tiết lý do từ chối..."
              className="mt-1"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !rejectReason}
          >
            <XCircle className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Đang xử lý...' : 'Từ chối'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
