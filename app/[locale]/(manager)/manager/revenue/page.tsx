'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { StatCard } from '@/components/molecules';
import { RevenueChart } from '@/components/organisms';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-600">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.totalRevenue')}
          value={`$${totalRevenue.toLocaleString()}`}
          variant="primary"
          trend={{ value: 12.5, isPositive: true }}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        <StatCard
          title={t('stats.totalOrders')}
          value={totalOrders}
          variant="success"
          trend={{ value: 8.3, isPositive: true }}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
        />

        <StatCard
          title={t('stats.avgOrderValue')}
          value={`$${avgOrderValue.toFixed(2)}`}
          variant="warning"
          trend={{ value: 3.2, isPositive: false }}
          icon={
            <svg
              className="h-6 w-6"
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
          }
        />

        <StatCard
          title={t('stats.totalCustomers')}
          value={mockCustomerMetrics.totalCustomers.toLocaleString()}
          variant="danger"
          trend={{ value: 15.7, isPositive: true }}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
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
