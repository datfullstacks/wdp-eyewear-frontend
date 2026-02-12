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
import { Phone } from 'lucide-react';
import { ReturnRequest } from '@/types/returns';

interface ReturnContactModalProps {
  request: ReturnRequest | null;
  onClose: () => void;
}

export const ReturnContactModal = ({
  request,
  onClose,
}: ReturnContactModalProps) => {
  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <Phone className="text-primary h-5 w-5" />
            Liên hệ khách hàng
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Thông tin liên hệ cho yêu cầu {request?.id}
          </DialogDescription>
        </DialogHeader>
        {request && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-foreground/70">Khách hàng:</span>
                  <span className="font-medium">{request.customer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground/70">Số điện thoại:</span>
                  <span className="text-primary font-medium">
                    {request.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4">
                <div className="flex flex-col items-center gap-2">
                  <Phone className="h-6 w-6" />
                  <span>Gọi điện</span>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-4">
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                  <span>Zalo</span>
                </div>
              </Button>
            </div>

            <div>
              <Label className="text-foreground/80">Ghi chú cuộc gọi</Label>
              <Textarea
                placeholder="Nhập nội dung trao đổi với khách hàng..."
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button>Lưu ghi chú</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
