import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SupplementOrder } from '@/types/prescription';
import { FileUp, Upload } from 'lucide-react';

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
            Upload ảnh đơn thuốc
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {order?.orderId} - {order?.customer}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-foreground/30 hover:border-primary/50 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors">
            <FileUp className="text-foreground/70 mx-auto mb-2 h-10 w-10" />
            <p className="text-foreground/80 text-sm">
              Kéo thả ảnh vào đây hoặc click để chọn file
            </p>
            <p className="text-foreground/70 mt-1 text-xs">
              Hỗ trợ: JPG, PNG, PDF (tối đa 10MB)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
