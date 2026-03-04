'use client';

import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { FileText, Shield, AlertCircle } from 'lucide-react';

const policyStats = [
  {
    title: 'Tổng chính sách',
    value: '8',
    icon: FileText,
    trend: { value: 0, isPositive: true },
  },
  {
    title: 'Chính sách hoạt động',
    value: '7',
    icon: Shield,
    trend: { value: 0, isPositive: true },
  },
  {
    title: 'Cần cập nhật',
    value: '1',
    icon: AlertCircle,
    trend: { value: 0, isPositive: false },
  },
];

export default function PoliciesPage() {
  return (
    <>
      <Header
        title="Quản lý Chính sách"
        subtitle="Quản lý chính sách bảo hành, đổi trả và dịch vụ"
        showAddButton
        addButtonLabel="Tạo chính sách mới"
      />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {policyStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-500">Danh sách chính sách sẽ được hiển thị ở đây</p>
        </section>
      </div>
    </>
  );
}
