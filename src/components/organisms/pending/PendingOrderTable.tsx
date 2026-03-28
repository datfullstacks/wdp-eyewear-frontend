import { Package } from 'lucide-react';

import { PendingOrderRow } from '@/components/molecules/PendingOrderRow';
import { PendingOrder } from '@/types/pending';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('manager.orders.table');

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>{t('orderId')}</TableHead>
            <TableHead>{t('customer')}</TableHead>
            <TableHead>{t('products')}</TableHead>
            <TableHead>{t('total')}</TableHead>
            <TableHead>{t('payment')}</TableHead>
            <TableHead>{t('type')}</TableHead>
            <TableHead>{t('time')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
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
            {t('noOrders')}
          </p>
        </div>
      )}
    </div>
  );
};
