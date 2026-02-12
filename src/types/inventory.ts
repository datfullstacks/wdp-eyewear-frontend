export type InventoryStatus =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'overstock';

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
  lowStock: number;
  outOfStock: number;
}
