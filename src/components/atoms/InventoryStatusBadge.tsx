import { StatusBadge } from '@/components/atoms/StatusBadge';
import { cn } from '@/lib/utils';
import { InventoryStatus } from '@/types/inventory';

interface InventoryStatusBadgeProps {
  status: InventoryStatus;
  variant?: 'ghost' | 'pill';
  className?: string;
}

const statusConfig: Record<
  InventoryStatus,
  { type: 'success' | 'warning' | 'error' | 'info'; label: string }
> = {
  in_stock: { type: 'success', label: 'Con hang' },
  low_stock: { type: 'warning', label: 'Sap het' },
  out_of_stock: { type: 'error', label: 'Het hang' },
  overstock: { type: 'info', label: 'Ton nhieu' },
  not_tracked: { type: 'info', label: 'Khong theo doi ton' },
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
