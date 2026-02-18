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
import { Phone, FileText } from 'lucide-react';
import { RefundRequest } from '@/types/refund';

interface RefundContactModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RefundContactModal = ({
  refund,
  open,
  onOpenChange,
}: RefundContactModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Liên hệ khách hàng
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Liên hệ với khách hàng về yêu cầu hoàn tiền {refund?.id}
          </DialogDescription>
        </DialogHeader>
        {refund && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="font-medium">{refund.customerName}</p>
              <p className="text-foreground/70">{refund.customerPhone}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col">
                <Phone className="mb-2 h-5 w-5" />
                Gọi điện
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="mb-2 h-5 w-5" />
                Gửi Zalo
              </Button>
            </div>
            <div>
              <Label className="text-foreground/80">Ghi chú liên hệ</Label>
              <Textarea
                placeholder="Nhập nội dung trao đổi với khách hàng..."
                className="mt-1"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={() => onOpenChange(false)}>Lưu ghi chú</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
