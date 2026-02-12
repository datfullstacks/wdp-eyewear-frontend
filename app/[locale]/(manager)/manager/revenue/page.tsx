'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { StatCard } from '@/components/molecules';
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
    <div className="space-y-8">
      {/* Page Header with Decorative Elements */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-br from-green-200 to-emerald-200 opacity-30 blur-3xl" />
        <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 opacity-30 blur-3xl" />

        <div className="relative flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3 shadow-lg shadow-green-500/30">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-4xl font-bold text-transparent">
              {t('title')}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-gray-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.totalRevenue')}
          value={`$${totalRevenue.toLocaleString()}`}
          trend={{ value: 12.5, isPositive: true }}
          icon={DollarSign}
        />

        <StatCard
          title={t('stats.totalOrders')}
          value={totalOrders}
          trend={{ value: 8.3, isPositive: true }}
          icon={ShoppingBag}
        />

        <StatCard
          title={t('stats.avgOrderValue')}
          value={`$${avgOrderValue.toFixed(2)}`}
          trend={{ value: 3.2, isPositive: false }}
          icon={BarChart3}
        />

        <StatCard
          title={t('stats.totalCustomers')}
          value={mockCustomerMetrics.totalCustomers.toLocaleString()}
          trend={{ value: 15.7, isPositive: true }}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={mockRevenueData} title={t('revenueChart')} />

        <Card>
          <CardHeader>
            <CardTitle>{t('categoryRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
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
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('topProducts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    {t('table.product')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    {t('table.category')}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">
                    {t('table.unitsSold')}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">
                    {t('table.revenue')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockTopProducts.map((product, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {product.productName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {product.unitsSold}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
