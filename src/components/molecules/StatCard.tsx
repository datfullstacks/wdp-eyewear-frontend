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
  trendClassName?: string;
  showIcon?: boolean;
  inline?: boolean;
  iconWrapperClassName?: string;
  iconSize?: 'sm' | 'md' | 'lg';
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
  trendClassName,
  showIcon = true,
  inline = false,
  iconWrapperClassName,
  iconSize = 'lg',
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
        <div>
          <div
            className={cn(
              inline ? 'flex w-full items-center justify-between gap-3' : 'block'
            )}
          >
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
          </div>
          {trend && (
            <p
              className={cn(
                'mt-1 text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive',
                trendClassName
              )}
            >
              {trend.isPositive ? '+' : '-'}
              {Math.abs(trend.value)}% so với tháng trước
            </p>
          )}
        </div>
        {showIcon && (
          <div
            className={cn(
              iconWrapperClassName || 'gradient-gold rounded-lg p-3'
            )}
          >
            <Icon
              icon={icon}
              size={iconSize}
              className={iconColor || 'text-primary'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

