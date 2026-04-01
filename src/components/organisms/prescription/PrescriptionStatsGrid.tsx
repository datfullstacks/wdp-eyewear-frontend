import { ClipboardList, AlertTriangle, Clock, Send } from 'lucide-react';

import { StatCard } from '@/components/molecules/StatCard';

interface PrescriptionStats {
  total: number;
  needsReview: number;
  needsCustomerContact: number;
  waitingCustomerResponse: number;
  customerResponded: number;
  escalated: number;
}

interface PrescriptionStatsGridProps {
  stats: PrescriptionStats;
}

export const PrescriptionStatsGrid = ({
  stats,
}: PrescriptionStatsGridProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
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
        title="Cần kiểm tra"
        value={stats.needsReview.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Send}
        title="Cần liên hệ"
        value={stats.needsCustomerContact.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={Clock}
        title="Chờ phản hồi"
        value={stats.waitingCustomerResponse.toString()}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        icon={ClipboardList}
        title="Đã phản hồi"
        value={stats.customerResponded.toString()}
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
