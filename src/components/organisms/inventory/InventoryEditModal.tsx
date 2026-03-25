import { useState } from 'react';
import { Button, Input } from '@/components/atoms';
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
import { Textarea } from '@/components/ui/textarea';

interface InventoryEditModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    item: InventoryItem,
    payload: {
      quantity: number;
      supplier: string;
      warehouseLocation?: string;
      note?: string;
    }
  ) => Promise<void>;
}

export const InventoryEditModal = ({
  item,
  open,
  onOpenChange,
  onUpdate,
}: InventoryEditModalProps) => {
  const [receiveQty, setReceiveQty] = useState('1');
  const [supplier, setSupplier] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && item) {
      setReceiveQty('1');
      setSupplier('');
      setWarehouseLocation(
        item.location && item.location !== '-' ? item.location : ''
      );
      setNote('');
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleUpdate = async () => {
    if (!item || item.trackInventory === false || !item.variantId) return;

    const quantity = Number.parseInt(receiveQty, 10);
    if (!Number.isFinite(quantity) || Number.isNaN(quantity) || quantity < 1) {
      setError('So luong nhap kho khong hop le.');
      return;
    }

    if (!supplier.trim()) {
      setError('Nha cung cap la bat buoc.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onUpdate(item, {
        quantity,
        supplier: supplier.trim(),
        warehouseLocation: warehouseLocation.trim() || undefined,
        note: note.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Khong the nhap kho. Vui long thu lai.';
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
            {item.trackInventory !== false
              ? 'Nhap kho cho bien the'
              : 'Khong theo doi ton'}
          </DialogTitle>
          <DialogDescription className="text-foreground/90">
            {item.name} ({item.sku})
          </DialogDescription>
        </DialogHeader>

        {item.trackInventory !== false && item.variantId ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-foreground/70 text-sm font-medium">
                  Tồn kho hiện tại
                </label>
                <p className="text-foreground text-2xl font-bold">
                  {item.stock}
                </p>
              </div>
              <div>
                <label className="text-foreground/70 text-sm font-medium">
                  So luong nhap
                </label>
                <Input
                  type="number"
                  min={1}
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium">
                Nha cung cap
              </label>
              <Input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="mt-1"
                placeholder="Vi du: Nha cung cap ABC"
              />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium">
                Vi tri kho
              </label>
              <Input
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                className="mt-1"
                placeholder="Vi du: Ke A1-02"
              />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium">
                Ghi chu
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1"
                placeholder="Nhap ghi chu cho phieu nhap kho..."
              />
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {item.trackInventory === false
              ? 'San pham nay dang tat inventory.track, nen he thong khong nhap kho tai day.'
              : 'Bien the nay khong co variantId hop le, nen chua the tao phieu nhap kho.'}
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
          {item.trackInventory !== false && item.variantId ? (
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? 'Dang nhap kho...' : 'Xac nhan nhap kho'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
