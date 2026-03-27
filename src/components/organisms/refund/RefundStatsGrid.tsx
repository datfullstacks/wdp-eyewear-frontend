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
            label: 'Sẵn sàng payout',
            value: String(stats.approved),
            icon: CreditCard,
            isAmount: false,
          },
          {
            label: 'Chờ nhận hàng',
            value: String(stats.returnPending),
            icon: PackageCheck,
            isAmount: false,
          },
          {
            label: 'Đang payout',
            value: String(stats.processing),
            icon: Clock,
            isAmount: false,
          },
          {
            label: 'Hoàn thành',
            value: String(stats.completed),
            icon: CheckCircle,
            isAmount: false,
          },
          {
            label: 'Tổng cần chi',
            value: formatCurrency(stats.totalAmount),
            icon: TrendingDown,
            isAmount: true,
          },
        ]
      : [
          {
            label: 'Đang xử lý',
            value: String(stats.open),
            icon: Clock,
            isAmount: false,
          },
          {
            label: 'Chờ KH bổ sung',
            value: String(stats.waitingCustomer),
            icon: Eye,
            isAmount: false,
          },
          {
            label: 'Cần quản lý',
            value: String(stats.escalated),
            icon: CreditCard,
            isAmount: false,
          },
          {
            label: 'Đã duyệt',
            value: String(stats.approved),
            icon: CreditCard,
            isAmount: false,
          },
          {
            label: 'Hoàn thành',
            value: String(stats.completed),
            icon: CheckCircle,
            isAmount: false,
          },
          {
            label: 'Tổng cần hoàn',
            value: formatCurrency(stats.totalAmount),
            icon: TrendingDown,
            isAmount: true,
          },
        ];
  const visibleItems =
    scope === 'operation'
      ? [
          {
            label: 'Chờ nhận hàng',
            value: String(stats.returnPending),
            icon: PackageCheck,
            isAmount: false,
          },
          {
            label: 'Tổng cần kiểm tra',
            value: formatCurrency(stats.totalAmount),
            icon: TrendingDown,
            isAmount: true,
          },
        ]
      : items;

  return (
    <div
      className={`grid grid-cols-2 gap-2 md:grid-cols-3 ${scope === 'operation' ? 'xl:grid-cols-2' : 'xl:grid-cols-6'}`}
    >
      {visibleItems.map((item) => (
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
