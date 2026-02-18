import { HandoverBatch, handoverCarrierColors } from '@/types/handover';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Printer } from 'lucide-react';
import { HandoverStatus } from '@/types/handover';

interface HandoverDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: HandoverBatch | null;
  onPrintManifest: () => void;
}

const getStatusBadge = (status: HandoverStatus) => {
  switch (status) {
    case 'pending':
      return <StatusBadge status="warning">Chờ đóng gói</StatusBadge>;
    case 'ready':
      return <StatusBadge status="info">Sẵn sàng</StatusBadge>;
    case 'handed_over':
      return <StatusBadge status="warning">Đã bàn giao</StatusBadge>;
    case 'confirmed':
      return <StatusBadge status="success">Đã xác nhận</StatusBadge>;
  }
};

export const HandoverDetailModal = ({
  open,
  onOpenChange,
  batch,
  onPrintManifest,
}: HandoverDetailModalProps) => {
  if (!batch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết phiếu bàn giao</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Mã phiếu</p>
              <p className="font-mono font-medium">{batch.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Trạng thái</p>
              {getStatusBadge(batch.status)}
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Nhà vận chuyển</p>
              <span
                className={`inline-flex rounded border px-2 py-1 text-sm font-medium ${handoverCarrierColors[batch.carrier]}`}
              >
                {batch.carrier}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Số lượng</p>
              <p className="font-medium">
                {batch.shipmentCount} vận đơn • {batch.totalPackages} kiện
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Tổng khối lượng</p>
              <p className="font-medium">{batch.totalWeight} kg</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Thời gian tạo</p>
              <p>{batch.createdAt}</p>
            </div>
          </div>

          <div className="border-border border-t pt-4">
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              <User className="h-4 w-4" />
              Thông tin bàn giao
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  Nhân viên lập phiếu
                </p>
                <p className="font-medium">{batch.staffName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  NV NVC nhận hàng
                </p>
                <p className="font-medium">{batch.carrierStaffName || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  Thời gian bàn giao
                </p>
                <p>{batch.handoverTime || '-'}</p>
              </div>
              {batch.notes && (
                <div className="col-span-2 space-y-1">
                  <p className="text-muted-foreground text-sm">Ghi chú</p>
                  <p>{batch.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={onPrintManifest}>
            <Printer className="mr-2 h-4 w-4" />
            In phiếu bàn giao
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
