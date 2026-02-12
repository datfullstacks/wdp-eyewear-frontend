import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { XCircle, AlertTriangle } from 'lucide-react';
import { ReturnRequest, typeLabels, rejectReasons } from '@/types/returns';

interface ReturnRejectModalProps {
  request: ReturnRequest | null;
  onClose: () => void;
  onReject: (reason: string) => void;
}

export const ReturnRejectModal = ({
  request,
  onClose,
  onReject,
}: ReturnRejectModalProps) => {
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    onReject(rejectReason);
    setRejectReason('');
  };

  const handleClose = () => {
    setRejectReason('');
    onClose();
  };

  return (
    <Dialog open={!!request} onOpenChange={handleClose}>
      <DialogContent className="w-[92vw] max-w-md p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <XCircle className="text-destructive h-5 w-5" />
            Từ chối yêu cầu
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Vui lòng nhập lý do từ chối yêu cầu {request?.id}
          </DialogDescription>
        </DialogHeader>
        {request && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-foreground/70">Khách hàng:</span>
                  <span className="ml-2 font-medium">{request.customer}</span>
                </div>
                <div>
                  <span className="text-foreground/70">Loại:</span>
                  <span className="ml-2 font-medium">
                    {typeLabels[request.type]}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-foreground/80" htmlFor="rejectReason">
                Lý do từ chối *
              </Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Chọn lý do" />
                </SelectTrigger>
                <SelectContent>
                  {rejectReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-destructive mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-destructive font-medium">Lưu ý</p>
                  <p className="text-foreground/80 mt-1 text-sm">
                    Khách hàng sẽ được thông báo về việc từ chối này qua
                    SMS/Email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!rejectReason}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Xác nhận từ chối
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
