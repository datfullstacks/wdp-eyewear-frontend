import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InventoryHistoryRow } from '@/components/molecules/InventoryHistoryRow';
import { InventoryItem, InventoryHistoryEntry } from '@/types/inventory';

interface InventoryHistoryModalProps {
  item: InventoryItem | null;
  entries: InventoryHistoryEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InventoryHistoryModal = ({
  item,
  entries,
  open,
  onOpenChange,
}: InventoryHistoryModalProps) => {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lịch sử xuất nhập kho</DialogTitle>
          <DialogDescription className="text-foreground/80">
            {item.name} ({item.sku})
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground/80">Thời gian</TableHead>
                <TableHead className="text-foreground/80">Loại</TableHead>
                <TableHead className="text-foreground/80 text-center">
                  Số lượng
                </TableHead>
                <TableHead className="text-foreground/80">Ghi chú</TableHead>
                <TableHead className="text-foreground/80">
                  Người thực hiện
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <InventoryHistoryRow key={entry.id} entry={entry} />
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
