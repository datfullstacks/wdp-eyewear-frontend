import {
  Clock,
  CreditCard,
  CheckCircle,
  Eye,
  PackageCheck,
  TrendingDown,
} from 'lucide-react';

import { StatCard } from '@/components/molecules/StatCard';
import { formatCurrency } from '@/types/refund';

interface RefundStatsGridProps {
  stats: {
    open: number;
    waitingCustomer: number;
    escalated: number;
    approved: number;
    returnPending: number;
    processing: number;
    completed: number;
    totalAmount: number;
  };
  scope?: 'sale' | 'manager' | 'operation';
}

export const RefundStatsGrid = ({
  stats,
  scope = 'sale',
}: RefundStatsGridProps) => {
  const items =
    scope === 'operation'
      ? [
          {
            label: 'San sang payout',
            value: String(stats.approved),
            icon: CreditCard,
            isAmount: false,
          },
          {
            label: 'Cho nhan hang',
            value: String(stats.returnPending),
            icon: PackageCheck,
            isAmount: false,
          },
          {
            label: 'Dang payout',
            value: String(stats.processing),
            icon: Clock,
            isAmount: false,
          },
          {
            label: 'Hoan thanh',
            value: String(stats.completed),
            icon: CheckCircle,
            isAmount: false,
          },
          {
            label: 'Tong can chi',
            value: formatCurrency(stats.totalAmount),
            icon: TrendingDown,
            isAmount: true,
          },
        ]
      : [
          {
            label: 'Dang xu ly',
            value: String(stats.open),
            icon: Clock,
            isAmount: false,
          },
          {
            label: 'Cho KH bo sung',
            value: String(stats.waitingCustomer),
            icon: Eye,
            isAmount: false,
          },
          {
            label: 'Can manager',
            value: String(stats.escalated),
            icon: CreditCard,
            isAmount: false,
          },
          {
            label: 'Da duyet',
            value: String(stats.approved),
            icon: CreditCard,
            isAmount: false,
          },
          {
            label: 'Hoan thanh',
            value: String(stats.completed),
            icon: CheckCircle,
            isAmount: false,
          },
          {
            label: 'Tong can hoan',
            value: formatCurrency(stats.totalAmount),
            icon: TrendingDown,
            isAmount: true,
          },
        ];

  return (
    <div
      className={`grid grid-cols-2 gap-2 md:grid-cols-3 ${scope === 'operation' ? 'xl:grid-cols-5' : 'xl:grid-cols-6'}`}
    >
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
