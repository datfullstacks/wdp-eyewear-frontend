import { LucideIcon } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionButtonProps extends ButtonProps {
  icon?: LucideIcon;
  label?: string;
  iconOnly?: boolean;
}

export const ActionButton = ({
  icon: Icon,
  label,
  iconOnly = false,
  className,
  children,
  ...props
}: ActionButtonProps) => {
  return (
    <Button className={cn(iconOnly && 'p-2', className)} {...props}>
      {Icon && <Icon className={cn('h-4 w-4', !iconOnly && label && 'mr-2')} />}
      {!iconOnly && (label || children)}
    </Button>
  );
};
