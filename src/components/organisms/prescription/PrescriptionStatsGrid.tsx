import { StatCard } from '@/components/molecules/StatCard';
import { ClipboardList, AlertTriangle, Clock } from 'lucide-react';

interface PrescriptionStats {
  total: number;
  noPrescription: number;
  incomplete: number;
  unclear: number;
  needVerify: number;
  urgent: number;
  escalated: number;
}

interface PrescriptionStatsGridProps {
  stats: PrescriptionStats;
}

export const PrescriptionStatsGrid = ({
  stats,
}: PrescriptionStatsGridProps) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      <StatCard
        icon={ClipboardList}
        title="Tổng chờ"
        value={stats.total.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        trendClassName="text-xs"
        showIcon={false}
        inline
      />
      <StatCard
        icon={AlertTriangle}
        title="Chưa có Rx"
        value={stats.noPrescription.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Clock}
        title="Gấp"
        value={stats.urgent.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={AlertTriangle}
        title="Escalated"
        value={stats.escalated.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
    </div>
  );
};
