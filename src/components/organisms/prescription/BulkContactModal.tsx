import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { contactTemplates } from '@/data/prescriptionData';
import type { ContactType } from '@/types/prescription';

interface BulkContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onSend: (contactType: ContactType, templateId: string) => void;
  isSubmitting?: boolean;
}

export function BulkContactModal({
  open,
  onOpenChange,
  selectedCount,
  onSend,
  isSubmitting = false,
}: BulkContactModalProps) {
  const [contactType, setContactType] = useState<ContactType>('sms');
  const [template, setTemplate] = useState('');

  useEffect(() => {
    if (!open) return;
    setContactType('sms');
    setTemplate('');
  }, [open]);

  const handleSend = () => {
    if (!template) return;
    onSend(contactType, template);
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
              onValueChange={(value) => setContactType(value as ContactType)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="zalo">Zalo</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80">Mẫu tin nhắn</Label>
            <Select
              value={template}
              onValueChange={setTemplate}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn mẫu..." />
              </SelectTrigger>
              <SelectContent>
                {(contactTemplates[contactType] || []).map((entry) => (
                  <SelectItem key={entry.id} value={entry.id}>
                    {entry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/30 rounded-lg p-3 text-sm text-gray-600">
            Mẫu đã chọn sẽ được gửi thông qua các ticket hỗ trợ trực tiếp thay
            vì hàng đợi nội bộ (chỉ dùng cục bộ).
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
          <Button onClick={handleSend} disabled={!template || isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Đang gửi...' : 'Gửi tất cả'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
