import { SupplementOrder } from '@/types/prescription';
import { ContactHistoryItem } from '@/components/molecules/ContactHistoryItem';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { History, Send } from 'lucide-react';

interface ContactHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: SupplementOrder | null;
  onContact: () => void;
}

export const ContactHistoryModal = ({
  open,
  onOpenChange,
  order,
  onContact,
}: ContactHistoryModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <History className="h-5 w-5" />
            Lịch sử liên hệ - {order?.orderId}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {order?.contactHistory.length === 0 ? (
            <p className="text-foreground/80 py-8 text-center">
              Chưa có lịch sử liên hệ
            </p>
          ) : (
            order?.contactHistory.map((contact) => (
              <ContactHistoryItem
                key={contact.id}
                type={contact.type}
                date={contact.date}
                content={contact.content}
                status={contact.status}
                staff={contact.staff}
              />
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onContact();
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Liên hệ thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
