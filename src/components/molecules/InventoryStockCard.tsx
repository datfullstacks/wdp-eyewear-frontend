import { cn } from '@/lib/utils';

interface InventoryStockCardProps {
  value: number;
  label: string;
  colorClass?: string;
}

export const InventoryStockCard = ({
  value,
  label,
  colorClass = 'text-foreground',
}: InventoryStockCardProps) => {
  return (
    <div className="glass-card rounded-lg p-3 text-center">
      <p className={cn('text-2xl font-bold', colorClass)}>{value}</p>
      <p className="text-foreground/80 text-xs">{label}</p>
    </div>
  );
};
