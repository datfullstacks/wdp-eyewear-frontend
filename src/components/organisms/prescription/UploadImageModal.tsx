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
            Prescription attachment
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {order?.orderId} - {order?.customer}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-foreground/30 rounded-lg border-2 border-dashed p-8 text-center">
            <FileUp className="text-foreground/70 mx-auto mb-2 h-10 w-10" />
            <p className="text-foreground/80 text-sm">
              This screen no longer pretends to upload files into local-only state.
            </p>
            <p className="text-foreground/70 mt-1 text-xs">
              The current backend support contract does not expose attachment upload for
              prescription clarification, so the action stays disabled.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled>
            <Upload className="mr-2 h-4 w-4" />
            Upload unavailable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
