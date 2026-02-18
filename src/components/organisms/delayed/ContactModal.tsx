import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
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
import { DelayedOrder, ContactMethod } from '@/types/delayed';
import { Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/atoms';

interface ContactModalProps {
  order: DelayedOrder | null;
  onClose: () => void;
  onSubmit: (orderId: string, method: ContactMethod, note: string) => void;
}

export const ContactModal = ({
  order,
  onClose,
  onSubmit,
}: ContactModalProps) => {
  const [method, setMethod] = useState<ContactMethod>('phone');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (order) {
      onSubmit(order.id, method, note);
      setMethod('phone');
      setNote('');
      onClose();
    }
  };

  const handleClose = () => {
    setMethod('phone');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <Phone className="text-primary h-5 w-5" />
            Liên hệ khách hàng - {order?.id}
          </DialogTitle>
        </DialogHeader>
        {order && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-foreground text-base font-semibold">
                {order.customerName}
              </p>
              <p className="text-foreground text-sm font-medium">
                {order.customerPhone}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <label className="text-foreground/70 text-sm font-medium">
                Hình thức liên hệ
              </label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as ContactMethod)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">
                    <div className="text-foreground flex items-center gap-2 font-medium">
                      <Phone className="h-4 w-4" />
                      Gọi điện
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="text-foreground flex items-center gap-2 font-medium">
                      <MessageSquare className="h-4 w-4" />
                      SMS/Zalo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <label className="text-foreground text-sm font-semibold">
                Nội dung/Ghi chú
              </label>
              <Textarea
                placeholder="Ghi chú nội dung cuộc gọi hoặc tin nhắn..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-2 bg-background text-foreground placeholder:text-muted-foreground"
                rows={3}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="text-foreground font-medium"
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit}>
            <Phone className="mr-2 h-4 w-4" />
            Ghi nhận liên hệ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
