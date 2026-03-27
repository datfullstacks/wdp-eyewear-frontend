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
import {
  FileText,
  Glasses,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from 'lucide-react';

interface RxDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PrescriptionOrder | null;
  onInputPrescription: (order: PrescriptionOrder) => void;
}

function getWorkflowLabel(order: PrescriptionOrder) {
  switch (order.workflowStage) {
    case 'waiting_review':
      return 'Cho review Rx';
    case 'waiting_lab':
      return 'Cho vao gia cong';
    case 'lens_processing':
      return 'Dang cat mai trong';
    case 'lens_fitting':
      return 'Dang lap trong vao gong';
    case 'qc_check':
      return 'Dang QC sau gia cong';
    case 'ready_to_pack':
      return 'San sang dong goi';
    case 'packing':
      return 'Dang dong goi';
    case 'ready_to_ship':
      return 'Cho tao van don';
    case 'shipment_created':
      return 'Da tao van don GHN';
    case 'handover_to_carrier':
      return 'Da ban giao van chuyen';
    case 'in_transit':
      return 'Dang van chuyen';
    case 'delivery_failed':
      return 'Giao that bai';
    case 'waiting_redelivery':
      return 'Cho giao lai';
    case 'return_pending':
      return 'Cho hoan hang';
    case 'return_in_transit':
      return 'Dang hoan hang';
    case 'exception_hold':
      return 'Dang hold ngoai le';
    case 'delivered':
      return 'Da giao';
    case 'returned':
      return 'Da hoan hang';
    default:
      return '-';
  }
}

function getSourceLabel(source: PrescriptionOrder['source']) {
  if (source === 'customer_upload') return 'Khach upload toa';
  if (source === 'store_input') return 'Store nhap Rx';
  return 'Dang cho Rx';
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
      <DialogContent className="max-h-[80vh] w-[92vw] max-w-lg overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Chi tiet don hang {order.orderId}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Thong tin don prescription, tien do gia cong va giao van
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground/80">Khach hang</Label>
              <div className="flex items-center gap-2">
                <User className="text-foreground/70 h-4 w-4" />
                <span className="font-medium">{order.customer}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">So dien thoai</Label>
              <div className="flex items-center gap-2">
                <Phone className="text-foreground/70 h-4 w-4" />
                <span>{order.phone}</span>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-foreground/80">Dia chi</Label>
              <div className="flex items-center gap-2">
                <MapPin className="text-foreground/70 h-4 w-4" />
                <span>{order.address}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <div className="mb-2 flex items-center gap-2">
                <Package className="text-foreground/70 h-4 w-4" />
                <Label className="text-foreground/80">Tien do xu ly</Label>
              </div>
              <p className="font-medium">{getWorkflowLabel(order)}</p>
              {order.opsStage ? (
                <p className="text-foreground/70 mt-1 text-xs">
                  Backend: {order.opsStage}
                </p>
              ) : null}
            </div>
            <div className="rounded-lg border p-3">
              <div className="mb-2 flex items-center gap-2">
                <Truck className="text-foreground/70 h-4 w-4" />
                <Label className="text-foreground/80">Giao van</Label>
              </div>
              <p className="font-medium">
                {order.shipmentStatus ? `GHN: ${order.shipmentStatus}` : 'Chua co van don'}
              </p>
              {order.trackingCode ? (
                <p className="text-foreground/70 mt-1 font-mono text-xs">
                  {order.trackingCode}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2">
              <Glasses className="text-foreground/70 h-4 w-4" />
              <Label className="text-foreground/80">Nguon toa</Label>
            </div>
            <p className="font-medium">{getSourceLabel(order.source)}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80">San pham</Label>
            <div className="bg-muted/30 space-y-2 rounded-lg p-3">
              {order.products.map((product, index) => (
                <div key={`${product.sku}-${index}`} className="flex justify-between gap-3">
                  <span>
                    {product.name} - {product.frame}
                  </span>
                  <span className="text-foreground/70">SKU: {product.sku}</span>
                </div>
              ))}
            </div>
          </div>

          {order.prescription || order.attachmentUrl ? (
            <div className="space-y-4">
              <Label className="text-foreground/80">Thong so mat (Rx)</Label>
              {order.prescription ? (
                <div className="bg-muted/30 space-y-4 rounded-lg p-3">
                  <div className="grid grid-cols-4 gap-4 text-center text-sm">
                    <div className="font-medium"></div>
                    <div className="font-medium">SPH</div>
                    <div className="font-medium">CYL</div>
                    <div className="font-medium">AXIS</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="text-right font-medium">Mat phai (OD)</div>
                    <div>{order.prescription.sphereRight || '-'}</div>
                    <div>{order.prescription.cylinderRight || '-'}</div>
                    <div>{order.prescription.axisRight || '-'}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="text-right font-medium">Mat trai (OS)</div>
                    <div>{order.prescription.sphereLeft || '-'}</div>
                    <div>{order.prescription.cylinderLeft || '-'}</div>
                    <div>{order.prescription.axisLeft || '-'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t pt-2">
                    <div>
                      <span className="text-foreground/70">PD: </span>
                      <span className="font-medium">
                        {order.prescription.pd || '-'}mm
                      </span>
                    </div>
                    {order.prescription.addRight ? (
                      <div>
                        <span className="text-foreground/70">ADD: </span>
                        <span className="font-medium">
                          {order.prescription.addRight}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t pt-2">
                    <div>
                      <span className="text-foreground/70">Loai trong: </span>
                      <span className="font-medium">
                        {order.prescription.lensType || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Lop phu: </span>
                      <span className="font-medium">
                        {order.prescription.coating || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {order.attachmentUrl ? (
                <div className="bg-muted/30 space-y-3 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-foreground/80">Toa upload</Label>
                    <a
                      href={order.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-sm underline"
                    >
                      Mo anh goc
                    </a>
                  </div>
                  <img
                    src={order.attachmentUrl}
                    alt={`Prescription ${order.orderId}`}
                    className="max-h-96 w-full rounded-lg border object-contain"
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Glasses className="text-foreground/70 mx-auto h-8 w-8" />
              <p className="text-foreground/70 mt-2">Chua co thong so mat</p>
              <Button
                className="mt-4"
                onClick={() => {
                  onOpenChange(false);
                  onInputPrescription(order);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Nhap thong so
              </Button>
            </div>
          )}

          {order.notes ? (
            <div className="space-y-2">
              <Label className="text-foreground/80">Ghi chu</Label>
              <p className="bg-muted/30 rounded-lg p-3 text-sm">{order.notes}</p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
