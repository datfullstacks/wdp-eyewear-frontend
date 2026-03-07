'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { DollarSign, TrendingUp, Calendar, Target } from 'lucide-react';

export default function RevenueNewPage() {
  const t = useTranslations('manager.revenueNew');
  const tRev = useTranslations('manager.revenue');

  const revenueStats = [
    {
      title: tRev('stats.monthlyRevenue'),
      value: '284.5M',
      icon: DollarSign,
      trend: { value: 15, isPositive: true },
    },
    {
      title: tRev('stats.growth'),
      value: '+15%',
      icon: TrendingUp,
      trend: { value: 15, isPositive: true },
    },
    {
      title: tRev('stats.yearlyRevenue'),
      value: '2.8B',
      icon: Calendar,
      trend: { value: 22, isPositive: true },
    },
    {
      title: tRev('stats.targetAchieved'),
      value: '85%',
      icon: Target,
      trend: { value: 5, isPositive: true },
    },
  ];

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {revenueStats.map((stat, index) => (
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
