import { PrescriptionOrder } from '@/types/rxPrescription';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RxApproveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PrescriptionOrder | null;
  onApprove: () => void;
}

function getSourceLabel(source: PrescriptionOrder['source']) {
  if (source === 'customer_upload') return 'Khach upload toa';
  if (source === 'store_input') return 'Store nhap Rx';
  return 'Dang cho Rx';
}

export const RxApproveModal = ({
  open,
  onOpenChange,
  order,
  onApprove,
}: RxApproveModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] max-h-[80vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Duyet thong so mat
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Xac nhan Rx hop le de chuyen don sang queue gia cong
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/30 space-y-3 rounded-lg p-3">
            <div className="text-sm">
              <span className="text-foreground/70">Nguon Rx: </span>
              <span className="font-medium">{getSourceLabel(order.source)}</span>
            </div>

            {order.prescription ? (
              <>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div></div>
                  <div className="font-medium">SPH</div>
                  <div className="font-medium">CYL</div>
                  <div className="font-medium">AXIS</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="font-medium">OD</div>
                  <div>{order.prescription.sphereRight || '-'}</div>
                  <div>{order.prescription.cylinderRight || '-'}</div>
                  <div>{order.prescription.axisRight || '-'}</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="font-medium">OS</div>
                  <div>{order.prescription.sphereLeft || '-'}</div>
                  <div>{order.prescription.cylinderLeft || '-'}</div>
                  <div>{order.prescription.axisLeft || '-'}</div>
                </div>
                <div className="border-t pt-2 text-sm">
                  <span className="text-foreground/70">PD: </span>
                  {order.prescription.pd || '-'}mm |{' '}
                  <span className="text-foreground/70">Trong: </span>
                  {order.prescription.lensType || '-'} |{' '}
                  <span className="text-foreground/70">Phu: </span>
                  {order.prescription.coating || '-'}
                </div>
              </>
            ) : (
              <p className="text-foreground/80 text-sm">
                Don nay chua co bo so Rx manual. Operations can duyet dua tren toa upload.
              </p>
            )}

            {order.attachmentUrl ? (
              <div className="space-y-2 border-t pt-3">
                <p className="text-sm font-medium">Toa upload</p>
                <a
                  href={order.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-sm underline"
                >
                  Mo anh toa goc
                </a>
                <img
                  src={order.attachmentUrl}
                  alt={`Toa upload ${order.orderId}`}
                  className="max-h-80 w-full rounded-lg border object-contain"
                />
              </div>
            ) : null}
          </div>
          <div className="bg-warning/10 flex items-start gap-2 rounded-lg p-3">
            <AlertTriangle className="text-warning mt-0.5 h-5 w-5" />
            <p className="text-sm text-foreground/90">
              Kiem tra ky Rx truoc khi duyet. Sau khi duyet, don hang se chuyen sang
              stage waiting_lab de operations bat dau gia cong.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kiem tra lai
          </Button>
          <Button onClick={onApprove}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Xac nhan duyet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
