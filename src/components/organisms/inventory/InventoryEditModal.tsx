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
    payload:
      | {
          mode: 'receipt';
          quantity: number;
          supplier: string;
          warehouseLocation?: string;
          note?: string;
        }
      | {
          mode: 'adjust';
          stock: number;
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
  const [mode, setMode] = useState<'receipt' | 'adjust'>('receipt');
  const [receiveQty, setReceiveQty] = useState('1');
  const [currentStock, setCurrentStock] = useState('0');
  const [supplier, setSupplier] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && item) {
      setMode('receipt');
      setReceiveQty('1');
      setCurrentStock(String(item.stock ?? 0));
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

    setIsSaving(true);
    setError(null);
    try {
      if (mode === 'receipt') {
        const quantity = Number.parseInt(receiveQty, 10);
        if (!Number.isFinite(quantity) || Number.isNaN(quantity) || quantity < 1) {
          setError('So luong nhap kho khong hop le.');
          return;
        }

        if (!supplier.trim()) {
          setError('Nha cung cap la bat buoc.');
          return;
        }

        await onUpdate(item, {
          mode: 'receipt',
          quantity,
          supplier: supplier.trim(),
          warehouseLocation: warehouseLocation.trim() || undefined,
          note: note.trim() || undefined,
        });
      } else {
        const stock = Number.parseInt(currentStock, 10);
        if (!Number.isFinite(stock) || Number.isNaN(stock) || stock < 0) {
          setError('Ton kho moi khong hop le.');
          return;
        }

        await onUpdate(item, {
          mode: 'adjust',
          stock,
          warehouseLocation: warehouseLocation.trim() || undefined,
          note: note.trim() || undefined,
        });
      }
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
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <Button
                type="button"
                variant={mode === 'receipt' ? 'primary' : 'outline'}
                onClick={() => {
                  setMode('receipt');
                  setError(null);
                }}
              >
                Nhap them
              </Button>
              <Button
                type="button"
                variant={mode === 'adjust' ? 'primary' : 'outline'}
                onClick={() => {
                  setMode('adjust');
                  setError(null);
                }}
              >
                Dieu chinh ton
              </Button>
            </div>
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
                  {mode === 'receipt' ? 'So luong nhap' : 'Ton kho moi'}
                </label>
                <Input
                  type="number"
                  min={mode === 'receipt' ? 1 : 0}
                  value={mode === 'receipt' ? receiveQty : currentStock}
                  onChange={(e) =>
                    mode === 'receipt'
                      ? setReceiveQty(e.target.value)
                      : setCurrentStock(e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>
            {mode === 'receipt' ? (
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
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Dieu chinh ton hien tai dung cho lech kiem ke, sua so luong thuc te, hoac can dong bo
                lai ton kho ngay.
              </div>
            )}
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
              {isSaving
                ? 'Dang ghi nhan...'
                : mode === 'receipt'
                  ? 'Xac nhan nhap kho thu cong'
                  : 'Xac nhan dieu chinh ton'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
