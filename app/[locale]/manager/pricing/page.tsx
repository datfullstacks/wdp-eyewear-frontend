'use client';

import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { DollarSign, TrendingUp, Tag } from 'lucide-react';

const pricingStats = [
  {
    title: 'Giá trung bình',
    value: '1.2M',
    icon: DollarSign,
    trend: { value: 5, isPositive: true },
  },
  {
    title: 'Sản phẩm có khuyến mãi',
    value: '45',
    icon: Tag,
    trend: { value: 12, isPositive: true },
  },
  {
    title: 'Tăng giá gần đây',
    value: '8',
    icon: TrendingUp,
    trend: { value: 0, isPositive: true },
  },
];

export default function PricingPage() {
  return (
    <>
      <Header
        title="Quản lý Giá"
        subtitle="Quản lý giá sản phẩm và chính sách giá"
      />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pricingStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-500">Danh sách giá sẽ được hiển thị ở đây</p>
        </section>
      </div>
    </>
  );
}
