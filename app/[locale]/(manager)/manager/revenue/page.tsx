'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { RevenueChart } from '@/components/organisms';
import { DollarSign, ShoppingBag, BarChart3, Users } from 'lucide-react';
import {
  mockRevenueData,
  mockCategoryRevenue,
  mockTopProducts,
  mockCustomerMetrics,
} from '@/lib/mock-data';

export default function ManagerRevenuePage() {
  const t = useTranslations('manager.revenue');

  const totalRevenue = mockRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = mockRevenueData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <div className="space-y-6 p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('stats.totalRevenue')}
            value={`$${totalRevenue.toLocaleString()}`}
            trend={{ value: 12.5, isPositive: true }}
            icon={DollarSign}
            className="p-3"
            titleClassName="text-xs"
            valueClassName="text-xl"
            trendClassName="text-xs"
            iconWrapperClassName="gradient-gold rounded-md p-2"
            iconSize="md"
          />
          <StatCard
            title={t('stats.totalOrders')}
            value={totalOrders}
            trend={{ value: 8.3, isPositive: true }}
            icon={ShoppingBag}
            className="p-3"
            titleClassName="text-xs"
            valueClassName="text-xl"
            trendClassName="text-xs"
            iconWrapperClassName="gradient-gold rounded-md p-2"
            iconSize="md"
          />
          <StatCard
            title={t('stats.avgOrderValue')}
            value={`$${avgOrderValue.toFixed(2)}`}
            trend={{ value: 3.2, isPositive: false }}
            icon={BarChart3}
            className="p-3"
            titleClassName="text-xs"
            valueClassName="text-xl"
            trendClassName="text-xs"
            iconWrapperClassName="gradient-gold rounded-md p-2"
            iconSize="md"
          />
          <StatCard
            title={t('stats.totalCustomers')}
            value={mockCustomerMetrics.totalCustomers.toLocaleString()}
            trend={{ value: 15.7, isPositive: true }}
            icon={Users}
            className="p-3"
            titleClassName="text-xs"
            valueClassName="text-xl"
            trendClassName="text-xs"
            iconWrapperClassName="gradient-gold rounded-md p-2"
            iconSize="md"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="bg-card border-border rounded-lg border">
            <RevenueChart data={mockRevenueData} title={t('revenueChart')} />
          </section>

          <section className="bg-card border-border rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('categoryRevenue')}</h2>
            <div className="space-y-4">
              {mockCategoryRevenue.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm ${
                          cat.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {cat.change > 0 ? '↑' : '↓'} {Math.abs(cat.change)}%
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${cat.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-amber-400"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Top Products */}
        <section className="bg-card border-border rounded-lg border">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold">{t('topProducts')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    {t('table.product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    {t('table.category')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    {t('table.unitsSold')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    {t('table.revenue')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {mockTopProducts.map((product, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {product.productName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {product.unitsSold}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
