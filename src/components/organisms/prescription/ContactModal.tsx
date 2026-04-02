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
      <DialogContent className="max-w-xl border-slate-200 bg-white">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-950">
            <span>Liên hệ khách hàng</span>
            {order?.orderId ? (
              <span className="inline-flex rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 font-mono text-sm font-semibold tracking-wide text-amber-950 shadow-sm">
                {order.orderId}
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-700">
            {order?.customer}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Hình thức liên hệ
            </Label>
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
                  className={
                    contactType === type
                      ? 'gap-2 border border-amber-400 bg-amber-400 font-semibold text-slate-950 shadow-sm hover:bg-amber-500'
                      : 'gap-2 border-slate-300 bg-white font-medium text-slate-900 hover:border-slate-400 hover:bg-slate-50'
                  }
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
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Mẫu tin nhắn
                </Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateSelect}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="border-slate-300 bg-white text-slate-900 shadow-sm focus:ring-slate-400">
                    <SelectValue placeholder="Chọn mẫu có sẵn..." />
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

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {contactType === 'phone' ? 'Ghi chú cuộc gọi' : 'Nội dung'}
            </Label>
            <Textarea
              value={contactContent}
              onChange={(event) => setContactContent(event.target.value)}
              placeholder={
                contactType === 'phone'
                  ? 'Nhập ghi chú cuộc gọi...'
                  : 'Nhập nội dung tin nhắn...'
              }
              rows={5}
              disabled={isSubmitting}
              className="border-slate-300 bg-white text-sm font-medium text-slate-950 placeholder:text-slate-400 focus-visible:ring-slate-400"
            />
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm shadow-sm">
            <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Thông tin liên hệ
            </Label>
            <p className="font-medium text-slate-900">
              <strong>SDT:</strong> {order?.phone || '-'}
            </p>
            <p className="font-medium text-slate-900">
              <strong>Email:</strong> {order?.email || '-'}
            </p>
            {order?.zalo ? (
              <p className="font-medium text-slate-900">
                <strong>Zalo:</strong> {order.zalo}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-slate-300 bg-white font-medium text-slate-900 hover:border-slate-400 hover:bg-slate-50"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSubmitting || !contactContent.trim()}
            className="font-semibold"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting
              ? 'Đang gửi...'
              : contactType === 'phone'
                ? 'Lưu ghi chú'
                : 'Gửi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
