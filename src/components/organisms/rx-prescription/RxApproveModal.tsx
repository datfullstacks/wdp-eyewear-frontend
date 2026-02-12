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

export const RxApproveModal = ({
  open,
  onOpenChange,
  order,
  onApprove,
}: RxApproveModalProps) => {
  if (!order?.prescription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] max-h-[80vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Duyệt thông số mắt
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Xác nhận thông số đúng để chuyển đơn sang gia công
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/30 space-y-3 rounded-lg p-3">
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div></div>
              <div className="font-medium">SPH</div>
              <div className="font-medium">CYL</div>
              <div className="font-medium">AXIS</div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div className="font-medium">OD</div>
              <div>{order.prescription.sphereRight}</div>
              <div>{order.prescription.cylinderRight}</div>
              <div>{order.prescription.axisRight}</div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div className="font-medium">OS</div>
              <div>{order.prescription.sphereLeft}</div>
              <div>{order.prescription.cylinderLeft}</div>
              <div>{order.prescription.axisLeft}</div>
            </div>
            <div className="border-t pt-2 text-sm">
              <span className="text-foreground/70">PD: </span>
              {order.prescription.pd}mm |{' '}
              <span className="text-foreground/70">Tròng: </span>
              {order.prescription.lensType} |{' '}
              <span className="text-foreground/70">Phủ: </span>
              {order.prescription.coating}
            </div>
          </div>
          <div className="bg-warning/10 flex items-start gap-2 rounded-lg p-3">
            <AlertTriangle className="text-warning mt-0.5 h-5 w-5" />
            <p className="text-sm text-foreground/90">
              Vui lòng kiểm tra kỹ thông số trước khi duyệt. Sau khi duyệt, đơn
              hàng sẽ được chuyển sang bộ phận gia công.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kiểm tra lại
          </Button>
          <Button onClick={onApprove}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Xác nhận duyệt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
