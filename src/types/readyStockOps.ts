export type ReadyStockOpsStatus =
  | 'pending_operations'
  | 'picking'
  | 'packing'
  | 'ready_to_ship'
  | 'shipment_created'
  | 'handover_to_carrier'
  | 'in_transit'
  | 'delivery_failed'
  | 'waiting_redelivery'
  | 'return_pending'
  | 'return_in_transit'
  | 'waiting_customer_info'
  | 'on_hold'
  | 'exception_hold'
  | 'delivered'
  | 'closed'
  | 'returned'
  // Legacy UI aliases kept temporarily for persisted local state compatibility.
  | 'awaiting_picking'
  | 'packed'
  | 'shipped'
  | 'blocked';

export type ReadyStockIssueType =
  | 'out_of_stock'
  | 'wrong_sku'
  | 'damaged_item'
  | 'address_issue'
  | 'shipping_label_error'
  | 'other';

export type ReadyStockHoldReason =
  | 'payment'
  | 'address'
  | 'stock'
  | 'manual'
  | 'other';

export type ReadyStockChecklistKey =
  | 'skuQuantityChecked'
  | 'productConditionChecked'
  | 'addressChecked'
  | 'packageReady';

export type ReadyStockItemOpsState = {
  picked: boolean;
  warehouseLocation: string;
  issueType: ReadyStockIssueType | null;
  issueNote: string;
  internalNote: string;
};

export type ReadyStockOrderOpsState = {
  opsStatus: ReadyStockOpsStatus;
  lastUpdatedAt: string;
  assignee: string;
  salesApprovedAt: string;
  salesApprovedBy: string;
  salesHandoffNote: string;
  approvalState: 'none' | 'manager_review_requested' | 'sent_back_to_sale';
  managerReviewRequestedAt: string;
  managerReviewRequestedBy: string;
  managerReviewReason: string;
  internalNote: string;
  holdReason: ReadyStockHoldReason | null;
  holdNote: string;
  paymentFailed: boolean;
  checklist: Record<ReadyStockChecklistKey, boolean>;
  carrierId: string;
  trackingCode: string;
  issueType: ReadyStockIssueType | null;
  issueNote: string;
  itemStates: Record<string, ReadyStockItemOpsState>;
};
