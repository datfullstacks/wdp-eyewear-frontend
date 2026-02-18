import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RefundRequest,
  statusConfig,
  methodConfig,
  formatCurrency,
} from '@/types/refund';

interface RefundDetailModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RefundDetailModal = ({
  refund,
  open,
  onOpenChange,
}: RefundDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[92vw] max-h-[80vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Chi tiết yêu cầu hoàn tiền {refund?.id}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Thông tin chi tiết về yêu cầu hoàn tiền
          </DialogDescription>
        </DialogHeader>
        {refund && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground/80">Mã đơn hàng</Label>
                <p className="font-medium">{refund.orderId}</p>
              </div>
              <div>
                <Label className="text-foreground/80">Trạng thái</Label>
                <div className="mt-1">
                  <StatusBadge status={statusConfig[refund.status].type}>
                    {statusConfig[refund.status].label}
                  </StatusBadge>
                </div>
              </div>
              <div>
                <Label className="text-foreground/80">Khách hàng</Label>
                <p className="font-medium">{refund.customerName}</p>
                <p className="text-foreground/70 text-sm">
                  {refund.customerPhone}
                </p>
              </div>
              <div>
                <Label className="text-foreground/80">Số tiền hoàn</Label>
                <p className="text-destructive text-lg font-bold">
                  {formatCurrency(refund.amount)}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-foreground/80">Lý do hoàn tiền</Label>
              <p className="bg-muted/30 mt-1 rounded-lg p-3">
                {refund.reason}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground/80">
                  Phương thức hoàn tiền
                </Label>
                <p className="font-medium">
                  {methodConfig[refund.method].label}
                </p>
              </div>
              <div>
                <Label className="text-foreground/80">
                  Ngày tạo yêu cầu
                </Label>
                <p className="font-medium">{refund.createdAt}</p>
              </div>
            </div>

            {refund.bankInfo && (
              <div className="bg-muted/30 rounded-lg p-3">
                <Label className="text-foreground/80">
                  Thông tin tài khoản ngân hàng
                </Label>
                <div className="mt-2 space-y-1">
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
                </div>
              </div>
            )}

            {refund.notes && (
              <div>
                <Label className="text-foreground/80">Ghi chú</Label>
                <p className="bg-muted/30 mt-1 rounded-lg p-3">
                  {refund.notes}
                </p>
              </div>
            )}

            {refund.processedAt && (
              <div>
                <Label className="text-foreground/80">Ngày xử lý</Label>
                <p className="font-medium">{refund.processedAt}</p>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
