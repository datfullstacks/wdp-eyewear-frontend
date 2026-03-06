import { StatusBadge } from '@/components/atoms/StatusBadge';
import { InventoryStatus } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface InventoryStatusBadgeProps {
  status: InventoryStatus;
  variant?: 'ghost' | 'pill';
  className?: string;
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

export const InventoryStatusBadge = ({
  status,
  variant = 'ghost',
  className,
}: InventoryStatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <StatusBadge
      status={config.type}
      className={cn(
        variant === 'ghost' && 'border-0 bg-transparent rounded-none px-0 py-0',
        className
      )}
    >
      {config.label}
    </StatusBadge>
  );
};
