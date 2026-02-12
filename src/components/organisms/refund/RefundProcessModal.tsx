import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreditCard } from 'lucide-react';
import { RefundRequest, methodConfig, formatCurrency } from '@/types/refund';
import { Input } from '@/components/atoms';

interface RefundProcessModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RefundProcessModal = ({
  refund,
  open,
  onOpenChange,
}: RefundProcessModalProps) => {
  const [processNote, setProcessNote] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Thực hiện hoàn tiền
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Xử lý hoàn tiền cho yêu cầu {refund?.id}
          </DialogDescription>
        </DialogHeader>
        {refund && (
          <div className="space-y-4">
            <div className="bg-primary/10 border-primary/20 rounded-lg border p-3">
              <p className="mb-2 font-medium">Thông tin hoàn tiền</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-foreground/70">Số tiền:</span>{' '}
                  <span className="font-bold">
                    {formatCurrency(refund.amount)}
                  </span>
                </p>
                <p>
                  <span className="text-foreground/70">Phương thức:</span>{' '}
                  {methodConfig[refund.method].label}
                </p>
                {refund.bankInfo && (
                  <>
                    <p>
                      <span className="text-foreground/70">Ngân hàng:</span>{' '}
                      {refund.bankInfo.bankName}
                    </p>
                    <p>
                      <span className="text-foreground/70">Số TK:</span>{' '}
                      {refund.bankInfo.accountNumber}
                    </p>
                    <p>
                      <span className="text-foreground/70">Chủ TK:</span>{' '}
                      {refund.bankInfo.accountHolder}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div>
              <Label className="text-foreground/80">Mã giao dịch hoàn tiền</Label>
              <Input placeholder="Nhập mã giao dịch..." className="mt-1" />
            </div>
            <div>
              <Label className="text-foreground/80">Ghi chú xử lý</Label>
              <Textarea
                placeholder="Nhập ghi chú về quá trình hoàn tiền..."
                value={processNote}
                onChange={(e) => setProcessNote(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Xác nhận đã hoàn tiền
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
