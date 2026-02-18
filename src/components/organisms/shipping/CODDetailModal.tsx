import { CODReconciliation, CODStatus } from '@/types/shipping';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

interface CODDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cod: CODReconciliation | null;
}

const codStatusLabels: Record<
  CODStatus,
  {
    label: string;
    status: 'success' | 'warning' | 'error' | 'info' | 'default';
  }
> = {
  pending: { label: 'Chờ đối soát', status: 'warning' },
  confirmed: { label: 'Đã xác nhận', status: 'info' },
  paid: { label: 'Đã thanh toán', status: 'success' },
  disputed: { label: 'Có tranh chấp', status: 'error' },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const CODDetailModal = ({
  open,
  onOpenChange,
  cod,
}: CODDetailModalProps) => {
  if (!cod) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết đối soát COD</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
            <span className="text-muted-foreground">Hãng vận chuyển</span>
            <span className="font-medium">{cod.carrier}</span>
          </div>
          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
            <span className="text-muted-foreground">Kỳ đối soát</span>
            <span className="font-medium">{cod.period}</span>
          </div>
          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
            <span className="text-muted-foreground">Trạng thái</span>
            <StatusBadge status={codStatusLabels[cod.status].status}>
              {codStatusLabels[cod.status].label}
            </StatusBadge>
          </div>
          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số đơn hàng</span>
              <span className="font-medium">{cod.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng COD thu hộ</span>
              <span className="text-primary font-medium">
                {formatCurrency(cod.totalCOD)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span className="text-destructive font-medium">
                -{formatCurrency(cod.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-medium">Thực nhận</span>
              <span className="text-success text-lg font-bold">
                {formatCurrency(cod.netAmount)}
              </span>
            </div>
          </div>
          {cod.paidAt && (
            <div className="bg-success/10 flex items-center justify-between rounded-lg p-3">
              <span className="text-muted-foreground">Ngày thanh toán</span>
              <span className="text-success font-medium">{cod.paidAt}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {cod.status === 'pending' && (
            <Button>
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác nhận đối soát
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
