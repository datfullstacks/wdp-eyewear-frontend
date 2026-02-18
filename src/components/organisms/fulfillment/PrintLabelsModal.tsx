import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

interface PrintLabelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingCount: number;
  totalCount: number;
  onPrint: () => void;
}

export const PrintLabelsModal = ({
  open,
  onOpenChange,
  pendingCount,
  totalCount,
  onPrint,
}: PrintLabelsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>In nhãn vận đơn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Chọn vận đơn để in</Label>
            <Select defaultValue="pending">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  Vận đơn chờ lấy hàng ({pendingCount})
                </SelectItem>
                <SelectItem value="all">
                  Tất cả vận đơn ({totalCount})
                </SelectItem>
                <SelectItem value="selected">Vận đơn đã chọn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kích thước nhãn</Label>
            <Select defaultValue="a5">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a5">A5 (148 x 210 mm)</SelectItem>
                <SelectItem value="a6">A6 (105 x 148 mm)</SelectItem>
                <SelectItem value="80x100">80 x 100 mm</SelectItem>
                <SelectItem value="100x150">100 x 150 mm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="include-invoice" />
            <Label htmlFor="include-invoice">Kèm theo hóa đơn</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="outline" onClick={onPrint}>
            <Download className="mr-2 h-4 w-4" />
            Tải xuống PDF
          </Button>
          <Button onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" />
            In ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
