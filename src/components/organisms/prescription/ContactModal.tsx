import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';

import { ContactTypeIcon } from '@/components/atoms/ContactTypeIcon';
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
import { Textarea } from '@/components/ui/textarea';
import { contactTemplates } from '@/data/prescriptionData';
import type {
  ContactHistory,
  ContactType,
  SupplementOrder,
} from '@/types/prescription';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: SupplementOrder | null;
  onSend: (contact: Omit<ContactHistory, 'id'>) => void;
  isSubmitting?: boolean;
}

export const ContactModal = ({
  open,
  onOpenChange,
  order,
  onSend,
  isSubmitting = false,
}: ContactModalProps) => {
  const [contactType, setContactType] = useState<ContactType>('sms');
  const [contactContent, setContactContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    if (!open) return;
    setContactType('sms');
    setContactContent('');
    setSelectedTemplate('');
  }, [open]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const templates = contactTemplates[contactType] || [];
    const template = templates.find((entry) => entry.id === templateId);

    if (!template || !order) return;

    let content = template.content
      .replace('{customer}', order.customer)
      .replace('{orderId}', order.orderId);

    if (content.includes('{missingFields}')) {
      const fields = order.missingFields
        .map((field) => `- ${field.label}`)
        .join('\n');
      content = content.replace('{missingFields}', fields);
    }

    setContactContent(content);
  };

  const handleSend = () => {
    if (!order || !contactContent.trim()) return;

    onSend({
      type: contactType,
      date: new Date().toLocaleString('vi-VN'),
      content: contactContent.trim(),
      status: 'sent',
      staff: 'Staff',
    });
  };

  const contactTypes: ContactType[] = ['sms', 'email', 'phone', 'zalo'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Lien he khach hang
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {order?.customer} - {order?.orderId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground/80">Hinh thuc lien he</Label>
            <div className="flex flex-wrap gap-2">
              {contactTypes.map((type) => (
                <Button
                  key={type}
                  variant={contactType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setContactType(type);
                    setSelectedTemplate('');
                    setContactContent('');
                  }}
                  className="gap-2"
                  disabled={isSubmitting}
                >
                  <ContactTypeIcon type={type} />
                  {type.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {contactType !== 'phone' &&
            Array.isArray(contactTemplates[contactType]) &&
            contactTemplates[contactType].length > 0 && (
              <div className="space-y-2">
                <Label className="text-foreground/80">Mau tin nhan</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateSelect}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chon mau co san..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTemplates[contactType].map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          <div className="space-y-2">
            <Label className="text-foreground/80">
              {contactType === 'phone' ? 'Ghi chu cuoc goi' : 'Noi dung'}
            </Label>
            <Textarea
              value={contactContent}
              onChange={(event) => setContactContent(event.target.value)}
              placeholder={
                contactType === 'phone'
                  ? 'Nhap ghi chu cuoc goi...'
                  : 'Nhap noi dung tin nhan...'
              }
              rows={5}
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-muted/30 space-y-1 rounded-lg p-3 text-sm">
            <p>
              <strong>SDT:</strong> {order?.phone || '-'}
            </p>
            <p>
              <strong>Email:</strong> {order?.email || '-'}
            </p>
            {order?.zalo ? (
              <p>
                <strong>Zalo:</strong> {order.zalo}
              </p>
            ) : null}
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
          <Button
            onClick={handleSend}
            disabled={isSubmitting || !contactContent.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Dang gui...' : contactType === 'phone' ? 'Luu ghi chu' : 'Gui'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
