import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/atoms';

type ColorVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'accent';

interface DashboardStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: ColorVariant;
  className?: string;
}

const colorClasses: Record<ColorVariant, { bg: string; icon: string }> = {
  primary: { bg: 'bg-primary/10', icon: 'text-primary' },
  success: { bg: 'bg-success/10', icon: 'text-success' },
  warning: { bg: 'bg-warning/10', icon: 'text-warning' },
  error: { bg: 'bg-destructive/10', icon: 'text-destructive' },
  info: { bg: 'bg-primary/10', icon: 'text-primary' },
  accent: { bg: 'bg-accent/10', icon: 'text-accent-foreground' },
};

export const DashboardStatCard = ({
  icon: Icon,
  label,
  value,
  color = 'primary',
  className,
}: DashboardStatCardProps) => {
  const colors = colorClasses[color];

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={cn('rounded-md p-2', colors.bg)}>
            <Icon className={cn('h-4 w-4', colors.icon)} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="text-foreground text-lg font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
