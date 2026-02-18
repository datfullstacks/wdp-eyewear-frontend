import { StatCard } from '@/components/molecules/StatCard';
import { formatCurrency } from '@/types/refund';
import {
  Clock,
  Eye,
  CreditCard,
  CheckCircle,
  TrendingDown,
} from 'lucide-react';

interface RefundStatsGridProps {
  stats: {
    pending: number;
    reviewing: number;
    processing: number;
    completed: number;
    totalAmount: number;
  };
}

export const RefundStatsGrid = ({ stats }: RefundStatsGridProps) => {
  const items = [
    {
      label: 'Chờ xử lý',
      value: String(stats.pending),
      icon: Clock,
      colorClass: 'bg-warning/10 text-warning',
    },
    {
      label: 'Đang xem xét',
      value: String(stats.reviewing),
      icon: Eye,
      colorClass: 'bg-primary/10 text-primary',
    },
    {
      label: 'Đang hoàn tiền',
      value: String(stats.processing),
      icon: CreditCard,
      colorClass: 'bg-success/10 text-success',
    },
    {
      label: 'Hoàn thành',
      value: String(stats.completed),
      icon: CheckCircle,
      colorClass: 'bg-success/10 text-success',
    },
    {
      label: 'Tổng cần hoàn',
      value: formatCurrency(stats.totalAmount),
      icon: TrendingDown,
      colorClass: 'bg-destructive/10 text-destructive',
      isAmount: true,
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((item) => (
        <StatCard
          key={item.label}
          icon={item.icon}
          title={item.label}
          value={item.value}
          className="p-2"
          titleClassName="text-foreground/85 text-xs"
          valueClassName={item.isAmount ? 'text-base' : 'text-xl'}
          trendClassName="text-xs"
          showIcon={false}
          inline
        />
      ))}
    </div>
  );
};
