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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('manager.refunds.stats');

  const items =
    scope === 'operation'
      ? [
          {
            label: t('payoutReady'),
            value: String(stats.approved),
            icon: CreditCard,
            isAmount: false,
          },
          {
            label: t('returnPending'),
            value: String(stats.returnPending),
            icon: PackageCheck,
            isAmount: false,
          },
          {
            label: t('payoutProcessing'),
            value: String(stats.processing),
            icon: Clock,
            isAmount: false,
          },
          {
            label: t('completed'),
            value: String(stats.completed),
            icon: CheckCircle,
            isAmount: false,
          },
          {
            label: t('totalExpense'),
            value: formatCurrency(stats.totalAmount),
            icon: TrendingDown,
            isAmount: true,
          },
        ]
      : [
          {
            label: t('processing'),
            value: String(stats.open),
            icon: Clock,
            isAmount: false,
          },
          {
            label: t('waitingCustomer'),
            value: String(stats.waitingCustomer),
            icon: Eye,
            isAmount: false,
          },
          {
            label: t('managerReview'),
            value: String(stats.escalated),
            icon: CreditCard,
            isAmount: false,
          },
          {
            label: t('approved'),
            value: String(stats.approved),
            icon: CreditCard,
            isAmount: false,
          },
          {
            label: t('completed'),
            value: String(stats.completed),
            icon: CheckCircle,
            isAmount: false,
          },
          {
            label: t('totalRefund'),
            value: formatCurrency(stats.totalAmount),
            icon: TrendingDown,
            isAmount: true,
          },
        ];
  const visibleItems =
    scope === 'operation'
      ? [
          {
            label: t('returnPending'),
            value: String(stats.returnPending),
            icon: PackageCheck,
            isAmount: false,
          },
          {
            label: t('toBeChecked'),
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
