import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { ContactType } from '@/types/prescription';
import { contactTemplates } from '@/data/prescriptionData';
import { Send } from 'lucide-react';

interface BulkContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onSend: (contactType: ContactType, templateId: string) => void;
}

export function BulkContactModal({
  open,
  onOpenChange,
  selectedCount,
  onSend,
}: BulkContactModalProps) {
  const [contactType, setContactType] = useState<ContactType>('sms');
  const [template, setTemplate] = useState('');

  const handleSend = () => {
    onSend(contactType, template);
    setTemplate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Liên hệ hàng loạt
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Gửi tin nhắn đến {selectedCount} khách hàng đã chọn
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground/80">Hình thức</Label>
            <Select
              value={contactType}
              onValueChange={(v) => setContactType(v as ContactType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="zalo">Zalo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/80">Mẫu tin nhắn</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn mẫu..." />
              </SelectTrigger>
              <SelectContent>
                {contactTemplates[contactType]?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-foreground/80 text-sm">
              Tin nhắn sẽ được gửi với nội dung mẫu, tự động điền tên khách và
              mã đơn hàng tương ứng.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSend} disabled={!template}>
            <Send className="mr-2 h-4 w-4" />
            Gửi tất cả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
