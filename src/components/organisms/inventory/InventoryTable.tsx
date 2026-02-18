import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { InventoryStatusBadge } from '@/components/atoms/InventoryStatusBadge';

import { InventoryItem } from '@/types/inventory';
import { MoreHorizontal, Eye, Edit, History } from 'lucide-react';

interface InventoryTableProps {
  items: InventoryItem[];
  onViewDetail: (item: InventoryItem) => void;
  onEditStock: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
}

export const InventoryTable = ({
  items,
  onViewDetail,
  onEditStock,
  onViewHistory,
}: InventoryTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[120px]">SKU</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Biến thể</TableHead>
            <TableHead className="text-center">Tồn kho</TableHead>
            <TableHead className="text-center">Đã giữ</TableHead>
            <TableHead className="text-center">Có thể bán</TableHead>
            <TableHead>Vị trí</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30">
              <TableCell className="text-foreground font-mono text-sm font-normal">
                {item.sku}
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-foreground font-normal">{item.name}</p>
                  <p className="text-foreground/80 text-sm">
                    {item.brand} • {item.category}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-foreground/80 text-sm">
                {item.variant}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-foreground font-normal">
                    {item.stock}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-foreground/90 text-center">
                {item.reserved}
              </TableCell>
              <TableCell className="text-primary text-center font-normal">
                {item.available}
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
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditStock(item)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Cập nhật tồn kho
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onViewHistory(item)}>
                      <History className="mr-2 h-4 w-4" />
                      Lịch sử xuất nhập
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
