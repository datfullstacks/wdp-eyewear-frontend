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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, CheckCircle, Truck } from 'lucide-react';
import { ReturnRequest, typeLabels } from '@/types/returns';

interface ReturnProcessModalProps {
  request: ReturnRequest | null;
  onClose: () => void;
  onProcess: (action: string, notes: string) => void;
}

export const ReturnProcessModal = ({
  request,
  onClose,
  onProcess,
}: ReturnProcessModalProps) => {
  const [processAction, setProcessAction] = useState('');
  const [processNotes, setProcessNotes] = useState('');

  const handleProcess = () => {
    onProcess(processAction, processNotes);
    setProcessAction('');
    setProcessNotes('');
  };

  const handleClose = () => {
    setProcessAction('');
    setProcessNotes('');
    onClose();
  };

  return (
    <Dialog open={!!request} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <RefreshCw className="text-primary h-5 w-5" />
            Xử lý yêu cầu
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Chọn hành động xử lý cho yêu cầu {request?.id}
          </DialogDescription>
        </DialogHeader>
        {request && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-foreground/70">Loại:</span>
                  <span className="ml-2 font-medium">
                    {typeLabels[request.type]}
                  </span>
                </div>
                <div>
                  <span className="text-foreground/70">Sản phẩm:</span>
                  <span className="ml-2 font-medium">
                    {request.products[0]?.name}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-foreground/80">Hành động xử lý *</Label>
              <Select value={processAction} onValueChange={setProcessAction}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Chọn hành động" />
                </SelectTrigger>
                <SelectContent>
                  {request.type === 'exchange' && (
                    <>
                      <SelectItem value="ship_new">Gửi sản phẩm mới</SelectItem>
                      <SelectItem value="waiting_return">
                        Chờ nhận hàng cũ
                      </SelectItem>
                      <SelectItem value="exchange_complete">
                        Hoàn tất đổi hàng
                      </SelectItem>
                    </>
                  )}
                  {request.type === 'return' && (
                    <>
                      <SelectItem value="waiting_return">
                        Chờ nhận hàng trả
                      </SelectItem>
                      <SelectItem value="received">Đã nhận hàng trả</SelectItem>
                      <SelectItem value="refund">Hoàn tiền</SelectItem>
                    </>
                  )}
                  {request.type === 'warranty' && (
                    <>
                      <SelectItem value="send_to_lab">
                        Gửi gia công/sửa chữa
                      </SelectItem>
                      <SelectItem value="replace">
                        Thay thế sản phẩm mới
                      </SelectItem>
                      <SelectItem value="warranty_complete">
                        Hoàn tất bảo hành
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-foreground/80" htmlFor="processNotes">
                Ghi chú xử lý
              </Label>
              <Textarea
                id="processNotes"
                value={processNotes}
                onChange={(e) => setProcessNotes(e.target.value)}
                placeholder="Nhập ghi chú về quá trình xử lý..."
                className="mt-2"
                rows={3}
              />
            </div>

            {(processAction === 'ship_new' || processAction === 'replace') && (
              <div className="bg-primary/10 border-primary/20 rounded-lg border p-3">
                <div className="flex items-start gap-3">
                  <Truck className="text-primary mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-primary font-medium">Tạo vận đơn mới</p>
                    <p className="text-foreground/80 mt-1 text-sm">
                      Hệ thống sẽ tự động tạo vận đơn giao hàng cho sản phẩm
                      thay thế.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleProcess} disabled={!processAction}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Xác nhận xử lý
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
