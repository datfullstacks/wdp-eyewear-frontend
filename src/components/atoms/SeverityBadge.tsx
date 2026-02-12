import { Badge } from '@/components/ui/badge';
import { SeverityLevel } from '@/types/delayed';
import { severityConfig } from '@/data/delayedData';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  showIcon?: boolean;
  variant?: 'badge' | 'text';
}

export const SeverityBadge = ({
  severity,
  showIcon = true,
  variant = 'badge',
}: SeverityBadgeProps) => {
  const config = severityConfig[severity];
  const Icon = config.icon;

  if (variant === 'text') {
    const textClassName =
      severity === 'critical'
        ? 'text-destructive'
        : severity === 'high'
          ? 'text-warning'
          : severity === 'medium'
            ? 'text-primary'
            : 'text-muted-foreground';
    return <span className={`text-sm font-medium ${textClassName}`}>{config.label}</span>;
  }

  return (
    <Badge className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
};
