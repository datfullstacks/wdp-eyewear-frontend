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
import { Textarea } from '@/components/ui/textarea';
import { InventoryItem } from '@/types/inventory';

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
        'Khong the ghi nhan nhap kho. Vui long thu lai.';
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
              ? 'Ghi nhan nhap kho thu cong'
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
                  Ton kho hien tai
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
                placeholder="Ghi chu cho phieu nhap kho thu cong..."
              />
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {item.trackInventory === false
              ? 'San pham nay dang tat inventory.track, nen he thong khong ghi nhan nhap kho tai day.'
              : 'Bien the nay khong co variantId hop le, nen chua the tao phieu nhap kho thu cong.'}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Dong
          </Button>
          {item.trackInventory !== false && item.variantId ? (
            <Button
              onClick={handleUpdate}
              disabled={isSaving}
              className="bg-none bg-yellow-400 text-yellow-950 shadow-lg shadow-yellow-400/30 hover:bg-yellow-500 hover:text-yellow-950 hover:shadow-xl hover:shadow-yellow-400/40 focus-visible:ring-yellow-500"
            >
              {isSaving ? 'Dang ghi nhan...' : 'Xac nhan nhap kho thu cong'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
