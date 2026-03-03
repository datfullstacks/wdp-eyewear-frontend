'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Download,
  Filter,
} from 'lucide-react';

export default function ManagerRevenueNew() {
  const t = useTranslations('manager.revenue');

  const stats = [
    {
      title: t('stats.totalRevenue'),
      value: '$124,500',
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: t('stats.totalOrders'),
      value: '1,234',
      icon: ShoppingCart,
      trend: { value: 8.3, isPositive: true },
    },
    {
      title: t('stats.avgOrderValue'),
      value: '$98.50',
      icon: TrendingUp,
      trend: { value: 3.2, isPositive: false },
    },
    {
      title: t('stats.totalCustomers'),
      value: '856',
      icon: Users,
      trend: { value: 15.7, isPositive: true },
    },
  ];

  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      product: 'Ray-Ban Classic',
      amount: '$125.00',
      status: 'completed',
      date: '2026-01-30',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      product: 'Oakley Sport',
      amount: '$198.00',
      status: 'processing',
      date: '2026-01-30',
    },
    {
      id: 'ORD-003',
      customer: 'Bob Johnson',
      product: 'Persol Vintage',
      amount: '$245.00',
      status: 'completed',
      date: '2026-01-29',
    },
    {
      id: 'ORD-004',
      customer: 'Alice Brown',
      product: 'Gucci Designer',
      amount: '$350.00',
      status: 'pending',
      date: '2026-01-29',
    },
  ];

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <div className="space-y-6 p-6">
        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Bộ lọc
          </Button>
          <Button size="sm" className="gap-2 bg-amber-400 text-slate-900 hover:opacity-90">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              {...stat}
              className="p-3"
              titleClassName="text-xs"
              valueClassName="text-xl"
              trendClassName="text-xs"
              iconWrapperClassName="gradient-gold rounded-md p-2"
              iconSize="md"
            />
          ))}
        </div>

        {/* Recent Orders Table */}
        <section className="bg-card border-border rounded-lg border">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold">{t('recentOrders')}</h2>
            <p className="text-sm text-gray-500">
              Giao dịch gần đây từ cửa hàng kính mắt
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Số tiền
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {order.amount}
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
