import type {
  PreorderBatch,
  PreorderImportStats,
} from '@/types/preorderImport';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PackageCheck,
} from 'lucide-react';

export const mockBatches: PreorderBatch[] = [
  {
    id: '1',
    batchCode: 'PO-2024-001',
    supplier: 'Luxottica Vietnam',
    orderDate: '2024-01-15',
    expectedDate: '2024-02-01',
    status: 'in_transit',
    totalItems: 50,
    receivedItems: 0,
    items: [
      {
        id: '1-1',
        sku: 'RB-AVI-001',
        productName: 'Ray-Ban Aviator Classic',
        variant: 'Gold/Green - 58mm',
        orderedQty: 20,
        receivedQty: 0,
        pendingQty: 20,
      },
      {
        id: '1-2',
        sku: 'RB-WAY-002',
        productName: 'Ray-Ban Wayfarer',
        variant: 'Black/G-15 - 52mm',
        orderedQty: 15,
        receivedQty: 0,
        pendingQty: 15,
      },
      {
        id: '1-3',
        sku: 'OO-HOL-003',
        productName: 'Oakley Holbrook',
        variant: 'Matte Black - 55mm',
        orderedQty: 15,
        receivedQty: 0,
        pendingQty: 15,
      },
    ],
  },
  {
    id: '2',
    batchCode: 'PO-2024-002',
    supplier: 'EssilorLuxottica',
    orderDate: '2024-01-20',
    expectedDate: '2024-02-10',
    status: 'pending',
    totalItems: 30,
    receivedItems: 0,
    items: [
      {
        id: '2-1',
        sku: 'TF-CAT-001',
        productName: 'Tom Ford Cat Eye',
        variant: 'Havana - 54mm',
        orderedQty: 10,
        receivedQty: 0,
        pendingQty: 10,
      },
      {
        id: '2-2',
        sku: 'PR-LIN-002',
        productName: 'Prada Linea Rossa',
        variant: 'Blue/Silver - 56mm',
        orderedQty: 20,
        receivedQty: 0,
        pendingQty: 20,
      },
    ],
  },
  {
    id: '3',
    batchCode: 'PO-2024-003',
    supplier: 'Zeiss Vietnam',
    orderDate: '2024-01-10',
    expectedDate: '2024-01-25',
    status: 'partial',
    totalItems: 100,
    receivedItems: 60,
    items: [
      {
        id: '3-1',
        sku: 'ZS-PRO-001',
        productName: 'Zeiss Progressive Plus',
        variant: '1.67 Index',
        orderedQty: 50,
        receivedQty: 40,
        pendingQty: 10,
      },
      {
        id: '3-2',
        sku: 'ZS-SV-002',
        productName: 'Zeiss Single Vision',
        variant: '1.60 Index',
        orderedQty: 50,
        receivedQty: 20,
        pendingQty: 30,
      },
    ],
  },
  {
    id: '4',
    batchCode: 'PO-2024-004',
    supplier: 'Hoya Lens Vietnam',
    orderDate: '2024-01-05',
    expectedDate: '2024-01-20',
    status: 'delayed',
    totalItems: 40,
    receivedItems: 0,
    items: [
      {
        id: '4-1',
        sku: 'HY-BLU-001',
        productName: 'Hoya Blue Control',
        variant: '1.60 Index',
        orderedQty: 40,
        receivedQty: 0,
        pendingQty: 40,
      },
    ],
  },
  {
    id: '5',
    batchCode: 'PO-2023-050',
    supplier: 'Luxottica Vietnam',
    orderDate: '2023-12-20',
    expectedDate: '2024-01-10',
    status: 'completed',
    totalItems: 25,
    receivedItems: 25,
    items: [
      {
        id: '5-1',
        sku: 'GC-SQ-001',
        productName: 'Gucci Square Frame',
        variant: 'Black/Gold - 54mm',
        orderedQty: 25,
        receivedQty: 25,
        pendingQty: 0,
      },
    ],
  },
];

export const getStatusConfig = (status: PreorderBatch['status']) => {
  switch (status) {
    case 'pending':
      return { label: 'Chờ xử lý', variant: 'secondary' as const, icon: Clock };
    case 'in_transit':
      return {
        label: 'Đang vận chuyển',
        variant: 'default' as const,
        icon: Truck,
      };
    case 'partial':
      return {
        label: 'Nhận một phần',
        variant: 'outline' as const,
        icon: PackageCheck,
      };
    case 'completed':
      return {
        label: 'Hoàn thành',
        variant: 'default' as const,
        icon: CheckCircle2,
      };
    case 'delayed':
      return {
        label: 'Trễ hàng',
        variant: 'destructive' as const,
        icon: AlertTriangle,
      };
    default:
      return { label: status, variant: 'secondary' as const, icon: Package };
  }
};

export const getSuppliers = () => [
  ...new Set(mockBatches.map((b) => b.supplier)),
];

export const calculateStats = (
  batches: PreorderBatch[]
): PreorderImportStats => ({
  total: batches.length,
  pending: batches.filter((b) => b.status === 'pending').length,
  inTransit: batches.filter((b) => b.status === 'in_transit').length,
  delayed: batches.filter((b) => b.status === 'delayed').length,
});
