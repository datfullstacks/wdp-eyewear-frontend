import { Button } from '@/components/ui/button';
import { InventoryStatusBadge } from '@/components/atoms/InventoryStatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InventoryItem } from '@/types/inventory';
import { Edit, Eye, History, MoreHorizontal } from 'lucide-react';

interface InventoryTableProps {
  items: InventoryItem[];
  onViewDetail: (item: InventoryItem) => void;
  onEditStock: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
  historyEnabled?: boolean;
  stockEditEnabled?: boolean;
  stockEditLabel?: string;
}

export const InventoryTable = ({
  items,
  onViewDetail,
  onEditStock,
  onViewHistory,
  historyEnabled = true,
  stockEditEnabled = true,
  stockEditLabel,
}: InventoryTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>San pham</TableHead>
            <TableHead>Thuong hieu</TableHead>
            <TableHead>Bien the</TableHead>
            <TableHead className="text-center">Ton kho</TableHead>
            <TableHead>Vi tri</TableHead>
            <TableHead>Trang thai</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30">
              <TableCell>
                <div>
                  <p className="text-foreground font-normal">{item.name}</p>
                  <p className="text-foreground/80 text-sm">{item.category}</p>
                </div>
              </TableCell>
              <TableCell className="text-foreground/90 text-sm">
                {item.brand}
              </TableCell>
              <TableCell className="text-foreground/80 text-sm">
                {item.variant}
              </TableCell>
              <TableCell className="text-center">
                {item.trackInventory !== false ? (
                  <span className="text-foreground font-normal">{item.stock}</span>
                ) : (
                  <span className="text-foreground/70 text-xs font-medium uppercase tracking-wide">
                    Khong theo doi
                  </span>
                )}
              </TableCell>
              <TableCell className="text-foreground/90 text-sm">
                {item.location}
              </TableCell>
              <TableCell>
                <InventoryStatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-foreground/80 hover:text-foreground h-8 w-8"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetail(item)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiet
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEditStock(item)}
                      disabled={
                        item.trackInventory === false ||
                        !item.variantId ||
                        !stockEditEnabled
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {item.trackInventory === false
                        ? 'Khong theo doi ton'
                        : !item.variantId
                          ? 'Khong co bien the nhap kho'
                        : stockEditEnabled
                          ? stockEditLabel || 'Nhap kho'
                          : stockEditLabel || 'Chua co quyen nhap kho'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onViewHistory(item)}
                      disabled={!historyEnabled}
                    >
                      <History className="mr-2 h-4 w-4" />
                      {historyEnabled ? 'Lich su xuat nhap' : 'Lich su chua co API'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
