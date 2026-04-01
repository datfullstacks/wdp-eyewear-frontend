import { AlertTriangle, Glasses, Mail, Phone, Send, User } from 'lucide-react';

import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getPrescriptionFollowUpMeta } from '@/lib/prescriptionFollowUp';
import type { SupplementOrder } from '@/types/prescription';

interface OrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: SupplementOrder | null;
  onContact: () => void;
}

const getMissingTypeBadge = (type: SupplementOrder['missingType']) => {
  switch (type) {
    case 'no_prescription':
      return <StatusBadge status="error">Chưa có Rx</StatusBadge>;
    case 'incomplete_data':
      return <StatusBadge status="warning">Thiếu dữ liệu</StatusBadge>;
    case 'unclear_image':
      return <StatusBadge status="warning">Ảnh không rõ</StatusBadge>;
    case 'need_verification':
      return <StatusBadge status="info">Cần xác nhận</StatusBadge>;
  }
};

function formatFollowUpDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('vi-VN');
}

export const OrderDetailModal = ({
  open,
  onOpenChange,
  order,
  onContact,
}: OrderDetailModalProps) => {
  if (!order) return null;

  const followUpMeta = getPrescriptionFollowUpMeta(order.followUpStatus);
  const followUpUpdatedAt = formatFollowUpDate(order.followUpUpdatedAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] w-[92vw] max-w-lg overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <Glasses className="h-5 w-5" />
            Chi tiết đơn cần bổ sung - {order.orderId}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Khách hàng</Label>
              <div className="flex items-center gap-2">
                <User className="text-foreground/80 h-4 w-4" />
                <span className="font-medium">{order.customer}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Liên hệ</Label>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="text-foreground/80 h-4 w-4" />
                  <span>{order.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="text-foreground/80 h-4 w-4" />
                  <span>{order.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80">Sản phẩm</Label>
            <div className="bg-muted/30 rounded-lg p-3">
              {order.products.map((product, index) => (
                <div
                  key={`${product.sku}-${index}`}
                  className="flex items-center justify-between"
                >
                  <span>{product.name}</span>
                  <span className="text-foreground/70">
                    {product.frame} x{product.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80">
              Trạng thái theo dõi sale
            </Label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={followUpMeta.badge}>
                  {followUpMeta.label}
                </StatusBadge>
                {order.followUpUpdatedBy ? (
                  <span className="text-foreground/70 text-xs">
                    Bởi: {order.followUpUpdatedBy}
                  </span>
                ) : null}
                {followUpUpdatedAt ? (
                  <span className="text-foreground/70 text-xs">
                    Lúc: {followUpUpdatedAt}
                  </span>
                ) : null}
              </div>
              {order.followUpNote ? (
                <p className="text-foreground/80 mt-2 text-sm">
                  {order.followUpNote}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80 flex items-center gap-2">
              <AlertTriangle className="text-warning h-4 w-4" />
              Thông tin thiếu
            </Label>
            <div className="bg-warning/10 border-warning/20 rounded-lg border p-3">
              <div className="mb-2 flex items-center gap-2">
                {getMissingTypeBadge(order.missingType)}
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {order.missingFields.map((field, index) => (
                  <li key={`${field.field}-${field.eye || 'none'}-${index}`}>
                    {field.label}
                    {field.eye ? (
                      <span className="text-foreground/70 ml-1">
                        (
                        {field.eye === 'OD'
                          ? 'Mắt phải'
                          : field.eye === 'OS'
                            ? 'Mắt trái'
                            : 'Cả 2 mắt'}
                        )
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {order.prescriptionImage ? (
            <div className="space-y-2">
              <Label className="text-foreground/80">Ảnh đơn thuốc đã gửi</Label>
              <div className="bg-muted/30 flex items-center justify-center rounded-lg p-4">
                <img
                  src={order.prescriptionImage}
                  alt="Prescription"
                  className="max-h-40 object-contain"
                />
              </div>
            </div>
          ) : null}

          {order.notes ? (
            <div className="space-y-2">
              <Label className="text-foreground/80">Ghi chú</Label>
              <p className="bg-muted/30 rounded-lg p-3 text-sm">
                {order.notes}
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label className="text-foreground/80">Lịch sử liên hệ</Label>
            <div className="flex items-center gap-4 text-sm">
              <span>
                Đã liên hệ: <strong>{order.contactAttempts} lần</strong>
              </span>
              {order.lastContactDate ? (
                <span>
                  Lần cuối: <strong>{order.lastContactDate}</strong>
                </span>
              ) : null}
              <span>
                Chờ:{' '}
                <strong
                  className={order.daysPending >= 3 ? 'text-destructive' : ''}
                >
                  {order.daysPending} ngày
                </strong>
              </span>
            </div>
          </div>
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
            Liên hệ khách
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
