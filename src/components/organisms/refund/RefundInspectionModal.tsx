import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, PackageCheck } from 'lucide-react';

import { Input } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefundRequest, formatCurrency } from '@/types/refund';

interface RefundInspectionModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'pass' | 'fail';
  isSubmitting?: boolean;
  onSubmit: (payload: {
    note: string;
    returnCarrier: string;
    returnShipmentCode: string;
  }) => Promise<void> | void;
}

export const RefundInspectionModal = ({
  refund,
  open,
  onOpenChange,
  mode,
  isSubmitting = false,
  onSubmit,
}: RefundInspectionModalProps) => {
  const [note, setNote] = useState('');
  const [returnCarrier, setReturnCarrier] = useState('');
  const [returnShipmentCode, setReturnShipmentCode] = useState('');

  useEffect(() => {
    if (!open) {
      setNote('');
      setReturnCarrier('');
      setReturnShipmentCode('');
      return;
    }

    setReturnCarrier(refund?.returnCarrier || '');
    setReturnShipmentCode(refund?.returnShipmentCode || '');
  }, [open, refund]);

  const amount = useMemo(() => {
    if (!refund) return 0;
    return (
      refund.approvedBreakdown.total ||
      refund.requestedBreakdown.total ||
      refund.amount
    );
  }, [refund]);

  const isFailMode = mode === 'fail';
  const title = isFailMode ? 'QC fail hàng hoàn' : 'Xác nhận nhận hàng hoàn';
  const description = isFailMode
    ? `Gửi case ${refund?.id || ''} về lại reviewing sau khi inspection không đạt.`
    : `Xác nhận đã nhận hàng và inspection pass cho ${refund?.id || ''}.`;

  const handleSubmit = async () => {
    await onSubmit({
      note: note.trim(),
      returnCarrier: returnCarrier.trim(),
      returnShipmentCode: returnShipmentCode.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-md p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {description}
          </DialogDescription>
        </DialogHeader>

        {refund && (
          <div className="space-y-4">
            <div
              className={
                isFailMode
                  ? 'rounded-lg border border-amber-200 bg-amber-50 p-3'
                  : 'rounded-lg border border-blue-200 bg-blue-50 p-3'
              }
            >
              <div
                className={
                  isFailMode
                    ? 'mb-2 flex items-center gap-2 text-amber-700'
                    : 'mb-2 flex items-center gap-2 text-blue-700'
                }
              >
                {isFailMode ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <PackageCheck className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {isFailMode ? 'Hàng hoàn cần review lại' : 'Hàng hoàn đã được tiếp nhận'}
                </span>
              </div>
              <p className="text-sm text-slate-700">
                Số tiền liên quan:{' '}
                <span className="font-bold">{formatCurrency(amount)}</span>
              </p>
              <p className="text-sm text-slate-700">
                Khách hàng: {refund.customerName} - {refund.customerPhone}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-foreground/80">Đơn vị vận chuyển trả hàng</Label>
                <Input
                  value={returnCarrier}
                  onChange={(event) => setReturnCarrier(event.target.value)}
                  placeholder="ghn / khách tự gửi..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Mã vận đơn trả</Label>
                <Input
                  value={returnShipmentCode}
                  onChange={(event) => setReturnShipmentCode(event.target.value)}
                  placeholder="Nhập mã vận đơn trả nếu có..."
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground/80">
                {isFailMode ? 'Lý do QC fail' : 'Ghi chú inspection'}
              </Label>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={
                  isFailMode
                    ? 'Mô tả tình trạng nhận về không đạt, sai hàng, thiếu hàng...'
                    : 'Nhập ghi chú tiếp nhận / inspection nếu cần...'
                }
                className="mt-1"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || (isFailMode && !note.trim())}
            className={isFailMode ? 'bg-amber-600 text-white hover:bg-amber-700' : undefined}
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : isFailMode
                ? 'Trả case về reviewing'
                : 'Xác nhận nhận hàng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
