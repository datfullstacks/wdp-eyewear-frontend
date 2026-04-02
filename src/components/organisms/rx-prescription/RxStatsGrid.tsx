import { StatCard } from '@/components/molecules/StatCard';
import {
  CheckCircle2,
  Clock,
  Cog,
  Glasses,
  Package,
  Truck,
} from 'lucide-react';

interface RxStats {
  total: number;
  pendingReview: number;
  waitingLab: number;
  labInProgress: number;
  readyForShipping: number;
  shippingActive: number;
  closedFlow: number;
}

interface RxStatsGridProps {
  stats: RxStats;
}

export const RxStatsGrid = ({ stats }: RxStatsGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      <StatCard
        icon={Glasses}
        title="Tổng đơn Rx"
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
        title="Chờ duyệt Rx"
        value={stats.pendingReview.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Package}
        title="Chờ vào gia công"
        value={stats.waitingLab.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Cog}
        title="Đang gia công"
        value={stats.labInProgress.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Truck}
        title="Đóng gói / chờ vận đơn"
        value={stats.readyForShipping.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Truck}
        title="Đang giao / GHN"
        value={stats.shippingActive.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={CheckCircle2}
        title="Đã giao / đã hoàn"
        value={stats.closedFlow.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
    </div>
  );
};
