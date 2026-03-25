import { StatusBadge } from '@/components/atoms/StatusBadge';
import { cn } from '@/lib/utils';
import {
  INVENTORY_STATUS_LABELS,
  InventoryStatus,
  toInventoryDisplayStatus,
} from '@/types/inventory';

interface InventoryStatusBadgeProps {
  status: InventoryStatus;
  variant?: 'ghost' | 'pill';
  className?: string;
}

const statusConfig: Record<
  InventoryStatus,
  { type: 'success' | 'warning' | 'error' | 'info'; label: string }
> = {
  in_stock: { type: 'success', label: INVENTORY_STATUS_LABELS.in_stock },
  low_stock: { type: 'success', label: INVENTORY_STATUS_LABELS.low_stock },
  out_of_stock: { type: 'error', label: INVENTORY_STATUS_LABELS.out_of_stock },
  overstock: { type: 'success', label: INVENTORY_STATUS_LABELS.overstock },
  not_tracked: { type: 'success', label: INVENTORY_STATUS_LABELS.not_tracked },
};

export const InventoryStatusBadge = ({
  status,
  variant = 'ghost',
  className,
}: InventoryStatusBadgeProps) => {
  const normalizedStatus = toInventoryDisplayStatus(status);
  const config =
    normalizedStatus === 'out_of_stock'
      ? statusConfig.out_of_stock
      : statusConfig.in_stock;

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
