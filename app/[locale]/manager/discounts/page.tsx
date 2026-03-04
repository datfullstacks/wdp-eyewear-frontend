'use client';

import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Percent, Calendar, Tag } from 'lucide-react';

const discountStats = [
  {
    title: 'Khuyến mãi hoạt động',
    value: '5',
    icon: Percent,
    trend: { value: 0, isPositive: true },
  },
  {
    title: 'Sắp hết hạn',
    value: '2',
    icon: Calendar,
    trend: { value: 0, isPositive: false },
  },
  {
    title: 'Tổng mã giảm giá',
    value: '12',
    icon: Tag,
    trend: { value: 0, isPositive: true },
  },
];

export default function DiscountsPage() {
  return (
    <>
      <Header
        title="Quản lý Khuyến mãi"
        subtitle="Tạo và quản lý các chương trình khuyến mãi"
        showAddButton
        addButtonLabel="Tạo khuyến mãi mới"
      />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {discountStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-500">Danh sách khuyến mãi sẽ được hiển thị ở đây</p>
        </section>
      </div>
    </>
  );
}
