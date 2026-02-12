export type DelayType =
  | 'sla_breach'
  | 'pending_too_long'
  | 'stuck_processing'
  | 'delivery_delay'
  | 'lab_delay';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface DelayedOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  orderDate: string;
  delayType: DelayType;
  severity: SeverityLevel;
  delayDuration: string;
  slaDeadline: string;
  currentStatus: string;
  assignedTo: string;
  lastAction: string;
  notes: string;
}

export interface SeverityConfig {
  label: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type ResolveAction =
  | 'expedite'
  | 'reassign'
  | 'contact_resolved'
  | 'issue_resolved'
  | 'cancel_order'
  | 'false_alarm';

export type ContactMethod = 'phone' | 'sms';
