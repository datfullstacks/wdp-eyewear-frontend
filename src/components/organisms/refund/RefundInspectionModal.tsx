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
  const title = isFailMode ? 'QC fail hang hoan' : 'Xac nhan nhan hang hoan';
  const description = isFailMode
    ? `Gui case ${refund?.id || ''} ve lai reviewing sau khi inspection khong dat.`
    : `Xac nhan da nhan hang va inspection pass cho ${refund?.id || ''}.`;

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
                  {isFailMode ? 'Hang hoan can review lai' : 'Hang hoan da duoc tiep nhan'}
                </span>
              </div>
              <p className="text-sm text-slate-700">
                So tien lien quan: <span className="font-bold">{formatCurrency(amount)}</span>
              </p>
              <p className="text-sm text-slate-700">
                Khach hang: {refund.customerName} - {refund.customerPhone}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-foreground/80">Don vi van chuyen tra hang</Label>
                <Input
                  value={returnCarrier}
                  onChange={(event) => setReturnCarrier(event.target.value)}
                  placeholder="ghn / khach tu gui..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Ma van don tra</Label>
                <Input
                  value={returnShipmentCode}
                  onChange={(event) => setReturnShipmentCode(event.target.value)}
                  placeholder="Nhap ma van don tra neu co..."
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground/80">
                {isFailMode ? 'Ly do QC fail' : 'Ghi chu inspection'}
              </Label>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={
                  isFailMode
                    ? 'Mo ta tinh trang nhan ve khong dat, sai hang, thieu hang...'
                    : 'Nhap ghi chu tiep nhan / inspection neu can...'
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
            Huy
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || (isFailMode && !note.trim())}
            className={isFailMode ? 'bg-amber-600 text-white hover:bg-amber-700' : undefined}
          >
            {isSubmitting
              ? 'Dang xu ly...'
              : isFailMode
                ? 'Tra case ve reviewing'
                : 'Xac nhan nhan hang'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
