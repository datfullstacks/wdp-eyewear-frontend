'use client';

import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { DollarSign, TrendingUp, Calendar, Target } from 'lucide-react';

const revenueStats = [
  {
    title: 'Doanh thu tháng này',
    value: '284.5M',
    icon: DollarSign,
    trend: { value: 15, isPositive: true },
  },
  {
    title: 'Tăng trưởng',
    value: '+15%',
    icon: TrendingUp,
    trend: { value: 15, isPositive: true },
  },
  {
    title: 'Doanh thu năm',
    value: '2.8B',
    icon: Calendar,
    trend: { value: 22, isPositive: true },
  },
  {
    title: 'Đạt mục tiêu',
    value: '85%',
    icon: Target,
    trend: { value: 5, isPositive: true },
  },
];

export default function RevenueNewPage() {
  return (
    <>
      <Header
        title="Báo cáo Doanh thu (Mới)"
        subtitle="Theo dõi doanh thu với giao diện cải tiến"
      />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {revenueStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-500">Biểu đồ doanh thu mới sẽ được hiển thị ở đây</p>
        </section>
      </div>
    </>
  );
}
