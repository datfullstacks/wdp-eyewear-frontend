import type { OrderRecord } from '@/api/orders';
import { StatCard } from '@/components/molecules/StatCard';
import {
  ClipboardList,
  Hand,
  Package,
  PackageCheck,
  PauseCircle,
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
  handedOver: number;
  hold: number;
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
      if (isIn(ops, ['shipment_created', 'handover_to_carrier', 'in_transit'])) {
        acc.handedOver += 1;
      }
      if (isIn(ops, ['waiting_customer_info', 'on_hold', 'exception_hold'])) {
        acc.hold += 1;
      }

      return acc;
    },
    {
      awaitingAccept: 0,
      picking: 0,
      packing: 0,
      awaitingShipment: 0,
      handedOver: 0,
      hold: 0,
    }
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Cho nhan xu ly"
        value={stats.awaitingAccept.toString()}
        icon={Hand}
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        title="Dang lay hang"
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
        title="Dang dong goi"
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
        title="Cho tao van don"
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
        title="Da vao luong GHN"
        value={stats.handedOver.toString()}
        icon={PackageCheck}
        iconColor="text-success"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
      <StatCard
        title="Dang hold"
        value={stats.hold.toString()}
        icon={PauseCircle}
        iconColor="text-destructive"
        className="p-3"
        titleClassName="text-foreground/90 text-sm"
        valueClassName="text-2xl"
        showIcon={false}
        inline
      />
    </div>
  );
}
