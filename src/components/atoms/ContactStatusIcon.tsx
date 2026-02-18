import { Send, CheckCircle, Eye, MessageSquare, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ContactStatus = 'sent' | 'delivered' | 'read' | 'replied' | 'failed';

interface ContactStatusIconProps {
  status: ContactStatus;
  className?: string;
}

const statusConfig: Record<
  ContactStatus,
  { icon: typeof Send; className: string }
> = {
  sent: { icon: Send, className: 'text-muted-foreground' },
  delivered: { icon: CheckCircle, className: 'text-primary' },
  read: { icon: Eye, className: 'text-success' },
  replied: { icon: MessageSquare, className: 'text-success' },
  failed: { icon: XCircle, className: 'text-destructive' },
};

export const ContactStatusIcon = ({
  status,
  className,
}: ContactStatusIconProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  return <Icon className={cn('h-3 w-3', config.className, className)} />;
};
