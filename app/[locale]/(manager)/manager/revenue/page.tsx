import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
  PieChart,
} from 'lucide-react';

const revenueStats = [
  {
    title: 'Doanh thu tháng này',
    value: '284.5M',
    icon: DollarSign,
    trend: { value: 15, isPositive: true },
  },
  {
    title: 'Tăng trưởng so với tháng trước',
    value: '+15%',
    icon: TrendingUp,
    trend: { value: 3, isPositive: true },
  },
  {
    title: 'Doanh thu trung bình/ngày',
    value: '9.48M',
    icon: Calendar,
    trend: { value: 5, isPositive: true },
  },
  {
    title: 'Hoàn thành mục tiêu',
    value: '85%',
    icon: Target,
    trend: { value: 10, isPositive: true },
  },
];

function RevenuePage() {
  return (
    <>
      <Header 
        title="Báo cáo Doanh thu" 
        subtitle="Thống kê và phân tích doanh thu cửa hàng" 
      />

      <div className="space-y-8 p-6">
        {/* Revenue Stats */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {revenueStats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>

        {/* Revenue Charts Placeholder */}
        <section className="animate-slide-in">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-card border-border rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="text-accent h-5 w-5" />
                <h3 className="font-semibold">Biểu đồ doanh thu theo tháng</h3>
              </div>
              <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
                <p className="text-muted-foreground">Chart sẽ được implement sau</p>
              </div>
            </div>

            <div className="bg-card border-border rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-2">
                <PieChart className="text-accent h-5 w-5" />
                <h3 className="font-semibold">Phân tích theo danh mục sản phẩm</h3>
              </div>
              <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
                <p className="text-muted-foreground">Pie chart sẽ được implement sau</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default RevenuePage;