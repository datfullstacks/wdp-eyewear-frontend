import { StatusBadge } from '@/components/atoms/StatusBadge';
import { TableCell, TableRow } from '@/components/ui/table';
import { InventoryHistoryEntry } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface InventoryHistoryRowProps {
  entry: InventoryHistoryEntry;
}

const typeConfig: Record<
  InventoryHistoryEntry['type'],
  { status: 'success' | 'warning' | 'error'; label: string }
> = {
  import: { status: 'success', label: 'Nhập kho' },
  export: { status: 'error', label: 'Xuất kho' },
  adjust: { status: 'warning', label: 'Điều chỉnh' },
};

export const InventoryHistoryRow = ({ entry }: InventoryHistoryRowProps) => {
  const config = typeConfig[entry.type];
  const quantityClass =
    entry.quantity > 0
      ? 'text-success'
      : entry.quantity < 0
        ? 'text-destructive'
        : 'text-warning';

  return (
    <TableRow>
      <TableCell className="text-foreground/80 text-sm">
        {entry.timestamp}
      </TableCell>
      <TableCell>
        <StatusBadge status={config.status}>{config.label}</StatusBadge>
      </TableCell>
      <TableCell className={cn('text-center font-medium', quantityClass)}>
        {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
      </TableCell>
      <TableCell className="text-foreground/80 text-sm">{entry.note}</TableCell>
      <TableCell className="text-foreground/80 text-sm">
        {entry.performedBy}
      </TableCell>
    </TableRow>
  );
};
