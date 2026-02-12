import { StatCard } from '@/components/molecules/StatCard';
import { AlertOctagon, AlertTriangle, Clock, FileWarning } from 'lucide-react';

interface DelayedStatsGridProps {
  stats: {
    critical: number;
    high: number;
    medium: number;
    slaBreached: number;
  };
}

export const DelayedStatsGrid = ({ stats }: DelayedStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Nghiêm trọng"
        value={stats.critical.toString()}
        icon={AlertOctagon}
        iconColor="text-destructive"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl text-destructive"
        showIcon={false}
        inline
      />
      <StatCard
        title="Mức độ cao"
        value={stats.high.toString()}
        icon={AlertTriangle}
        iconColor="text-warning"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl text-warning"
        showIcon={false}
        inline
      />
      <StatCard
        title="Trung bình"
        value={stats.medium.toString()}
        icon={Clock}
        iconColor="text-primary"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl text-primary"
        showIcon={false}
        inline
      />
      <StatCard
        title="Vi phạm SLA"
        value={stats.slaBreached.toString()}
        icon={FileWarning}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
    </div>
  );
};

