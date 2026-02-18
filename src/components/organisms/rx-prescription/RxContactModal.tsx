import { PrescriptionOrder } from '@/types/rxPrescription';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Send } from 'lucide-react';

interface RxContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PrescriptionOrder | null;
  contactNote: string;
  onContactNoteChange: (note: string) => void;
  onSend: () => void;
}

export const RxContactModal = ({
  open,
  onOpenChange,
  order,
  contactNote,
  onContactNoteChange,
  onSend,
}: RxContactModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Liên hệ khách hàng
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Gửi thông báo yêu cầu bổ sung thông số mắt
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/30 space-y-2 rounded-lg p-3">
            <p className="font-medium">{order.customer}</p>
            <p className="text-foreground/70 text-sm">
              {order.phone} • {order.email}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/80">Nội dung tin nhắn</Label>
            <Textarea
              value={contactNote}
              onChange={(e) => onContactNoteChange(e.target.value)}
              placeholder="Xin chào, chúng tôi cần thông số mắt của bạn để gia công tròng kính..."
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Checkbox id="sms" defaultChecked />
            <Label htmlFor="sms">Gửi SMS</Label>
            <Checkbox id="email" defaultChecked />
            <Label htmlFor="email">Gửi Email</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onSend}>
            <Send className="mr-2 h-4 w-4" />
            Gửi thông báo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
