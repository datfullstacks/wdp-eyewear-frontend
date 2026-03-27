'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Loader2,
  ShoppingCart,
  Wallet,
} from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/ui/card';
import analyticsApi, { type RevenueSummary } from '@/api/analytics';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function RevenuePage() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await analyticsApi.getRevenueSummary();
        if (active) {
          setSummary(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load revenue summary.'
          );
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
      summary
        ? [
            {
              title: 'Monthly revenue',
              value: formatCurrency(summary.summary.monthlyRevenue),
              icon: DollarSign,
              trend: {
                value: Math.abs(summary.summary.growth),
                isPositive: summary.summary.growth >= 0,
              },
            },
            {
              title: 'Collected this month',
              value: formatCurrency(summary.summary.monthlyCollected),
              icon: Wallet,
            },
            {
              title: 'Monthly orders',
              value: summary.summary.monthlyOrders,
              icon: ShoppingCart,
            },
            {
              title: 'Yearly revenue',
              value: formatCurrency(summary.summary.yearlyRevenue),
              icon: Calendar,
            },
          ]
        : [],
    [summary]
  );

  return (
    <>
      <Header
        title="Revenue Overview"
        subtitle="Monitor booked revenue, collected cash, and the last six months of order performance"
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
            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </section>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent monthly trend
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pr-4 pb-3">Month</th>
                      <th className="pr-4 pb-3">Revenue</th>
                      <th className="pr-4 pb-3">Collected</th>
                      <th className="pb-3">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.monthly.map((row) => (
                      <tr
                        key={row.month}
                        className="border-b border-gray-100 text-gray-700"
                      >
                        <td className="py-3 pr-4">{row.month}</td>
                        <td className="py-3 pr-4">
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatCurrency(row.collected)}
                        </td>
                        <td className="py-3">{row.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
