import { RefreshCcw } from 'lucide-react';
import { Badge, Button } from '@/components/atoms';
import type { RealtimeOrderStatuses } from '@/types/saleCheckout';

interface RealtimeStatusCardProps {
  statuses: RealtimeOrderStatuses;
  isPolling: boolean;
  pollingError: string;
  pollingTimedOut: boolean;
  canPoll: boolean;
  onPollAgain: () => void;
  onStopPolling: () => void;
}

function statusBadgeVariant(status: string):
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary' {
  if (status === 'pending') return 'warning';
  if (status === 'paid' || status === 'confirmed') return 'success';
  if (status === 'failed' || status === 'cancelled' || status === 'void') return 'danger';
  if (status === 'issued') return 'info';
  return 'secondary';
}

export const RealtimeStatusCard: React.FC<RealtimeStatusCardProps> = ({
  statuses,
  isPolling,
  pollingError,
  pollingTimedOut,
  canPoll,
  onPollAgain,
  onStopPolling,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Trạng thái realtime</h2>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Payment Status</span>
          <Badge variant={statusBadgeVariant(statuses.paymentStatus)}>{statuses.paymentStatus}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Order Status</span>
          <Badge variant={statusBadgeVariant(statuses.orderStatus)}>{statuses.orderStatus}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Invoice Status</span>
          <Badge variant={statusBadgeVariant(statuses.invoiceStatus)}>{statuses.invoiceStatus}</Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={!canPoll || isPolling} onClick={onPollAgain}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Poll lại
        </Button>
        <Button type="button" variant="ghost" disabled={!isPolling} onClick={onStopPolling}>
          Dừng polling
        </Button>
      </div>

      <p className="mt-3 text-xs text-gray-600">Poll mỗi 3s, timeout 10 phút.</p>

      {isPolling && <p className="mt-2 text-sm text-amber-700">Đang polling trạng thái đơn hàng...</p>}
      {pollingError && <p className="mt-2 text-sm text-red-700">{pollingError}</p>}
      {pollingTimedOut && (
        <p className="mt-2 text-sm text-amber-700">
          Polling timeout. Vui lòng bấm "Poll lại" để kiểm tra trạng thái mới nhất.
        </p>
      )}
    </div>
  );
};
