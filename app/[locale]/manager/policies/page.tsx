'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { FileText, Shield, AlertCircle } from 'lucide-react';

export default function PoliciesPage() {
  const t = useTranslations('manager.policies');

  const policyStats = [
    {
      title: t('stats.totalPolicies'),
      value: '8',
      icon: FileText,
      trend: { value: 0, isPositive: true },
    },
    {
      title: t('stats.activePolicies'),
      value: '7',
      icon: Shield,
      trend: { value: 0, isPositive: true },
    },
    {
      title: t('stats.needsUpdate'),
      value: '1',
      icon: AlertCircle,
      trend: { value: 0, isPositive: false },
    },
  ];

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
        showAddButton
        addButtonLabel={t('createPolicy')}
      />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {policyStats.map((stat, index) => (
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
