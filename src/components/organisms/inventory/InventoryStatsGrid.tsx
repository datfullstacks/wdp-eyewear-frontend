import { StatCard } from '@/components/molecules/StatCard';
import { INVENTORY_STATUS_LABELS, InventoryStats } from '@/types/inventory';
import { CheckCircle, Package, XCircle } from 'lucide-react';

interface InventoryStatsGridProps {
  stats: InventoryStats;
}

export const InventoryStatsGrid = ({ stats }: InventoryStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        title={INVENTORY_STATUS_LABELS.in_stock}
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
        title={INVENTORY_STATUS_LABELS.out_of_stock}
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
