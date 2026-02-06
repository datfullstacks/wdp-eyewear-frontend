import { Header } from '@/components/organisms/Header';
import { ProductGrid } from '@/components/organisms/ProductGrid';
import { StatCard } from '@/components/molecules/StatCard';
import { Package, Eye, ShoppingCart, AlertTriangle } from 'lucide-react';

const productStats = [
  {
    title: 'Tổng sản phẩm',
    value: '456',
    icon: Package,
    trend: { value: 8, isPositive: true },
  },
  {
    title: 'Đang hiển thị',
    value: '423',
    icon: Eye,
    trend: { value: 12, isPositive: true },
  },
  {
    title: 'Sản phẩm bán chạy',
    value: '89',
    icon: ShoppingCart,
    trend: { value: 15, isPositive: true },
  },
  {
    title: 'Sắp hết hàng',
    value: '12',
    icon: AlertTriangle,
    trend: { value: 3, isPositive: false },
  },
];

function ProductsPage() {
  return (
    <>
      <Header 
        title="Quản lý Sản phẩm" 
        subtitle="Quản lý danh mục và thông tin sản phẩm"
        showAddButton
        addButtonLabel="Thêm sản phẩm mới"
      />

      <div className="space-y-8 p-6">
        {/* Product Stats */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {productStats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>

        {/* Product Management Tabs */}
        <section className="animate-slide-in">
          <div className="bg-card border-border rounded-lg border">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button className="border-accent text-accent whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
                  Tất cả sản phẩm
                </button>
                <button className="text-muted-foreground hover:text-foreground whitespace-nowrap border-b-2 border-transparent py-4 px-1 text-sm font-medium">
                  Đang bán
                </button>
                <button className="text-muted-foreground hover:text-foreground whitespace-nowrap border-b-2 border-transparent py-4 px-1 text-sm font-medium">
                  Sắp hết hàng
                </button>
                <button className="text-muted-foreground hover:text-foreground whitespace-nowrap border-b-2 border-transparent py-4 px-1 text-sm font-medium">
                  Ngừng bán
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              <ProductGrid />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-in">
          <h2 className="mb-4 text-lg font-semibold">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-card border-border rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Import sản phẩm</h3>
                  <p className="text-muted-foreground text-sm">Nhập từ Excel file</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card border-border rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Quản lý danh mục</h3>
                  <p className="text-muted-foreground text-sm">Tạo và sửa danh mục</p>
                </div>
              </div>
            </div>

            <div className="bg-card border-border rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Cảnh báo tồn kho</h3>
                  <p className="text-muted-foreground text-sm">Thiết lập ngưỡng cảnh báo</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default ProductsPage;