import { ShipmentForHandover, handoverCarrierColors } from '@/types/handover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClipboardList } from 'lucide-react';

interface CreateBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedShipments: ShipmentForHandover[];
  totalWeight: number;
  totalPackages: number;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
}

export const CreateBatchModal = ({
  open,
  onOpenChange,
  selectedShipments,
  totalWeight,
  totalPackages,
  notes,
  onNotesChange,
  onSubmit,
}: CreateBatchModalProps) => {
  const carriers = [...new Set(selectedShipments.map((s) => s.carrier))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo phiếu bàn giao</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 space-y-3 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Số vận đơn:</span>
              <span className="font-medium">{selectedShipments.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Tổng số kiện:
              </span>
              <span className="font-medium">{totalPackages}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Tổng khối lượng:
              </span>
              <span className="font-medium">{totalWeight.toFixed(1)} kg</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nhà vận chuyển</label>
            <div className="flex flex-wrap gap-2">
              {carriers.map((carrier) => (
                <span
                  key={carrier}
                  className={`rounded-full border px-3 py-1 text-sm font-medium ${handoverCarrierColors[carrier]}`}
                >
                  {carrier}:{' '}
                  {
                    selectedShipments.filter((s) => s.carrier === carrier)
                      .length
                  }{' '}
                  vận đơn
                </span>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Lưu ý: Mỗi nhà vận chuyển sẽ tạo 1 phiếu bàn giao riêng
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú</label>
            <Textarea
              placeholder="Ghi chú cho phiếu bàn giao (không bắt buộc)"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onSubmit}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Tạo phiếu bàn giao
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
