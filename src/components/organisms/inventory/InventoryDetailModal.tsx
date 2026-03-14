import { useCallback } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InventoryItem } from '@/types/inventory';

function formatDateTime(value?: string) {
  if (!value) return '-';

  const trimmed = value.trim();
  if (!trimmed) return '-';

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function stockTone(status: InventoryItem['status']) {
  const map: Record<InventoryItem['status'], string> = {
    in_stock: 'border-emerald-200 bg-emerald-50',
    low_stock: 'border-amber-200 bg-amber-50',
    out_of_stock: 'border-rose-200 bg-rose-50',
    overstock: 'border-sky-200 bg-sky-50',
    not_tracked: 'border-slate-200 bg-slate-50',
  };

  return map[status] || 'border-slate-200 bg-slate-50';
}

function toStatusLabel(status: InventoryItem['status']) {
  const map: Record<InventoryItem['status'], string> = {
    in_stock: 'Con hang',
    low_stock: 'Sap het',
    out_of_stock: 'Het hang',
    overstock: 'Ton nhieu',
    not_tracked: 'Khong theo doi ton',
  };

  return map[status] || status;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-foreground/70 text-sm">{label}</p>
      <p className="text-foreground font-semibold">{value}</p>
    </div>
  );
}

interface InventoryDetailModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InventoryDetailModal = ({
  item,
  open,
  onOpenChange,
}: InventoryDetailModalProps) => {
  const handleCopySku = useCallback(async () => {
    if (!item?.sku) return;
    try {
      await navigator.clipboard.writeText(item.sku);
    } catch {
      // noop
    }
  }, [item?.sku]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="border-b border-slate-200/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle>Chi tiet ton kho</DialogTitle>
              <DialogDescription className="text-foreground/90 mt-1 flex items-center gap-2">
                <span className="font-mono text-sm">{item.sku}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Copy SKU"
                  onClick={handleCopySku}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="San pham" value={item.name} />
              <InfoItem label="Thuong hieu" value={item.brand} />
              <InfoItem label="Danh muc" value={item.category} />
              <InfoItem label="Bien the" value={item.variant} />
            </div>
          </div>

          <div className={cn('rounded-xl border p-3', stockTone(item.status))}>
            <p className="text-foreground/80 text-sm font-semibold">
              Thong tin ton kho
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                {item.trackInventory !== false ? (
                  <>
                    <p className="text-foreground text-3xl font-bold">{item.stock}</p>
                    <p className="text-foreground/70 text-xs">Ton kho hien tai</p>
                  </>
                ) : (
                  <>
                    <p className="text-foreground text-lg font-bold">
                      Khong theo doi ton
                    </p>
                    <p className="text-foreground/70 text-xs">
                      San pham nay khong tru ton tu dong
                    </p>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-foreground/70 text-xs">Cap nhat lan cuoi</p>
                <p className="text-foreground font-semibold">
                  {formatDateTime(item.lastUpdated)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200/70 bg-white/80 p-3">
            <InfoItem
              label="Ton toi thieu"
              value={item.trackInventory !== false ? String(item.minStock) : '-'}
            />
            <InfoItem
              label="Ton toi da"
              value={item.trackInventory !== false ? String(item.maxStock) : '-'}
            />
            <InfoItem label="Vi tri kho" value={item.location} />
            <InfoItem label="Trang thai" value={toStatusLabel(item.status)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
