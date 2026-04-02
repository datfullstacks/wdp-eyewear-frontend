'use client';

import { Banknote, CircleDollarSign, Clock3, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PendingStatsGridProps {
  totalCount: number;
  paidCount: number;
  codCount: number;
  unpaidCount: number;
}

export const PendingStatsGrid = ({
  totalCount,
  paidCount,
  codCount,
  unpaidCount,
}: PendingStatsGridProps) => {
  const t = useTranslations('manager.orders.stats');

  const stats = [
    {
      label: t('totalCount'),
      value: totalCount,
      icon: Package,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: t('paidCount'),
      value: paidCount,
      icon: CircleDollarSign,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      label: t('codCount'),
      value: codCount,
      icon: Banknote,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
    },
    {
      label: t('unpaidCount'),
      value: unpaidCount,
      icon: Clock3,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card border-border rounded-xl border p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold tracking-wide">
                  {stat.label}
                </p>
                <p className="text-foreground text-2xl font-bold leading-none">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
