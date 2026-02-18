import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { PreorderOrder } from '@/types/preorder';

interface ContactModalProps {
  order: PreorderOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactNote: string;
  onContactNoteChange: (note: string) => void;
  onConfirm: () => void;
}

export const PreorderContactModal = ({
  order,
  open,
  onOpenChange,
  contactNote,
  onContactNoteChange,
  onConfirm,
}: ContactModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
      <DialogHeader>
        <DialogTitle className="text-foreground text-base font-semibold">
          Liên hệ khách hàng
        </DialogTitle>
        <DialogDescription className="text-foreground/70">
          Ghi chú liên hệ cho đơn {order?.orderCode}
        </DialogDescription>
      </DialogHeader>
      {order && (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="font-medium">{order.customerName}</p>
            <p className="text-foreground/70 text-sm">
              {order.customerPhone}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Ghi chú liên hệ
            </label>
            <Textarea
              placeholder="Nhập nội dung đã trao đổi với khách..."
              value={contactNote}
              onChange={(e) => onContactNoteChange(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button onClick={onConfirm}>Lưu ghi chú</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
