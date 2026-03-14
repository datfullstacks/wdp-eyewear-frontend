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
  isSubmitting?: boolean;
  errorMessage?: string;
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
  isSubmitting = false,
  errorMessage,
}: ImportReceiveModalProps) => {
  const receivableItems = batch?.items.filter((item) => item.pendingQty > 0) || [];
  const totalReceiving = receivableItems.reduce(
    (sum, item) => sum + Number(receiveQuantities[item.id] || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Xac nhan nhap kho - {batch?.batchCode}</DialogTitle>
          <DialogDescription>
            Nhap so luong thuc nhan cho tung san pham trong batch nay.
          </DialogDescription>
        </DialogHeader>
        {batch ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>San pham</TableHead>
                  <TableHead>Bien the</TableHead>
                  <TableHead className="text-center">Con cho</TableHead>
                  <TableHead className="w-32">So luong nhan</TableHead>
                  <TableHead className="w-12">Du</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivableItems.map((item) => (
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
                        onChange={(event) =>
                          onReceiveQuantitiesChange({
                            ...receiveQuantities,
                            [item.id]: Math.min(
                              Number(event.target.value || 0),
                              item.pendingQty
                            ),
                          })
                        }
                        className="w-24"
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {receivableItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground py-6 text-center"
                    >
                      Batch nay da duoc nhap kho day du.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>

            <div className="space-y-2">
              <Label>Ghi chu nhap kho</Label>
              <Textarea
                placeholder="Nhap ghi chu ve tinh trang hang hoa, chung tu..."
                value={receiveNotes}
                onChange={(event) => onReceiveNotesChange(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {errorMessage ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}
          </div>
        ) : null}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Huy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting || totalReceiving <= 0}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Dang luu...' : 'Xac nhan nhap kho'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
