export interface PrescriptionData {
  sphereRight: string;
  cylinderRight: string;
  axisRight: string;
  sphereLeft: string;
  cylinderLeft: string;
  axisLeft: string;
  pd: string;
  addRight?: string;
  addLeft?: string;
  lensType: string;
  coating: string;
  notes?: string;
}

export interface PrescriptionOrder {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  orderDate: string;
  products: {
    name: string;
    sku: string;
    frame: string;
    quantity: number;
  }[];
  prescriptionStatus: 'missing' | 'incomplete' | 'pending_review' | 'approved';
  prescription?: PrescriptionData;
  priority: 'normal' | 'high' | 'urgent';
  dueDate: string;
  notes?: string;
  source: 'customer_upload' | 'store_input' | 'pending';
}

export const emptyPrescriptionForm: PrescriptionData = {
  sphereRight: '',
  cylinderRight: '',
  axisRight: '',
  sphereLeft: '',
  cylinderLeft: '',
  axisLeft: '',
  pd: '',
  addRight: '',
  addLeft: '',
  lensType: '',
  coating: '',
  notes: '',
};
