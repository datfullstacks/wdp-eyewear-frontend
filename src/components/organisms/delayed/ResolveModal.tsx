import { useState } from 'react';

import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DelayedOrder, ResolveAction } from '@/types/delayed';
import { resolveActionOptions } from '@/data/delayedData';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/atoms';

interface ResolveModalProps {
  order: DelayedOrder | null;
  onClose: () => void;
  onSubmit: (orderId: string, action: ResolveAction, note: string) => void;
}

export const ResolveModal = ({
  order,
  onClose,
  onSubmit,
}: ResolveModalProps) => {
  const [action, setAction] = useState<ResolveAction | ''>('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (order && action) {
      onSubmit(order.id, action as ResolveAction, note);
      setAction('');
      setNote('');
      onClose();
    }
  };

  const handleClose = () => {
    setAction('');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <CheckCircle className="text-success h-5 w-5" />
            Xử lý cảnh báo - {order?.id}
          </DialogTitle>
          <DialogDescription className="text-foreground/80">
            Chọn hành động để xử lý và đóng cảnh báo này
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/20 p-4">
            <label className="text-foreground text-sm font-semibold">
              Hành động xử lý *
            </label>
            <Select
              value={action}
              onValueChange={(v) => setAction(v as ResolveAction)}
            >
              <SelectTrigger className="mt-2 border-foreground/30 bg-background">
                <SelectValue placeholder="Chọn hành động..." />
              </SelectTrigger>
              <SelectContent>
                {resolveActionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border bg-muted/20 p-4">
            <label className="text-foreground text-sm font-semibold">
              Ghi chú xử lý
            </label>
            <Textarea
              placeholder="Mô tả chi tiết cách xử lý..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 bg-background text-foreground placeholder:text-muted-foreground"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!action}
            className="bg-success hover:bg-success/90"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Hoàn tất xử lý
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
