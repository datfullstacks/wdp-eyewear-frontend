import { SupplementOrder } from '@/types/prescription';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Glasses, User, Phone, Mail, AlertTriangle, Send } from 'lucide-react';

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

export const OrderDetailModal = ({
  open,
  onOpenChange,
  order,
  onContact,
}: OrderDetailModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[92vw] max-h-[80vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <Glasses className="h-5 w-5" />
            Chi tiết đơn cần bổ sung - {order.orderId}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Customer Info */}
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

          {/* Order Info */}
          <div className="space-y-2">
            <Label className="text-foreground/80">Sản phẩm</Label>
            <div className="bg-muted/30 rounded-lg p-3">
              {order.products.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <span className="text-foreground/70">
                    {p.frame} x{p.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Info */}
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
                {order.missingFields.map((field, idx) => (
                  <li key={idx}>
                    {field.label}
                    {field.eye && (
                      <span className="text-foreground/70 ml-1">
                        (
                        {field.eye === 'OD'
                          ? 'Mắt phải'
                          : field.eye === 'OS'
                            ? 'Mắt trái'
                            : 'Cả 2 mắt'}
                        )
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prescription Image */}
          {order.prescriptionImage && (
            <div className="space-y-2">
              <Label className="text-foreground/80">
                Ảnh đơn thuốc đã gửi
              </Label>
              <div className="bg-muted/30 flex items-center justify-center rounded-lg p-4">
                <img
                  src={order.prescriptionImage}
                  alt="Prescription"
                  className="max-h-40 object-contain"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="space-y-2">
              <Label className="text-foreground/80">Ghi chú</Label>
              <p className="bg-muted/30 rounded-lg p-3 text-sm">
                {order.notes}
              </p>
            </div>
          )}

          {/* Contact Summary */}
          <div className="space-y-2">
            <Label className="text-foreground/80">Lịch sử liên hệ</Label>
            <div className="flex items-center gap-4 text-sm">
              <span>
                Đã liên hệ: <strong>{order.contactAttempts} lần</strong>
              </span>
              {order.lastContactDate && (
                <span>
                  Lần cuối: <strong>{order.lastContactDate}</strong>
                </span>
              )}
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
