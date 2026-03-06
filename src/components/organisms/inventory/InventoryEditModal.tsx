import { useState } from 'react';
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
import { InventoryItem } from '@/types/inventory';
import { adjustmentReasons } from '@/data/inventoryData';
import { Button, Input } from '@/components/atoms';

interface InventoryEditModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (item: InventoryItem, newStock: number, reason: string) => Promise<void>;
}

export const InventoryEditModal = ({
  item,
  open,
  onOpenChange,
  onUpdate,
}: InventoryEditModalProps) => {
  const [editStock, setEditStock] = useState('');
  const [reason, setReason] = useState('adjust');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && item) {
      setEditStock(item.stock.toString());
      setReason('adjust');
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleUpdate = async () => {
    if (!item) return;

    const nextStock = Number.parseInt(editStock, 10);
    if (!Number.isFinite(nextStock) || Number.isNaN(nextStock) || nextStock < 0) {
      setError('Số lượng mới không hợp lệ.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onUpdate(item, nextStock, reason);
      onOpenChange(false);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        'Không thể cập nhật tồn kho. Vui lòng thử lại.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">Cập nhật tồn kho</DialogTitle>
          <DialogDescription className="text-foreground/90">
            {item.name} ({item.sku})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-foreground/70 text-sm font-medium">
                Tồn kho hiện tại
              </label>
              <p className="text-foreground text-2xl font-bold">{item.stock}</p>
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium">
                Số lượng mới
              </label>
              <Input
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-foreground/70 text-sm font-medium">
              Lý do điều chỉnh
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {adjustmentReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button onClick={handleUpdate} disabled={isSaving}>
            {isSaving ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

