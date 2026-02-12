import { Badge } from '@/components/ui/badge';

type Priority = 'urgent' | 'high' | 'normal' | 'low';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  urgent: {
    label: 'Gấp',
    className: 'bg-destructive text-destructive-foreground',
  },
  high: { label: 'Cao', className: 'bg-warning text-warning-foreground' },
  normal: { label: 'Bình thường', className: 'bg-muted text-muted-foreground' },
  low: { label: 'Thấp', className: 'bg-secondary text-secondary-foreground' },
};

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const config = priorityConfig[priority];

  if (priority === 'normal' || priority === 'low') {
    return null;
  }

  return (
    <Badge className={`${config.className} ${className || ''}`}>
      {config.label}
    </Badge>
  );
};
