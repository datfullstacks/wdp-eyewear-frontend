import { StatCard } from '@/components/molecules/StatCard';
import { InventoryStats } from '@/types/inventory';
import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface InventoryStatsGridProps {
  stats: InventoryStats;
}

export const InventoryStatsGrid = ({ stats }: InventoryStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Tổng sản phẩm"
        value={stats.total.toString()}
        icon={Package}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        trendClassName="text-xs"
        showIcon={false}
        inline
      />
      <StatCard
        title="Còn hàng"
        value={stats.inStock.toString()}
        icon={CheckCircle}
        iconColor="text-success"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        title="Sắp hết hàng"
        value={stats.lowStock.toString()}
        icon={AlertTriangle}
        iconColor="text-warning"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        title="Hết hàng"
        value={stats.outOfStock.toString()}
        icon={XCircle}
        iconColor="text-destructive"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
    </div>
  );
};
