export type ReadyStockOpsStatus =
  | 'pending_operations'
  | 'awaiting_picking'
  | 'picking'
  | 'packed'
  | 'ready_to_ship'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'delivery_failed'
  | 'returned'
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
