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
      <DialogContent className="max-h-[80vh] w-[92vw] max-w-lg overflow-y-auto border-slate-200 bg-white p-4 sm:p-5">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-950">
            <Glasses className="h-5 w-5 text-amber-700" />
            <span>Chi tiết đơn cần bổ sung</span>
            <span className="inline-flex rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 font-mono text-sm font-semibold tracking-wide text-amber-950 shadow-sm">
              {order.orderId}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Khách hàng
              </Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-950">
                  {order.customer}
                </span>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Liên hệ
              </Label>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">
                    {order.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">
                    {order.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Sản phẩm
            </Label>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {order.products.map((product, index) => (
                <div
                  key={`${product.sku}-${index}`}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm font-medium text-slate-950">
                    {product.name}
                  </span>
                  <span className="text-sm font-medium text-slate-600">
                    {product.frame} x{product.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Trạng thái theo dõi sale
            </Label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={followUpMeta.badge}>
                  {followUpMeta.label}
                </StatusBadge>
                {order.followUpUpdatedBy ? (
                  <span className="text-xs font-medium text-slate-700">
                    Bởi: {order.followUpUpdatedBy}
                  </span>
                ) : null}
                {followUpUpdatedAt ? (
                  <span className="text-xs font-medium text-slate-700">
                    Lúc: {followUpUpdatedAt}
                  </span>
                ) : null}
              </div>
              {order.followUpNote ? (
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {order.followUpNote}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Thông tin thiếu
            </Label>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                {getMissingTypeBadge(order.missingType)}
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm font-medium text-slate-900">
                {order.missingFields.map((field, index) => (
                  <li key={`${field.field}-${field.eye || 'none'}-${index}`}>
                    {field.label}
                    {field.eye ? (
                      <span className="ml-1 text-slate-600">
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
              <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Ảnh đơn thuốc đã gửi
              </Label>
              <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
              <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Ghi chú
              </Label>
              <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-900 shadow-sm">
                {order.notes}
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Lịch sử liên hệ
            </Label>
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-sm">
              <span className="font-medium">
                Đã liên hệ: <strong>{order.contactAttempts} lần</strong>
              </span>
              {order.lastContactDate ? (
                <span className="font-medium">
                  Lần cuối: <strong>{order.lastContactDate}</strong>
                </span>
              ) : null}
              <span className="font-medium">
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
            className="font-semibold"
          >
            <Send className="mr-2 h-4 w-4" />
            Liên hệ khách
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
