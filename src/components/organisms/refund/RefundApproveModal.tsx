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
import { CheckCircle } from 'lucide-react';
import { RefundRequest, methodConfig, formatCurrency } from '@/types/refund';

interface RefundApproveModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RefundApproveModal = ({
  refund,
  open,
  onOpenChange,
}: RefundApproveModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Duyệt yêu cầu hoàn tiền
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Xác nhận duyệt yêu cầu hoàn tiền {refund?.id}
          </DialogDescription>
        </DialogHeader>
        {refund && (
          <div className="space-y-4">
            <div className="bg-success/10 border-success/20 rounded-lg border p-3">
              <div className="text-success mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Xác nhận duyệt hoàn tiền</span>
              </div>
              <p className="text-foreground/80 text-sm">
                Số tiền:{' '}
                <span className="text-foreground font-bold">
                  {formatCurrency(refund.amount)}
                </span>
              </p>
              <p className="text-foreground/80 text-sm">
                Phương thức: {methodConfig[refund.method].label}
              </p>
            </div>
            <div>
              <Label className="text-foreground/80">
                Ghi chú (tùy chọn)
              </Label>
              <Textarea placeholder="Nhập ghi chú nếu có..." className="mt-1" />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-success hover:bg-success/90"
            onClick={() => onOpenChange(false)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Duyệt yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
