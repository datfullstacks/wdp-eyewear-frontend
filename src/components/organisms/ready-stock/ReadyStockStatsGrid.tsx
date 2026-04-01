import type { OrderRecord } from '@/api/orders';
import { StatCard } from '@/components/molecules/StatCard';
import {
  ClipboardList,
  Hand,
  Package,
  PackageCheck,
  Truck,
} from 'lucide-react';
import type {
  ReadyStockOrderOpsState,
  ReadyStockOpsStatus,
} from '@/types/readyStockOps';

type Stats = {
  awaitingAccept: number;
  picking: number;
  packing: number;
  awaitingShipment: number;
  delivered: number;
};

function isIn(
  orderOps: ReadyStockOrderOpsState,
  statuses: ReadyStockOpsStatus[]
) {
  return statuses.includes(orderOps.opsStatus);
}

export function ReadyStockStatsGrid({
  orders,
  resolveOps,
}: {
  orders: OrderRecord[];
  resolveOps: (order: OrderRecord) => ReadyStockOrderOpsState;
}) {
  const stats: Stats = orders.reduce<Stats>(
    (acc, order) => {
      const ops = resolveOps(order);

      if (isIn(ops, ['pending_operations'])) acc.awaitingAccept += 1;
      if (isIn(ops, ['picking'])) acc.picking += 1;
      if (isIn(ops, ['packing'])) acc.packing += 1;
      if (isIn(ops, ['ready_to_ship'])) acc.awaitingShipment += 1;
      if (isIn(ops, ['delivered', 'closed'])) {
        acc.delivered += 1;
      }

      return acc;
    },
    {
      awaitingAccept: 0,
      picking: 0,
      packing: 0,
      awaitingShipment: 0,
      delivered: 0,
    }
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      <StatCard
        title={'Ch\u1edd nh\u1eadn x\u1eed l\u00fd'}
        value={stats.awaitingAccept.toString()}
        icon={Hand}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        title={'\u0110ang l\u1ea5y h\u00e0ng'}
        value={stats.picking.toString()}
        icon={ClipboardList}
        iconColor="text-primary"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        title={'\u0110ang \u0111\u00f3ng g\u00f3i'}
        value={stats.packing.toString()}
        icon={Package}
        iconColor="text-warning"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        title={'Ch\u1edd t\u1ea1o v\u1eadn \u0111\u01a1n'}
        value={stats.awaitingShipment.toString()}
        icon={Truck}
        iconColor="text-success"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        title={'T\u1ed5ng s\u1ed1 \u0111\u01a1n \u0111\u00e3 giao'}
        value={stats.delivered.toString()}
        icon={PackageCheck}
        iconColor="text-success"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
    </div>
  );
}
