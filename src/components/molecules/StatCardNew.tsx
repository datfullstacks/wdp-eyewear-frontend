import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardNewProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export const StatCardNew: React.FC<StatCardNewProps> = ({
  title,
  value,
  icon,
  trend,
  description,
  className,
}) => {
  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        
        {trend && (
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant={trend.isPositive ? 'default' : 'destructive'}
              className="gap-1"
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </Badge>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
        
        {description && (
          <CardDescription className="mt-2">{description}</CardDescription>
        )}
      </CardContent>
    </Card>
  );
};
