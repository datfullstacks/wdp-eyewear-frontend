import { FileUp, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SupplementOrder } from '@/types/prescription';

interface UploadImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: SupplementOrder | null;
}

export function UploadImageModal({
  open,
  onOpenChange,
  order,
}: UploadImageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Ảnh toa đính kèm
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {order?.orderId} - {order?.customer}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-foreground/30 rounded-lg border-2 border-dashed p-8 text-center">
            <FileUp className="text-foreground/70 mx-auto mb-2 h-10 w-10" />
            <p className="text-foreground/80 text-sm">
              Màn này không còn giả lập upload ảnh chỉ trong local state.
            </p>
            <p className="text-foreground/70 mt-1 text-xs">
              Backend support hiện chưa mở API upload ảnh đính kèm cho luồng bổ
              sung toa, nên hành động này đang bị khóa.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button disabled>
            <Upload className="mr-2 h-4 w-4" />
            Chưa khả dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
