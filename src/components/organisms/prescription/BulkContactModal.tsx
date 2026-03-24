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
            Lien he hang loat
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Gui tin nhan den {selectedCount} khach hang da chon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground/80">Hinh thuc</Label>
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
            <Label className="text-foreground/80">Mau tin nhan</Label>
            <Select value={template} onValueChange={setTemplate} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Chon mau..." />
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
            The selected template will be sent through live support tickets instead of a local-only
            queue.
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Huy
          </Button>
          <Button onClick={handleSend} disabled={!template || isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Dang gui...' : 'Gui tat ca'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
