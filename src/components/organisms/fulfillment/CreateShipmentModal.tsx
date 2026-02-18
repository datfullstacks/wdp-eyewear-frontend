import { carriers } from '@/types/fulfillment';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus } from 'lucide-react';
import { Input } from '@/components/atoms';

interface CreateShipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  form: { carrier: string; weight: string; notes: string };
  onFormChange: (form: {
    carrier: string;
    weight: string;
    notes: string;
  }) => void;
  onSubmit: () => void;
}

export const CreateShipmentModal = ({
  open,
  onOpenChange,
  selectedCount,
  form,
  onFormChange,
  onSubmit,
}: CreateShipmentModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo vận đơn mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm">
              Đã chọn <span className="font-bold">{selectedCount}</span> đơn
              hàng để tạo vận đơn
            </p>
          </div>

          <div className="space-y-2">
            <Label>Đơn vị vận chuyển *</Label>
            <Select
              value={form.carrier}
              onValueChange={(value) =>
                onFormChange({ ...form, carrier: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn đơn vị vận chuyển" />
              </SelectTrigger>
              <SelectContent>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Khối lượng (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(e) =>
                onFormChange({ ...form, weight: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Ghi chú cho shipper</Label>
            <Textarea
              placeholder="Gọi trước khi giao, hàng dễ vỡ..."
              value={form.notes}
              onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onSubmit}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo vận đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
