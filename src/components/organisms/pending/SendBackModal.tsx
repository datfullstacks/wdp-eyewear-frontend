import { Send } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { PendingOrder } from '@/types/pending';

interface SendBackModalProps {
  order: PendingOrder | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const SendBackModal = ({
  order,
  onClose,
  onConfirm,
}: SendBackModalProps) => {
  const [reason, setReason] = useState('');

  if (!order) return null;

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <Dialog open={!!order} onOpenChange={handleClose}>
      <DialogContent className="w-[92vw] max-w-md p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle>Tra lai sale</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-foreground/90">
            Tra lai don <strong>{order.id}</strong> cho sale de xu ly tiep?
          </p>

          <div>
            <label className="text-sm font-medium text-foreground/80">
              Ghi chu cho sale *
            </label>
            <Textarea
              placeholder="Nhap ly do tra lai sale..."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Huy
            </Button>
            <Button onClick={handleConfirm} disabled={!reason.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Xac nhan tra lai
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
