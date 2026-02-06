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
  BarChart3,
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
    trend: { value: 2, isPositive: true },
  },
];

const ManagerDashboard = () => {
  return (
    <>
      <Header
        title="Manager Dashboard"
        subtitle="Tổng quan quản lý và điều hành cửa hàng"
      />

      <div className="space-y-8 p-6">
        {/* Manager Stats */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {managerStats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-foreground flex items-center gap-2 text-lg font-semibold">
              <BarChart3 className="text-accent h-5 w-5" />
              Thao tác nhanh
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card border-border rounded-lg border p-6 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Báo cáo doanh thu</h3>
                  <p className="text-muted-foreground text-sm">Xem chi tiết</p>
                </div>
              </div>
            </div>

            <div className="bg-card border-border rounded-lg border p-6 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <Percent className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Tạo khuyến mãi</h3>
                  <p className="text-muted-foreground text-sm">Tạo mới</p>
                </div>
              </div>
            </div>

            <div className="bg-card border-border rounded-lg border p-6 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Quản lý nhân viên</h3>
                  <p className="text-muted-foreground text-sm">Xem tất cả</p>
                </div>
              </div>
            </div>

            <div className="bg-card border-border rounded-lg border p-6 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Quản lý sản phẩm</h3>
                  <p className="text-muted-foreground text-sm">Thêm mới</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity Overview */}
        <section className="animate-slide-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-foreground flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="text-accent h-5 w-5" />
              Hoạt động gần đây
            </h2>
            <a
              href="/manager/reports"
              className="text-accent text-sm hover:underline"
            >
              Xem báo cáo chi tiết
            </a>
          </div>
          <OrderList />
        </section>

        {/* Top Products */}
        <section className="animate-slide-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-foreground flex items-center gap-2 text-lg font-semibold">
              <Package className="text-accent h-5 w-5" />
              Top sản phẩm bán chạy
            </h2>
            <a
              href="/manager/products"
              className="text-accent text-sm hover:underline"
            >
              Quản lý sản phẩm
            </a>
          </div>
          <ProductGrid />
        </section>
      </div>
    </>
  );
};

export default ManagerDashboard;
