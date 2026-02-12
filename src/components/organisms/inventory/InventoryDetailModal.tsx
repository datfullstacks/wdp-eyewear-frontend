import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InventoryStockCard } from '@/components/molecules/InventoryStockCard';
import { InventoryItem } from '@/types/inventory';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-4">
        <DialogHeader>
          <DialogTitle>Chi tiết tồn kho</DialogTitle>
          <DialogDescription className="text-foreground/90">
            {item.sku}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-foreground/70 text-sm">Sản phẩm</p>
              <p className="text-foreground font-semibold">{item.name}</p>
            </div>
            <div>
              <p className="text-foreground/70 text-sm">Thương hiệu</p>
              <p className="text-foreground font-semibold">{item.brand}</p>
            </div>
            <div>
              <p className="text-foreground/70 text-sm">Danh mục</p>
              <p className="text-foreground font-semibold">{item.category}</p>
            </div>
            <div>
              <p className="text-foreground/70 text-sm">Biến thể</p>
              <p className="text-foreground font-semibold">{item.variant}</p>
            </div>
          </div>
          <div className="border-t pt-3">
            <h4 className="mb-2 font-semibold">Thông tin tồn kho</h4>
            <div className="grid grid-cols-3 gap-3">
              <InventoryStockCard value={item.stock} label="Tồn kho" />
              <InventoryStockCard
                value={item.reserved}
                label="Đã giữ"
                colorClass="text-warning"
              />
              <InventoryStockCard
                value={item.available}
                label="Có thể bán"
                colorClass="text-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t pt-3">
            <div>
              <p className="text-foreground/70 text-sm">Tồn tối thiểu</p>
              <p className="text-foreground font-semibold">{item.minStock}</p>
            </div>
            <div>
              <p className="text-foreground/70 text-sm">Tồn tối đa</p>
              <p className="text-foreground font-semibold">{item.maxStock}</p>
            </div>
            <div>
              <p className="text-foreground/70 text-sm">Vị trí kho</p>
              <p className="text-foreground font-semibold">{item.location}</p>
            </div>
            <div>
              <p className="text-foreground/70 text-sm">Cập nhật lần cuối</p>
              <p className="text-foreground font-semibold">{item.lastUpdated}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

