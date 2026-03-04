import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Target,
  Percent,
} from 'lucide-react';

const managerStats = [
  {
    title: 'Doanh thu tháng này',
    value: '284.5M',
    icon: DollarSign,
    trend: { value: 15, isPositive: true },
  },
  {
    title: 'Tổng đơn hàng',
    value: '1,284',
    icon: ShoppingCart,
    trend: { value: 12, isPositive: true },
  },
  {
    title: 'Sản phẩm đang bán',
    value: '456',
    icon: Package,
    trend: { value: 8, isPositive: true },
  },
  {
    title: 'Khách hàng hoạt động',
    value: '2,158',
    icon: Users,
    trend: { value: 22, isPositive: true },
  },
  {
    title: 'Mục tiêu doanh thu',
    value: '85%',
    icon: Target,
    trend: { value: 5, isPositive: true },
  },
  {
    title: 'Chương trình KM active',
    value: '8',
    icon: Percent,
    trend: { value: 3, isPositive: true },
  },
];

export default function ManagerDashboardPage() {
  return (
    <>
      <Header
        title="Manager Dashboard"
        subtitle="Tổng quan quản lý - Sản phẩm, Giá, Người dùng và Doanh thu"
      />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {managerStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>
      </div>
    </>
  );
}
