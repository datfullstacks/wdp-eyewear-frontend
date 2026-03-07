'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Target,
  Percent,
} from 'lucide-react';

export default function ManagerDashboardPage() {
  const t = useTranslations('manager.dashboard');

  const managerStats = [
    {
      title: t('stats.monthlyRevenue'),
      value: '284.5M',
      icon: DollarSign,
      trend: { value: 15, isPositive: true },
    },
    {
      title: t('stats.totalOrders'),
      value: '1,284',
      icon: ShoppingCart,
      trend: { value: 12, isPositive: true },
    },
    {
      title: t('stats.activeProducts'),
      value: '456',
      icon: Package,
      trend: { value: 8, isPositive: true },
    },
    {
      title: t('stats.activeCustomers'),
      value: '2,158',
      icon: Users,
      trend: { value: 22, isPositive: true },
    },
    {
      title: t('stats.revenueTarget'),
      value: '85%',
      icon: Target,
      trend: { value: 5, isPositive: true },
    },
    {
      title: t('stats.activePromotions'),
      value: '8',
      icon: Percent,
      trend: { value: 3, isPositive: true },
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
          {managerStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>
      </div>
    </>
  );
}
