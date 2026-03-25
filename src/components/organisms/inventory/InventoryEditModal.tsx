import { useState } from 'react';
import { Button, Input } from '@/components/atoms';
import { adjustmentReasons } from '@/data/inventoryData';
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
    if (!item || item.trackInventory === false) return;

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
          <DialogTitle className="text-foreground">
            {item.trackInventory !== false ? 'Cập nhật tồn kho' : 'Không theo dõi tồn'}
          </DialogTitle>
          <DialogDescription className="text-foreground/90">
            {item.name} ({item.sku})
          </DialogDescription>
        </DialogHeader>

        {item.trackInventory !== false ? (
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
                  {adjustmentReasons.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Sản phẩm này đang tắt <code>inventory.track</code>, nên hệ thống không
            trừ tồn và cũng không cho sửa tồn kho tại đây.
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Đóng
          </Button>
          {item.trackInventory !== false ? (
            <Button
              onClick={handleUpdate}
              disabled={isSaving}
              className="bg-yellow-400 text-yellow-950 shadow-sm hover:bg-yellow-500"
            >
              {isSaving ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
