import { HandoverBatch } from '@/types/handover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Printer } from 'lucide-react';

interface HandoverPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: HandoverBatch | null;
  onPrint: () => void;
}

export const HandoverPrintModal = ({
  open,
  onOpenChange,
  batch,
  onPrint,
}: HandoverPrintModalProps) => {
  if (!batch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>In phiếu bàn giao</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 space-y-2 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Mã phiếu:</span>
              <span className="font-mono font-medium">{batch.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Nhà vận chuyển:
              </span>
              <span className="font-medium">{batch.carrier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Số vận đơn:</span>
              <span className="font-medium">{batch.shipmentCount}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Khổ giấy in</label>
            <Select defaultValue="a4">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4 (210 x 297 mm)</SelectItem>
                <SelectItem value="a5">A5 (148 x 210 mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nội dung in</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="include-list" defaultChecked />
                <label htmlFor="include-list" className="text-sm">
                  Danh sách vận đơn chi tiết
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="include-summary" defaultChecked />
                <label htmlFor="include-summary" className="text-sm">
                  Thông tin tổng hợp
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="include-signature" defaultChecked />
                <label htmlFor="include-signature" className="text-sm">
                  Phần ký nhận
                </label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Tải PDF
          </Button>
          <Button onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" />
            In phiếu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
