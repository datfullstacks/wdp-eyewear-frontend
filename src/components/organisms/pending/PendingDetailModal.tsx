import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PendingOrder } from '@/types/pending';
import { PendingDetailContent } from './PendingDetailContent';

interface PendingDetailModalProps {
  scope?: 'sale' | 'manager';
  order: PendingOrder | null;
  onClose: () => void;
  onProcess: (order: PendingOrder) => void;
  onReject: (order: PendingOrder) => void;
  onEscalate: (order: PendingOrder) => void;
  onSendBack: (order: PendingOrder) => void;
}

export const PendingDetailModal = ({
  scope = 'sale',
  order,
  onClose,
  onProcess,
  onReject,
  onEscalate,
  onSendBack,
}: PendingDetailModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[85vh] w-[96vw] max-w-3xl flex-col overflow-y-auto border-0 p-0 shadow-2xl [&>button.absolute]:bg-slate-950/10 [&>button.absolute]:text-slate-950/80 [&>button.absolute]:hover:bg-slate-950/15 [&>button.absolute]:hover:text-slate-950">
        <PendingDetailContent
          scope={scope}
          order={order}
          onReject={(nextOrder) => {
            onClose();
            onReject(nextOrder);
          }}
          onEscalate={(nextOrder) => {
            onClose();
            onEscalate(nextOrder);
          }}
          onSendBack={(nextOrder) => {
            onClose();
            onSendBack(nextOrder);
          }}
          onProcess={(nextOrder) => {
            onClose();
            onProcess(nextOrder);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
