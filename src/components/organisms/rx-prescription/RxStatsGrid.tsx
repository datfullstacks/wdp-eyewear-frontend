import { StatCard } from '@/components/molecules/StatCard';
import { Glasses, Clock, Package, Cog, Truck } from 'lucide-react';

interface RxStats {
  total: number;
  pendingReview: number;
  waitingLab: number;
  labInProgress: number;
  readyForShipping: number;
}

interface RxStatsGridProps {
  stats: RxStats;
}

export const RxStatsGrid = ({ stats }: RxStatsGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-3">
      <StatCard
        icon={Glasses}
        title="Tong don ops Rx"
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
        title="Cho duyet Rx"
        value={stats.pendingReview.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Package}
        title="Cho vao gia cong"
        value={stats.waitingLab.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Cog}
        title="Dang gia cong"
        value={stats.labInProgress.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Truck}
        title="San sang giao van"
        value={stats.readyForShipping.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
    </div>
  );
};
