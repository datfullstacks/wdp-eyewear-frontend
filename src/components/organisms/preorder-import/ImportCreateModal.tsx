import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Package, Plus } from 'lucide-react';
import { Input } from '@/components/atoms';

interface ImportCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: string[];
  onConfirm: () => void;
}

export const ImportCreateModal = ({
  open,
  onOpenChange,
  suppliers,
  onConfirm,
}: ImportCreateModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg w-[92vw] max-h-[80vh] overflow-y-auto p-4 sm:p-5">
      <DialogHeader>
        <DialogTitle>Tạo đợt hàng Pre-order mới</DialogTitle>
        <DialogDescription>
          Nhập thông tin đợt hàng đặt trước từ nhà cung cấp
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Mã đợt hàng</Label>
            <Input placeholder="VD: PO-2024-005" />
          </div>
          <div className="space-y-2">
            <Label>Nhà cung cấp</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Chọn NCC" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ngày đặt hàng</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>Ngày dự kiến về</Label>
            <Input type="date" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Ghi chú</Label>
          <Textarea placeholder="Thông tin bổ sung về đợt hàng..." />
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Package className="text-muted-foreground mx-auto h-8 w-8 opacity-50" />
          <p className="text-muted-foreground mt-2 text-sm">
            Sau khi tạo, bạn có thể thêm sản phẩm vào đợt hàng
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button onClick={onConfirm}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đợt hàng
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
