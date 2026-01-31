import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { OrderList } from '@/components/organisms/OrderList';
import { ProductGrid } from '@/components/organisms/ProductGrid';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
} from 'lucide-react';

const stats = [
  {
    title: 'Doanh thu hôm nay',
    value: '35.2M',
    icon: DollarSign,
    trend: { value: 12, isPositive: true },
  },
  {
    title: 'Đơn hàng mới',
    value: '24',
    icon: ShoppingCart,
    trend: { value: 8, isPositive: true },
  },
  {
    title: 'Sản phẩm tồn kho',
    value: '156',
    icon: Package,
    trend: { value: 3, isPositive: false },
  },
  {
    title: 'Khách hàng mới',
    value: '12',
    icon: Users,
    trend: { value: 15, isPositive: true },
  },
];

const Dashboard = () => {
  return (
    <>
      <Header title="Dashboard" subtitle="Tổng quan hoạt động kinh doanh" />

      <div className="space-y-8 p-6">
        {/* Stats */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        <section className="animate-slide-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-foreground flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="text-accent h-5 w-5" />
              Đơn hàng gần đây
            </h2>
            <a href="/orders" className="text-accent text-sm hover:underline">
              Xem tất cả
            </a>
          </div>
          <OrderList />
        </section>

        {/* Featured Products */}
        <section className="animate-slide-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-foreground flex items-center gap-2 text-lg font-semibold">
              <Package className="text-accent h-5 w-5" />
              Sản phẩm nổi bật
            </h2>
            <a href="/products" className="text-accent text-sm hover:underline">
              Xem tất cả
            </a>
          </div>
          <ProductGrid />
        </section>
      </div>
    </>
  );
};

export default Dashboard;
