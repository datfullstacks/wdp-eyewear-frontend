import { StatCard } from '@/components/molecules/StatCard';
import {
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Banknote,
} from 'lucide-react';

interface TrackingStats {
  picking: number;
  inTransit: number;
  delivered: number;
  failed: number;
  pendingCOD: string;
}

interface TrackingStatsGridProps {
  stats: TrackingStats;
}

export const TrackingStatsGrid = ({ stats }: TrackingStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5">
      <StatCard
        title="Chờ lấy"
        value={stats.picking.toString()}
        icon={Clock}
        className="p-2"
        titleClassName="text-foreground/80 text-xs"
        valueClassName="text-xl"
        showIcon={false}
        inline
      />
      <StatCard
        title="Đang giao"
        value={stats.inTransit.toString()}
        icon={Truck}
        className="p-2"
        titleClassName="text-foreground/80 text-xs"
        valueClassName="text-xl"
        showIcon={false}
        inline
      />
      <StatCard
        title="Đã giao"
        value={stats.delivered.toString()}
        icon={CheckCircle2}
        className="p-2"
        titleClassName="text-foreground/80 text-xs"
        valueClassName="text-xl"
        showIcon={false}
        inline
      />
      <StatCard
        title="Thất bại/Hoàn"
        value={stats.failed.toString()}
        icon={AlertTriangle}
        className="p-2"
        titleClassName="text-foreground/80 text-xs"
        valueClassName="text-xl"
        showIcon={false}
        inline
      />
      <StatCard
        title="COD ch? TT"
        value={stats.pendingCOD}
        icon={Banknote}
        className="p-2"
        titleClassName="text-foreground/80 text-xs"
        valueClassName="text-xl"
        showIcon={false}
        inline
      />
    </div>
  );
};
