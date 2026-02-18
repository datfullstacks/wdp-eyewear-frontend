import {
  SupplementOrder,
  ContactType,
  ContactHistory,
} from '@/types/prescription';
import { contactTemplates } from '@/data/prescriptionData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContactTypeIcon } from '@/components/atoms/ContactTypeIcon';
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
import { Send } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: SupplementOrder | null;
  onSend: (contact: Omit<ContactHistory, 'id'>) => void;
}

export const ContactModal = ({
  open,
  onOpenChange,
  order,
  onSend,
}: ContactModalProps) => {
  const [contactType, setContactType] = useState<ContactType>('sms');
  const [contactContent, setContactContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    if (open) {
      setContactType('sms');
      setContactContent('');
      setSelectedTemplate('');
    }
  }, [open]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const templates = contactTemplates[contactType] || [];
    const template = templates.find((t) => t.id === templateId);
    if (template && order) {
      let content = template.content
        .replace('{customer}', order.customer)
        .replace('{orderId}', order.orderId);

      if (content.includes('{missingFields}')) {
        const fields = order.missingFields
          .map(
            (f) =>
              `- ${f.label}${f.eye ? ` (${f.eye === 'OD' ? 'Mắt phải' : f.eye === 'OS' ? 'Mắt trái' : 'Cả 2 mắt'})` : ''}`
          )
          .join('\n');
        content = content.replace('{missingFields}', fields);
      }

      setContactContent(content);
    }
  };

  const handleSend = () => {
    if (!order || !contactContent) return;

    onSend({
      type: contactType,
      date: new Date().toLocaleString('vi-VN'),
      content: contactContent,
      status: 'sent',
      staff: 'Nhân viên hiện tại',
    });
    onOpenChange(false);
  };

  const contactTypes: ContactType[] = ['sms', 'email', 'phone', 'zalo'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Liên hệ khách hàng
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {order?.customer} - {order?.orderId}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Contact Type */}
          <div className="space-y-2">
            <Label className="text-foreground/80">Hình thức liên hệ</Label>
            <div className="flex gap-2">
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
                >
                  <ContactTypeIcon type={type} />
                  {type.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Template Select */}
          {contactType !== 'phone' &&
            contactTemplates[contactType]?.length > 0 && (
              <div className="space-y-2">
                <Label className="text-foreground/80">Mẫu tin nhắn</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mẫu có sẵn..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTemplates[contactType]?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          {/* Content */}
          <div className="space-y-2">
            <Label className="text-foreground/80">
              {contactType === 'phone' ? 'Ghi chú cuộc gọi' : 'Nội dung'}
            </Label>
            <Textarea
              value={contactContent}
              onChange={(e) => setContactContent(e.target.value)}
              placeholder={
                contactType === 'phone'
                  ? 'Ghi chú kết quả cuộc gọi...'
                  : 'Nhập nội dung tin nhắn...'
              }
              rows={5}
            />
          </div>

          {/* Customer Contact Info */}
          <div className="bg-muted/30 space-y-1 rounded-lg p-3 text-sm">
            <p>
              <strong>SĐT:</strong> {order?.phone}
            </p>
            <p>
              <strong>Email:</strong> {order?.email}
            </p>
            {order?.zalo && (
              <p>
                <strong>Zalo:</strong> {order.zalo}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSend} disabled={!contactContent}>
            <Send className="mr-2 h-4 w-4" />
            {contactType === 'phone' ? 'Lưu ghi chú' : 'Gửi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
