import { HandoverBatch } from '@/types/handover';
import { Button } from '@/components/ui/button';

import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, Hash, Truck, Package } from 'lucide-react';
import { Input } from '@/components/atoms';

interface HandoverConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: HandoverBatch | null;
  carrierStaffName: string;
  onCarrierStaffNameChange: (name: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
}

export const HandoverConfirmModal = ({
  open,
  onOpenChange,
  batch,
  carrierStaffName,
  onCarrierStaffNameChange,
  notes,
  onNotesChange,
  onSubmit,
}: HandoverConfirmModalProps) => {
  if (!batch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Xác nhận bàn giao</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 space-y-2 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Hash className="text-muted-foreground h-4 w-4" />
              <span className="font-mono font-medium">{batch.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="text-muted-foreground h-4 w-4" />
              <span>{batch.carrier}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="text-muted-foreground h-4 w-4" />
              <span>
                {batch.shipmentCount} vận đơn • {batch.totalPackages} kiện •{' '}
                {batch.totalWeight} kg
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tên nhân viên NVC nhận hàng *
            </label>
            <Input
              placeholder="Nhập tên nhân viên nhà vận chuyển"
              value={carrierStaffName}
              onChange={(e) => onCarrierStaffNameChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú bàn giao</label>
            <Textarea
              placeholder="Ghi chú thêm (không bắt buộc)"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onSubmit} disabled={!carrierStaffName}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Xác nhận bàn giao
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
