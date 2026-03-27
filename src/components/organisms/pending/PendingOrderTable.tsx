import { Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PendingOrderRow } from '@/components/molecules/PendingOrderRow';
import { PendingOrder } from '@/types/pending';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PendingOrderTableProps {
  orders: PendingOrder[];
  scope?: 'sale' | 'manager';
  selectedOrders: string[];
  showEmptyState?: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOrder: (orderId: string, checked: boolean) => void;
  onViewDetail: (order: PendingOrder) => void;
  onProcess: (order: PendingOrder) => void;
  onReject: (order: PendingOrder) => void;
  onEscalate: (order: PendingOrder) => void;
  onSendBack: (order: PendingOrder) => void;
}

export const PendingOrderTable = ({
  orders,
  scope = 'sale',
  selectedOrders,
  showEmptyState = true,
  onSelectOrder,
  onViewDetail,
  onProcess,
  onReject,
  onEscalate,
  onSendBack,
}: PendingOrderTableProps) => {
  const t = useTranslations('manager.pending');

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>{t('table.code')}</TableHead>
            <TableHead>{t('table.customer')}</TableHead>
            <TableHead>{t('table.products')}</TableHead>
            <TableHead>{t('table.total')}</TableHead>
            <TableHead>{t('table.payment')}</TableHead>
            <TableHead>{t('table.orderType')}</TableHead>
            <TableHead>{t('table.time')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <PendingOrderRow
              key={order.id}
              order={order}
              scope={scope}
              isSelected={selectedOrders.includes(order.id)}
              onSelect={onSelectOrder}
              onViewDetail={onViewDetail}
              onProcess={onProcess}
              onReject={onReject}
              onEscalate={onEscalate}
              onSendBack={onSendBack}
            />
          ))}
        </TableBody>
      </Table>

      {showEmptyState && orders.length === 0 && (
        <div className="p-12 text-center">
          <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground">
            {t('table.noData')}
          </p>
        </div>
      )}
    </div>
  );
};
