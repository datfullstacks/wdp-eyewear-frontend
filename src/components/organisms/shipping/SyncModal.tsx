import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw } from 'lucide-react';

interface SyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSync: () => void;
}

const carrierList = ['GHN', 'GHTK', 'Viettel Post'];

export const SyncModal = ({ open, onOpenChange, onSync }: SyncModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đồng bộ trạng thái vận đơn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Chọn hãng vận chuyển để đồng bộ trạng thái mới nhất:
          </p>
          <div className="space-y-3">
            {carrierList.map((carrier) => (
              <div
                key={carrier}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Checkbox id={carrier} />
                <label
                  htmlFor={carrier}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {carrier}
                </label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onSync}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Đồng bộ ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
