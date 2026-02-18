import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PackageCheck } from 'lucide-react';
import type { PreorderBatch } from '@/types/preorderImport';

interface ImportDetailModalProps {
  batch: PreorderBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReceive: (batch: PreorderBatch) => void;
}

export const ImportDetailModal = ({
  batch,
  open,
  onOpenChange,
  onReceive,
}: ImportDetailModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Chi tiết đợt hàng {batch?.batchCode}</DialogTitle>
        <DialogDescription>Nhà cung cấp: {batch?.supplier}</DialogDescription>
      </DialogHeader>
      {batch && (
        <div className="space-y-4">
          <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4">
            <div>
              <p className="text-muted-foreground text-sm">Ngày đặt hàng</p>
              <p className="font-medium">
                {new Date(batch.orderDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Ngày dự kiến về</p>
              <p className="font-medium">
                {new Date(batch.expectedDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Tổng sản phẩm</p>
              <p className="font-medium">{batch.totalItems}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Đã nhận</p>
              <p className="font-medium">{batch.receivedItems}</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Biến thể</TableHead>
                <TableHead className="text-center">Đặt</TableHead>
                <TableHead className="text-center">Đã nhận</TableHead>
                <TableHead className="text-center">Còn lại</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batch.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.sku}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.productName}
                  </TableCell>
                  <TableCell>{item.variant}</TableCell>
                  <TableCell className="text-center">
                    {item.orderedQty}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.receivedQty}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={item.pendingQty > 0 ? 'secondary' : 'default'}
                    >
                      {item.pendingQty}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>
        {batch && batch.status !== 'completed' && (
          <Button
            onClick={() => {
              onOpenChange(false);
              onReceive(batch);
            }}
          >
            <PackageCheck className="mr-2 h-4 w-4" />
            Xác nhận nhập kho
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
