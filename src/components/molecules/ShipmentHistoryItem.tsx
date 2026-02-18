import { MapPin, Clock } from 'lucide-react';

interface ShipmentHistoryItemProps {
  time: string;
  status: string;
  location: string;
  note?: string;
  isLast?: boolean;
}

export const ShipmentHistoryItem = ({
  time,
  status,
  location,
  note,
  isLast = false,
}: ShipmentHistoryItemProps) => {
  return (
    <div className="relative flex gap-3 pb-4">
      {/* Timeline connector */}
      {!isLast && (
        <div className="bg-border absolute top-4 bottom-0 left-[7px] w-0.5" />
      )}

      {/* Timeline dot */}
      <div className="bg-primary border-background relative z-10 mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2" />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="text-muted-foreground h-3 w-3" />
          <span className="text-muted-foreground">{time}</span>
        </div>
        <p className="text-foreground mt-1 font-medium">{status}</p>
        <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm">
          <MapPin className="h-3 w-3" />
          <span>{location}</span>
        </div>
        {note && <p className="text-warning mt-1 text-sm italic">"{note}"</p>}
      </div>
    </div>
  );
};
