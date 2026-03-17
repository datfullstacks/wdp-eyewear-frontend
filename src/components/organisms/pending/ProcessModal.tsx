import { CheckCircle } from 'lucide-react';

import { formatCurrency } from '@/data/pendingData';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PENDING_ORDER_APPROVAL_MESSAGE,
  canApprovePendingOrder,
} from '@/lib/pendingOrders';
import { PendingOrder } from '@/types/pending';

interface ProcessModalProps {
  order: PendingOrder | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ProcessModal = ({
  order,
  onClose,
  onConfirm,
}: ProcessModalProps) => {
  if (!order) return null;

  const canApprove = canApprovePendingOrder(order);

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-md border-slate-200 bg-white p-4 shadow-xl sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-950">
            {'X\u00e1c nh\u1eadn x\u1eed l\u00fd \u0111\u01a1n h\u00e0ng'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-base font-medium leading-7 text-slate-800">
            {'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00e1c nh\u1eadn x\u1eed l\u00fd \u0111\u01a1n h\u00e0ng '}
            <strong className="font-semibold text-slate-950">{order.id}</strong>
            {'?'}
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-base font-semibold text-slate-950">
              {order.customer}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {order.products.length} {'s\u1ea3n ph\u1ea9m'} -{' '}
              {formatCurrency(order.total)}
            </p>
          </div>

          {!canApprove && (
            <p className="text-sm font-medium text-amber-700">
              {PENDING_ORDER_APPROVAL_MESSAGE}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-300 bg-white font-semibold text-slate-950 hover:bg-slate-100 hover:text-slate-950"
            >
              {'H\u1ee7y'}
            </Button>
            <Button disabled={!canApprove} onClick={onConfirm}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {'X\u00e1c nh\u1eadn'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
