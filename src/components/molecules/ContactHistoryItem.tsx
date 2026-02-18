import { ContactTypeIcon } from '@/components/atoms/ContactTypeIcon';
import { ContactStatusIcon } from '@/components/atoms/ContactStatusIcon';

type ContactStatus = 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
type ContactType = 'sms' | 'email' | 'phone' | 'zalo';

interface ContactHistoryItemProps {
  type: ContactType;
  date: string;
  content: string;
  status: ContactStatus;
  staff: string;
}

export const ContactHistoryItem = ({
  type,
  date,
  content,
  status,
  staff,
}: ContactHistoryItemProps) => {
  return (
    <div className="bg-muted/50 flex gap-3 rounded-lg p-3">
      <div className="mt-1 flex-shrink-0">
        <div className="bg-background rounded-full p-2">
          <ContactTypeIcon type={type} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-foreground text-sm font-medium capitalize">
            {type}
          </span>
          <ContactStatusIcon status={status} />
          <span className="text-muted-foreground ml-auto text-xs">{date}</span>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-sm">{content}</p>
        <p className="text-muted-foreground mt-1 text-xs">Bởi: {staff}</p>
      </div>
    </div>
  );
};
