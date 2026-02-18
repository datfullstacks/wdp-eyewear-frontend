import {
  Clock,
  FileText,
  RefreshCw,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import { ReturnRequest } from '@/types/returns';
import { calculateReturnStats, calculateTypeStats } from '@/data/returnsData';
import { StatCard } from '@/components/molecules/StatCard';

interface ReturnsStatsGridProps {
  requests: ReturnRequest[];
}

export const ReturnsStatsGrid = ({ requests }: ReturnsStatsGridProps) => {
  const stats = calculateReturnStats(requests);
  const typeStats = calculateTypeStats(requests);

  return (
    <div className="grid grid-cols-5 gap-3">
      <StatCard
        icon={Clock}
        title="Chờ xử lý"
        value={stats.pending.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        trendClassName="text-xs"
        showIcon={false}
        inline
      />
      <StatCard
        icon={FileText}
        title="Đang xem xét"
        value={stats.reviewing.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={RefreshCw}
        title="Đang xử lý"
        value={stats.processing.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={CheckCircle}
        title="Hoàn thành"
        value={stats.completed.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={RotateCcw}
        title="Đổi hàng"
        value={typeStats.exchange.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
    </div>
  );
};
