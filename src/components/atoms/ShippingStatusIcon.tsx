import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ShippingStatus =
  | 'picking'
  | 'in_transit'
  | 'delivering'
  | 'delivered'
  | 'returned'
  | 'failed';

interface ShippingStatusIconProps {
  status: ShippingStatus;
  className?: string;
  showBackground?: boolean;
}

const statusConfig: Record<
  ShippingStatus,
  { icon: typeof Package; bgClass: string; iconClass: string }
> = {
  picking: { icon: Clock, bgClass: 'bg-warning/10', iconClass: 'text-warning' },
  in_transit: {
    icon: Truck,
    bgClass: 'bg-primary/10',
    iconClass: 'text-primary',
  },
  delivering: {
    icon: Package,
    bgClass: 'bg-primary/10',
    iconClass: 'text-primary',
  },
  delivered: {
    icon: CheckCircle2,
    bgClass: 'bg-success/10',
    iconClass: 'text-success',
  },
  returned: {
    icon: RotateCcw,
    bgClass: 'bg-destructive/10',
    iconClass: 'text-destructive',
  },
  failed: {
    icon: XCircle,
    bgClass: 'bg-destructive/10',
    iconClass: 'text-destructive',
  },
};

export const ShippingStatusIcon = ({
  status,
  className,
  showBackground = false,
}: ShippingStatusIconProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (showBackground) {
    return (
      <div className={cn('rounded-lg p-2', config.bgClass, className)}>
        <Icon className={cn('h-5 w-5', config.iconClass)} />
      </div>
    );
  }

  return <Icon className={cn('h-4 w-4', config.iconClass, className)} />;
};
