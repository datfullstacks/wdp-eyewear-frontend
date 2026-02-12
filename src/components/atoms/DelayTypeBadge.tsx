import { Badge } from '@/components/ui/badge';
import { DelayType } from '@/types/delayed';
import { delayTypeLabels } from '@/data/delayedData';

interface DelayTypeBadgeProps {
  delayType: DelayType;
  variant?: 'badge' | 'text';
}

export const DelayTypeBadge = ({
  delayType,
  variant = 'badge',
}: DelayTypeBadgeProps) => {
  const label = delayTypeLabels[delayType];
  if (variant === 'text') {
    return <span className="text-foreground/80 text-sm">{label}</span>;
  }
  return (
    <Badge variant="outline" className="text-xs">
      {label}
    </Badge>
  );
};
