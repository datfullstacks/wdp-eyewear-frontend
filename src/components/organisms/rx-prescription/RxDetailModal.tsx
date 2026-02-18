import { PrescriptionOrder } from '@/types/rxPrescription';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Glasses, User, Phone, MapPin, FileText } from 'lucide-react';

interface RxDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PrescriptionOrder | null;
  onInputPrescription: (order: PrescriptionOrder) => void;
}

export const RxDetailModal = ({
  open,
  onOpenChange,
  order,
  onInputPrescription,
}: RxDetailModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[92vw] max-h-[80vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Chi tiết đơn hàng {order.orderId}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Thông tin đơn hàng và thông số mắt
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground/80">Khách hàng</Label>
              <div className="flex items-center gap-2">
                <User className="text-foreground/70 h-4 w-4" />
                <span className="font-medium">{order.customer}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Số điện thoại</Label>
              <div className="flex items-center gap-2">
                <Phone className="text-foreground/70 h-4 w-4" />
                <span>{order.phone}</span>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-foreground/80">Địa chỉ</Label>
              <div className="flex items-center gap-2">
                <MapPin className="text-foreground/70 h-4 w-4" />
                <span>{order.address}</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-2">
            <Label className="text-foreground/80">Sản phẩm</Label>
            <div className="bg-muted/30 space-y-2 rounded-lg p-3">
              {order.products.map((p, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {p.name} - {p.frame}
                  </span>
                  <span className="text-foreground/70">SKU: {p.sku}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prescription Data */}
          {order.prescription ? (
            <div className="space-y-4">
              <Label className="text-foreground/80">Thông số mắt (Rx)</Label>
              <div className="bg-muted/30 space-y-4 rounded-lg p-3">
                <div className="grid grid-cols-4 gap-4 text-center text-sm">
                  <div className="font-medium"></div>
                  <div className="font-medium">SPH</div>
                  <div className="font-medium">CYL</div>
                  <div className="font-medium">AXIS</div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="text-right font-medium">Mắt phải (OD)</div>
                  <div>{order.prescription.sphereRight || '-'}</div>
                  <div>{order.prescription.cylinderRight || '-'}</div>
                  <div>{order.prescription.axisRight || '-'}</div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="text-right font-medium">Mắt trái (OS)</div>
                  <div>{order.prescription.sphereLeft || '-'}</div>
                  <div>{order.prescription.cylinderLeft || '-'}</div>
                  <div>{order.prescription.axisLeft || '-'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-2">
                  <div>
                    <span className="text-foreground/70">PD: </span>
                    <span className="font-medium">
                      {order.prescription.pd}mm
                    </span>
                  </div>
                  {order.prescription.addRight && (
                    <div>
                      <span className="text-foreground/70">ADD: </span>
                      <span className="font-medium">
                        {order.prescription.addRight}
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-2">
                  <div>
                    <span className="text-foreground/70">Loại tròng: </span>
                    <span className="font-medium">
                      {order.prescription.lensType}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground/70">Lớp phủ: </span>
                    <span className="font-medium">
                      {order.prescription.coating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Glasses className="text-foreground/70 mx-auto h-8 w-8" />
              <p className="text-foreground/70 mt-2">Chưa có thông số mắt</p>
              <Button
                className="mt-4"
                onClick={() => {
                  onOpenChange(false);
                  onInputPrescription(order);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Nhập thông số
              </Button>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
