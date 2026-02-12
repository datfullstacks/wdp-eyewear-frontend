import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { ReturnRequest, formatCurrency } from '@/types/returns';

interface ReturnApproveModalProps {
  request: ReturnRequest | null;
  onClose: () => void;
  onApprove: () => void;
}

export const ReturnApproveModal = ({
  request,
  onClose,
  onApprove,
}: ReturnApproveModalProps) => {
  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-md p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <CheckCircle className="text-success h-5 w-5" />
            Duyệt yêu cầu
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Xác nhận duyệt yêu cầu{' '}
            {request?.type === 'exchange'
              ? 'đổi hàng'
              : request?.type === 'return'
                ? 'trả hàng'
                : 'bảo hành'}
            ?
          </DialogDescription>
        </DialogHeader>
        {request && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-foreground/70">Mã yêu cầu:</span>
                  <span className="ml-2 font-medium">{request.id}</span>
                </div>
                <div>
                  <span className="text-foreground/70">Khách hàng:</span>
                  <span className="ml-2 font-medium">{request.customer}</span>
                </div>
                <div>
                  <span className="text-foreground/70">Giá trị:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(request.totalValue)}
                  </span>
                </div>
                <div>
                  <span className="text-foreground/70">Lý do:</span>
                  <span className="ml-2 font-medium">{request.reason}</span>
                </div>
              </div>
            </div>

            <div className="bg-success/10 border-success/20 rounded-lg border p-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-success mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-success font-medium">
                    Yêu cầu đủ điều kiện xử lý
                  </p>
                  <p className="text-foreground/80 mt-1 text-sm">
                    Sau khi duyệt, yêu cầu sẽ chuyển sang bước xử lý tiếp theo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={onApprove}
            className="bg-success hover:bg-success/90"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Xác nhận duyệt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
