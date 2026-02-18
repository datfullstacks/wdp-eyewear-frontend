import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DelayedOrder } from '@/types/delayed';
import { ArrowUpRight } from 'lucide-react';

interface EscalateModalProps {
  order: DelayedOrder | null;
  onClose: () => void;
  onSubmit: (orderId: string, note: string) => void;
}

export const EscalateModal = ({
  order,
  onClose,
  onSubmit,
}: EscalateModalProps) => {
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (order && note.trim()) {
      onSubmit(order.id, note);
      setNote('');
      onClose();
    }
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="text-warning h-5 w-5" />
            Leo thang - {order?.id}
          </DialogTitle>
          <DialogDescription>
            Leo thang đơn hàng lên cấp quản lý để xử lý khẩn cấp
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-warning/10 border-warning/20 rounded-lg border p-4">
            <p className="text-warning-foreground text-sm">
              <strong>Lưu ý:</strong> Leo thang sẽ gửi thông báo đến quản lý và
              ghi nhận vào lịch sử đơn hàng.
            </p>
          </div>
          <div>
            <label className="text-foreground text-sm font-medium">
              Lý do leo thang *
            </label>
            <Textarea
              placeholder="Mô tả lý do cần leo thang đơn hàng này..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!note.trim()}>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Xác nhận leo thang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
