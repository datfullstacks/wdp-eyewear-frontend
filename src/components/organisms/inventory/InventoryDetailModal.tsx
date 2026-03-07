import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InventoryItem } from '@/types/inventory';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import { useCallback } from 'react';

function formatDateTime(value?: string) {
  if (!value) return '-';

  const trimmed = value.trim();
  if (!trimmed) return '-';

  let date: Date | null = null;

  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(trimmed)) {
    date = new Date(trimmed.replace(' ', 'T'));
  } else if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/.test(trimmed)) {
    const [d, t] = trimmed.split(/\s+/);
    const [day, month, year] = d.split('/').map(Number);
    const [hour, minute] = t.split(':').map(Number);
    date = new Date(year, month - 1, day, hour, minute);
  } else {
    date = new Date(trimmed);
  }

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
  };
  return map[status] || 'border-slate-200 bg-slate-50';
}

function toStatusLabel(status: InventoryItem['status']) {
  const map: Record<InventoryItem['status'], string> = {
    in_stock: 'Còn hàng',
    low_stock: 'Sắp hết',
    out_of_stock: 'Hết hàng',
    overstock: 'Tồn nhiều',
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
  if (!item) return null;

  const handleCopySku = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(item.sku || '');
    } catch {
      // noop
    }
  }, [item.sku]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="border-b border-slate-200/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle>Chi tiết tồn kho</DialogTitle>
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
              <InfoItem label="Sản phẩm" value={item.name} />
              <InfoItem label="Thương hiệu" value={item.brand} />
              <InfoItem label="Danh mục" value={item.category} />
              <InfoItem label="Biến thể" value={item.variant} />
            </div>
          </div>

          <div className={cn('rounded-xl border p-3', stockTone(item.status))}>
            <p className="text-foreground/80 text-sm font-semibold">
              Thông tin tồn kho
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-foreground text-3xl font-bold">
                  {item.stock}
                </p>
                <p className="text-foreground/70 text-xs">Tồn kho hiện tại</p>
              </div>
              <div className="text-right">
                <p className="text-foreground/70 text-xs">Cập nhật lần cuối</p>
                <p className="text-foreground font-semibold">
                  {formatDateTime(item.lastUpdated)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200/70 bg-white/80 p-3">
            <InfoItem label="Tồn tối thiểu" value={String(item.minStock)} />
            <InfoItem label="Tồn tối đa" value={String(item.maxStock)} />
            <InfoItem label="Vị trí kho" value={item.location} />
            <InfoItem label="Trạng thái" value={toStatusLabel(item.status)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
