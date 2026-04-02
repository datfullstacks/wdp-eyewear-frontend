'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Box,
  CreditCard,
  DollarSign,
  Loader2,
  ShoppingCart,
  Users,
} from 'lucide-react';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/ui/card';
import analyticsApi, {
  type ManagerOverview,
  type ManagerProductAnalytics,
  type RevenueSummary,
} from '@/api/analytics';
import { ManagerProductInsights } from '@/components/analytics/ManagerProductInsights';
import { ManagerRevenueInsights } from '@/components/analytics/ManagerRevenueInsights';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function ManagerDashboardPage() {
  const [overview, setOverview] = useState<ManagerOverview | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [productAnalytics, setProductAnalytics] =
    useState<ManagerProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const t = useTranslations('manager.dashboard');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [overviewResult, revenueResult, productAnalyticsResult] =
          await Promise.allSettled([
          analyticsApi.getManagerOverview(),
          analyticsApi.getRevenueSummary(),
          analyticsApi.getManagerProductAnalytics(),
        ]);
        if (active) {
          const errors: string[] = [];

          if (overviewResult.status === 'fulfilled') {
            setOverview(overviewResult.value);
          } else {
            setOverview(null);
            errors.push(
              overviewResult.reason instanceof Error
                ? overviewResult.reason.message
                : t('loadOverviewFailed'),
            );
          }

          if (revenueResult.status === 'fulfilled') {
            setRevenueSummary(revenueResult.value);
          } else {
            setRevenueSummary(null);
            errors.push(
              revenueResult.reason instanceof Error
                ? revenueResult.reason.message
                : t('loadRevenueFailed'),
            );
          }

          if (productAnalyticsResult.status === 'fulfilled') {
            setProductAnalytics(productAnalyticsResult.value);
          } else {
            setProductAnalytics(null);
            errors.push(
              productAnalyticsResult.reason instanceof Error
                ? productAnalyticsResult.reason.message
                : t('loadRevenueFailed'),
            );
          }

          setError(errors.join(' '));
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t('loadOverviewFailed'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [t]);

  const stats = useMemo(
    () =>
      overview
        ? [
            {
              title: t('stats.monthlyRevenue'),
              value: formatCurrency(overview.monthlyRevenue),
              icon: DollarSign,
              trend: {
                value: Math.abs(overview.monthOverMonthGrowth),
                isPositive: overview.monthOverMonthGrowth >= 0,
              },
            },
            {
              title: t('stats.monthlyOrders'),
              value: overview.monthlyOrders,
              icon: ShoppingCart,
            },
            {
              title: t('stats.collectedThisMonth'),
              value: formatCurrency(overview.collectedThisMonth),
              icon: CreditCard,
            },
            {
              title: t('stats.activeProducts'),
              value: overview.activeProducts,
              icon: Box,
            },
            {
              title: t('stats.activeCustomers'),
              value: overview.activeCustomers,
              icon: Users,
            },
            {
              title: t('stats.activePromotions'),
              value: overview.activePromotions,
              icon: CreditCard,
            },
          ]
        : [],
    [overview, t],
  );

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <div className="space-y-6 p-6">
        {error ? (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </section>

            <ManagerRevenueInsights
              summary={revenueSummary}
              title={t('analytics.title')}
              subtitle={t('analytics.subtitle')}
            />

            <ManagerProductInsights analytics={productAnalytics} />

            {overview ? (
              <section className="grid gap-4 lg:grid-cols-3">
                <Card className="p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900">{t('operationalSummary.title')}</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">{t('operationalSummary.totalOrders')}</div>
                      <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {overview.totalOrders}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">{t('operationalSummary.cancelledOrders')}</div>
                      <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {overview.cancelledOrders}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">{t('operationalSummary.momGrowth')}</div>
                      <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {overview.monthOverMonthGrowth >= 0 ? '+' : ''}
                        {overview.monthOverMonthGrowth}%
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('managerScope.title')}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {t('managerScope.description')}
                  </p>
                </Card>
              </section>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
