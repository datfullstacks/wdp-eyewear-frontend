import { StatCard } from '@/components/molecules/StatCard';
import { Package, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { PreorderStats } from '@/types/preorder';

interface PreorderStatsGridProps {
  stats: PreorderStats;
}

export const PreorderStatsGrid = ({ stats }: PreorderStatsGridProps) => (
  <div className="grid grid-cols-5 gap-3">
    <StatCard
      title="Tổng đơn"
      value={stats.total.toString()}
      icon={Package}
      className="p-3"
      titleClassName="text-foreground/90 text-sm"
      valueClassName="text-2xl"
      trendClassName="text-xs"
      showIcon={false}
      inline
    />
    <StatCard
      title="Chờ hàng"
      value={stats.waitingStock.toString()}
      icon={Clock}
      iconColor="text-warning"
      className="p-3"
      titleClassName="text-foreground/90 text-sm"
      valueClassName="text-2xl"
      showIcon={false}
      inline
    />
    <StatCard
      title="Đủ một phần"
      value={stats.partialStock.toString()}
      icon={Package}
      iconColor="text-primary"
      className="p-3"
      titleClassName="text-foreground/90 text-sm"
      valueClassName="text-2xl"
      showIcon={false}
      inline
    />
    <StatCard
      title="Sẵn sàng"
      value={stats.ready.toString()}
      icon={CheckCircle}
      iconColor="text-success"
      className="p-3"
      titleClassName="text-foreground/90 text-sm"
      valueClassName="text-2xl"
      showIcon={false}
      inline
    />
    <StatCard
      title="Cần gấp"
      value={stats.urgent.toString()}
      icon={AlertTriangle}
      iconColor="text-destructive"
      className="p-3"
      titleClassName="text-foreground/90 text-sm"
      valueClassName="text-2xl"
      showIcon={false}
      inline
    />
  </div>
);
