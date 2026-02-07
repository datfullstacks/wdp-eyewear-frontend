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
  iconColor?: string;
  className?: string;
  titleClassName?: string;
  valueClassName?: string;
  showIcon?: boolean;
  inline?: boolean;
}

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  iconColor,
  className,
  titleClassName,
  valueClassName,
  showIcon = true,
  inline = false,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        'glass-card rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]',
        className
      )}
    >
      <div
        className={cn(
          'flex items-start justify-between',
          inline && 'items-center'
        )}
      >
        <div className={cn(inline ? 'flex items-center gap-2' : 'block')}>
          <p
            className={cn(
              'text-muted-foreground text-sm font-medium',
              titleClassName
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'font-display text-foreground mt-1 text-2xl font-semibold',
              inline && 'mt-0',
              valueClassName
            )}
          >
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : '-'}
              {Math.abs(trend.value)}% so với tháng trước
            </p>
          )}
        </div>
        {showIcon && (
          <div className="rounded-lg bg-amber-100 p-3">
            <Icon
              icon={icon}
              size="lg"
              className={iconColor || 'text-amber-600'}
            />
          </div>
        )}
      </div>
    </div>
  );
};
