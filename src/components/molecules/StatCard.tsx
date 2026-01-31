import { LucideIcon } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:scale-[1.02]',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="font-display text-foreground mt-2 text-3xl font-semibold">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : '-'}
              {Math.abs(trend.value)}% so với tháng trước
            </p>
          )}
        </div>
        <div className="rounded-lg border border-amber-200/70 bg-amber-50 p-3">
          <Icon icon={icon} size="lg" className="text-amber-700" />
        </div>
      </div>
    </div>
  );
};
