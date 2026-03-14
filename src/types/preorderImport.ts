export type PreorderBatchStatus =
  | 'pending'
  | 'in_transit'
  | 'partial'
  | 'completed'
  | 'delayed';

export interface PreorderItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variant: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
}

export interface PreorderBatch {
  id: string;
  batchCode: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  status: PreorderBatchStatus;
  totalItems: number;
  receivedItems: number;
  items: PreorderItem[];
  notes?: string;
  createdByName?: string;
}

export interface PreorderImportStats {
  total: number;
  pending: number;
  inTransit: number;
  delayed: number;
}
