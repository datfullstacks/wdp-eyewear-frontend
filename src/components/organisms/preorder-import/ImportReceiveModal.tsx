import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { CheckCircle2 } from 'lucide-react';
import type { PreorderBatch } from '@/types/preorderImport';
import { Input } from '@/components/atoms';

interface ImportReceiveModalProps {
  batch: PreorderBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiveQuantities: Record<string, number>;
  onReceiveQuantitiesChange: (quantities: Record<string, number>) => void;
  receiveNotes: string;
  onReceiveNotesChange: (notes: string) => void;
  onConfirm: () => void;
}

export const ImportReceiveModal = ({
  batch,
  open,
  onOpenChange,
  receiveQuantities,
  onReceiveQuantitiesChange,
  receiveNotes,
  onReceiveNotesChange,
  onConfirm,
}: ImportReceiveModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Xác nhận nhập kho - {batch?.batchCode}</DialogTitle>
        <DialogDescription>
          Nhập số lượng thực nhận cho từng sản phẩm
        </DialogDescription>
      </DialogHeader>
      {batch && (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Biến thể</TableHead>
                <TableHead className="text-center">Còn chờ</TableHead>
                <TableHead className="w-32">Số lượng nhận</TableHead>
                <TableHead className="w-12">Đủ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batch.items
                .filter((item) => item.pendingQty > 0)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell>{item.variant}</TableCell>
                    <TableCell className="text-center">
                      {item.pendingQty}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={item.pendingQty}
                        value={receiveQuantities[item.id] || 0}
                        onChange={(e) =>
                          onReceiveQuantitiesChange({
                            ...receiveQuantities,
                            [item.id]: Math.min(
                              Number(e.target.value),
                              item.pendingQty
                            ),
                          })
                        }
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={receiveQuantities[item.id] === item.pendingQty}
                        onCheckedChange={(checked) =>
                          onReceiveQuantitiesChange({
                            ...receiveQuantities,
                            [item.id]: checked ? item.pendingQty : 0,
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <div className="space-y-2">
            <Label>Ghi chú nhập kho</Label>
            <Textarea
              placeholder="Nhập ghi chú về tình trạng hàng hóa, chứng từ..."
              value={receiveNotes}
              onChange={(e) => onReceiveNotesChange(e.target.value)}
            />
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button onClick={onConfirm}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Xác nhận nhập kho
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
