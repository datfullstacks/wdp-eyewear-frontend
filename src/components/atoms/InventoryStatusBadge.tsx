import { StatusBadge } from '@/components/atoms/StatusBadge';
import { InventoryStatus } from '@/types/inventory';

interface InventoryStatusBadgeProps {
  status: InventoryStatus;
}

const statusConfig: Record<
  InventoryStatus,
  { type: 'success' | 'warning' | 'error' | 'info'; label: string }
> = {
  in_stock: { type: 'success', label: 'Còn hàng' },
  low_stock: { type: 'warning', label: 'Sắp hết' },
  out_of_stock: { type: 'error', label: 'Hết hàng' },
  overstock: { type: 'info', label: 'Tồn nhiều' },
};

export const InventoryStatusBadge = ({ status }: InventoryStatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <StatusBadge
      status={config.type}
      className="border-0 bg-transparent rounded-none px-0 py-0"
    >
      {config.label}
    </StatusBadge>
  );
};
