import { StatCard } from '@/components/molecules/StatCard';
import {
  Glasses,
  AlertTriangle,
  Clock,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface RxStats {
  total: number;
  missing: number;
  incomplete: number;
  pendingReview: number;
  approved: number;
}

interface RxStatsGridProps {
  stats: RxStats;
}

export const RxStatsGrid = ({ stats }: RxStatsGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-3">
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
        icon={AlertTriangle}
        title="Thiếu Rx"
        value={stats.missing.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Clock}
        title="Chưa đầy đủ"
        value={stats.incomplete.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={FileText}
        title="Chờ duyệt"
        value={stats.pendingReview.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={CheckCircle2}
        title="Đã duyệt"
        value={stats.approved.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
    </div>
  );
};
