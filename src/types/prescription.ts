export interface MissingField {
  field: string;
  label: string;
  eye?: 'OD' | 'OS' | 'both';
}

export interface ContactHistory {
  id: string;
  type: 'sms' | 'email' | 'phone' | 'zalo';
  date: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  staff: string;
}

export interface SupplementOrder {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  email: string;
  zalo?: string;
  orderDate: string;
  products: {
    name: string;
    sku: string;
    frame: string;
    quantity: number;
  }[];
  missingType:
    | 'no_prescription'
    | 'incomplete_data'
    | 'unclear_image'
    | 'need_verification';
  missingFields: MissingField[];
  priority: 'normal' | 'high' | 'urgent';
  dueDate: string;
  daysPending: number;
  contactAttempts: number;
  lastContactDate?: string;
  contactHistory: ContactHistory[];
  prescriptionImage?: string;
  notes?: string;
  assignedTo?: string;
}

export type ContactType = 'sms' | 'email' | 'phone' | 'zalo';

export interface ContactTemplate {
  id: string;
  name: string;
  content: string;
}
