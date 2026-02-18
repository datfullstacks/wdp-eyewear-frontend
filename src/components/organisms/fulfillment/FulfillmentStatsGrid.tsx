import { StatCard } from '@/components/molecules/StatCard';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

interface FulfillmentStats {
  waitingToShip: number;
  pending: number;
  inTransit: number;
  delivered: number;
  failed: number;
}

interface FulfillmentStatsGridProps {
  stats: FulfillmentStats;
}

export const FulfillmentStatsGrid = ({ stats }: FulfillmentStatsGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-3">
      <StatCard
        icon={Package}
        title="Chờ tạo đơn"
        value={stats.waitingToShip.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        trendClassName="text-xs"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Clock}
        title="Chờ lấy hàng"
        value={stats.pending.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Truck}
        title="Đang vận chuyển"
        value={stats.inTransit.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={CheckCircle}
        title="Đã giao"
        value={stats.delivered.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={XCircle}
        title="Giao thất bại"
        value={stats.failed.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
    </div>
  );
};
