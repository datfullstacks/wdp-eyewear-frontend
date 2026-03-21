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

import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/ui/card';
import analyticsApi, { type ManagerOverview } from '@/api/analytics';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function ManagerDashboardPage() {
  const [overview, setOverview] = useState<ManagerOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await analyticsApi.getManagerOverview();
        if (active) {
          setOverview(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load manager overview.');
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
  }, []);

  const stats = useMemo(
    () =>
      overview
        ? [
            {
              title: 'Monthly revenue',
              value: formatCurrency(overview.monthlyRevenue),
              icon: DollarSign,
              trend: {
                value: Math.abs(overview.monthOverMonthGrowth),
                isPositive: overview.monthOverMonthGrowth >= 0,
              },
            },
            {
              title: 'Monthly orders',
              value: overview.monthlyOrders,
              icon: ShoppingCart,
            },
            {
              title: 'Collected this month',
              value: formatCurrency(overview.collectedThisMonth),
              icon: CreditCard,
            },
            {
              title: 'Active products',
              value: overview.activeProducts,
              icon: Box,
            },
            {
              title: 'Active customers',
              value: overview.activeCustomers,
              icon: Users,
            },
            {
              title: 'Active promotions',
              value: overview.activePromotions,
              icon: CreditCard,
            },
          ]
        : [],
    [overview],
  );

  return (
    <>
      <Header
        title="Manager Dashboard"
        subtitle="Business control center for products, policies, promotions, users, and revenue"
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

            {overview ? (
              <section className="grid gap-4 lg:grid-cols-3">
                <Card className="p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900">Operational summary</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">Total orders</div>
                      <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {overview.totalOrders}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">Cancelled orders</div>
                      <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {overview.cancelledOrders}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">MoM growth</div>
                      <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {overview.monthOverMonthGrowth >= 0 ? '+' : ''}
                        {overview.monthOverMonthGrowth}%
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Manager scope</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    This role now has live data for products, promotions, policies,
                    escalated refunds, user management, and revenue monitoring.
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
