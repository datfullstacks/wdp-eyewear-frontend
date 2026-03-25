export type InventoryStatus =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'overstock'
  | 'not_tracked';

export type InventoryDisplayStatus = 'in_stock' | 'out_of_stock';

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  in_stock: 'Còn hàng',
  low_stock: 'Còn hàng',
  out_of_stock: 'Hết hàng',
  overstock: 'Còn hàng',
  not_tracked: 'Còn hàng',
};

export function toInventoryDisplayStatus(
  status: InventoryStatus
): InventoryDisplayStatus {
  return status === 'out_of_stock' ? 'out_of_stock' : 'in_stock';
}

export type AdjustmentReason =
  | 'adjust'
  | 'import'
  | 'return'
  | 'damage'
  | 'other';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  variant: string;
  trackInventory?: boolean;
  stock: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  location: string;
  lastUpdated: string;
  status: InventoryStatus;
}

export interface InventoryHistoryEntry {
  id: string;
  timestamp: string;
  type: 'import' | 'export' | 'adjust';
  quantity: number;
  note: string;
  performedBy: string;
}

export interface InventoryStats {
  total: number;
  inStock: number;
  outOfStock: number;
}
