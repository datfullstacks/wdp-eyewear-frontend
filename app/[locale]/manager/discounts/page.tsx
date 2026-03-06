'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Percent, Calendar, Tag } from 'lucide-react';

export default function DiscountsPage() {
  const t = useTranslations('manager.discounts');

  const discountStats = [
    {
      title: t('stats.activePromotions'),
      value: '5',
      icon: Percent,
      trend: { value: 0, isPositive: true },
    },
    {
      title: t('stats.expiringSoon'),
      value: '2',
      icon: Calendar,
      trend: { value: 0, isPositive: false },
    },
    {
      title: t('stats.totalCoupons'),
      value: '12',
      icon: Tag,
      trend: { value: 0, isPositive: true },
    },
  ];

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
        showAddButton
        addButtonLabel={t('addDiscount')}
      />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {discountStats.map((stat, index) => (
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
