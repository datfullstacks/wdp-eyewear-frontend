import { MessageSquare, Mail, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';

type ContactType = 'sms' | 'email' | 'phone' | 'zalo';

interface ContactTypeIconProps {
  type: ContactType;
  className?: string;
}

const iconMap = {
  sms: MessageSquare,
  email: Mail,
  phone: PhoneCall,
  zalo: MessageSquare,
};

export const ContactTypeIcon = ({ type, className }: ContactTypeIconProps) => {
  const Icon = iconMap[type];
  return <Icon className={cn('h-4 w-4', className)} />;
};
