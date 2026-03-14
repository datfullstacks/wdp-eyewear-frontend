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

export type PrescriptionWorkflowStage =
  | 'waiting_review'
  | 'waiting_lab'
  | 'lens_processing'
  | 'lens_fitting'
  | 'qc_check'
  | 'ready_to_pack'
  | 'packing'
  | 'ready_to_ship'
  | 'shipment_created'
  | 'handover_to_carrier'
  | 'in_transit'
  | 'delivery_failed'
  | 'waiting_redelivery'
  | 'return_pending'
  | 'return_in_transit'
  | 'exception_hold'
  | 'delivered'
  | 'returned';

export interface PrescriptionOrder {
  id: string;
  orderId: string;
  rawOrderStatus?: string;
  opsStage?: string;
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
  workflowStage: PrescriptionWorkflowStage;
  trackingCode?: string;
  shipmentStatus?: string;
  rxItemIds?: string[];
  primaryRxItemId?: string;
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
