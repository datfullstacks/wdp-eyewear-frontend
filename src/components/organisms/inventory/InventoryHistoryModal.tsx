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
          <DialogTitle>Lich su xuat nhap kho</DialogTitle>
          <DialogDescription className="text-foreground/80">
            {item.name} ({item.sku})
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {entries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              Inventory history is not connected to a live backend endpoint yet. This dialog is
              read-only until the stock movement API is exposed.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground/80">Thoi gian</TableHead>
                  <TableHead className="text-foreground/80">Loai</TableHead>
                  <TableHead className="text-foreground/80 text-center">So luong</TableHead>
                  <TableHead className="text-foreground/80">Ghi chu</TableHead>
                  <TableHead className="text-foreground/80">Nguoi thuc hien</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <InventoryHistoryRow key={entry.id} entry={entry} />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
