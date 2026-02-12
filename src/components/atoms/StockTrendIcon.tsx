import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockTrendIconProps {
  stock: number;
  minStock: number;
  className?: string;
}

export const StockTrendIcon = ({
  stock,
  minStock,
  className,
}: StockTrendIconProps) => {
  if (stock > minStock) {
    return <TrendingUp className={cn('text-success h-4 w-4', className)} />;
  }
  return <TrendingDown className={cn('text-destructive h-4 w-4', className)} />;
};
