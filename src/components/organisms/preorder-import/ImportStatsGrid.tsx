import { Package, Clock, Truck, AlertTriangle } from 'lucide-react';
import type { PreorderImportStats } from '@/types/preorderImport';
import { StatCard } from '@/components/molecules/StatCard';

interface ImportStatsGridProps {
  stats: PreorderImportStats;
}

export const ImportStatsGrid = ({ stats }: ImportStatsGridProps) => (
  <div className="grid grid-cols-4 gap-3">
    <StatCard
      icon={Package}
      title="Tổng đợt hàng"
      value={stats.total.toString()}
      className="p-3"
      titleClassName="text-foreground/90 text-sm"
      valueClassName="text-2xl"
      trendClassName="text-xs"
      showIcon={false}
      inline
    />
    <StatCard
      icon={Clock}
      title="Chờ xử lý"
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
      icon={AlertTriangle}
      title="Trễ hàng"
      value={stats.delayed.toString()}
      className="p-3"
      titleClassName="text-foreground/90 text-sm"
      valueClassName="text-2xl"
      showIcon={false}
      inline
    />
  </div>
);
