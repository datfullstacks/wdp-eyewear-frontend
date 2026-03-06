'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { DollarSign, TrendingUp, Tag } from 'lucide-react';

export default function PricingPage() {
  const t = useTranslations('manager.pricing');

  const pricingStats = [
    {
      title: t('stats.avgPrice'),
      value: '1.2M',
      icon: DollarSign,
      trend: { value: 5, isPositive: true },
    },
    {
      title: t('stats.promotionProducts'),
      value: '45',
      icon: Tag,
      trend: { value: 12, isPositive: true },
    },
    {
      title: t('stats.recentPriceChanges'),
      value: '8',
      icon: TrendingUp,
      trend: { value: 0, isPositive: true },
    },
  ];

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pricingStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-500">{t('placeholder')}</p>
        </section>
      </div>
    </>
  );
}
