import { useState } from 'react';
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
import { AlertCircle, XCircle } from 'lucide-react';
import { RefundRequest, formatCurrency } from '@/types/refund';

interface RefundRejectModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RefundRejectModal = ({
  refund,
  open,
  onOpenChange,
}: RefundRejectModalProps) => {
  const [rejectReason, setRejectReason] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Từ chối yêu cầu hoàn tiền
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Từ chối yêu cầu hoàn tiền {refund?.id}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-3">
            <div className="text-destructive mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Xác nhận từ chối hoàn tiền</span>
            </div>
            <p className="text-foreground/80 text-sm">
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={() => onOpenChange(false)}>
            <XCircle className="mr-2 h-4 w-4" />
            Từ chối
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
