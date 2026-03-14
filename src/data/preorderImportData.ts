import type {
  PreorderBatch,
  PreorderBatchStatus,
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

export const getStatusConfig = (status: PreorderBatchStatus) => {
  switch (status) {
    case 'pending':
      return { label: 'Dang xu ly', variant: 'secondary' as const, icon: Clock };
    case 'in_transit':
      return {
        label: 'Dang van chuyen',
        variant: 'default' as const,
        icon: Truck,
      };
    case 'partial':
      return {
        label: 'Nhan mot phan',
        variant: 'outline' as const,
        icon: PackageCheck,
      };
    case 'completed':
      return {
        label: 'Hoan thanh',
        variant: 'default' as const,
        icon: CheckCircle2,
      };
    case 'delayed':
      return {
        label: 'Tre hang',
        variant: 'destructive' as const,
        icon: AlertTriangle,
      };
    default:
      return { label: status, variant: 'secondary' as const, icon: Package };
  }
};

export const extractSuppliers = (batches: PreorderBatch[]) =>
  [...new Set(batches.map((batch) => batch.supplier).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );

export const calculateStats = (
  batches: PreorderBatch[]
): PreorderImportStats => ({
  total: batches.length,
  pending: batches.filter((batch) => batch.status === 'pending').length,
  inTransit: batches.filter((batch) => batch.status === 'in_transit').length,
  delayed: batches.filter((batch) => batch.status === 'delayed').length,
});
