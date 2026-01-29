import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  description,
  variant = 'default',
}) => {
  const variants = {
    default: 'border-gray-200 bg-white',
    primary: 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100',
    success: 'border-green-200 bg-gradient-to-br from-green-50 to-green-100',
    warning: 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100',
    danger: 'border-red-200 bg-gradient-to-br from-red-50 to-red-100',
  };

  const textColors = {
    default: 'text-gray-900',
    primary: 'text-blue-900',
    success: 'text-green-900',
    warning: 'text-yellow-900',
    danger: 'text-red-900',
  };

  return (
    <Card
      className={cn(
        'shadow-lg transition-shadow hover:shadow-xl',
        variants[variant]
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold', textColors[variant])}>
          {value}
        </div>
        {trend && (
          <div className="mt-2 flex items-center text-sm">
            <span
              className={cn(
                'font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground ml-2">vs last month</span>
          </div>
        )}
        {description && (
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
