import { DashboardStatCard } from '@/components/molecules/DashboardStatCard';
import { Clock, Package, PackageCheck, AlertTriangle } from 'lucide-react';

interface HandoverStatsGridProps {
  pendingCount: number;
  readyCount: number;
  confirmedCount: number;
  waitingConfirmCount: number;
}

export const HandoverStatsGrid = ({
  pendingCount,
  readyCount,
  confirmedCount,
  waitingConfirmCount,
}: HandoverStatsGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <DashboardStatCard
        icon={Clock}
        label="Chờ đóng gói"
        value={pendingCount}
        color="warning"
      />
      <DashboardStatCard
        icon={Package}
        label="Sẵn sàng bàn giao"
        value={readyCount}
        color="primary"
      />
      <DashboardStatCard
        icon={PackageCheck}
        label="Đã bàn giao hôm nay"
        value={confirmedCount}
        color="success"
      />
      <DashboardStatCard
        icon={AlertTriangle}
        label="Chờ xác nhận"
        value={waitingConfirmCount}
        color="error"
      />
    </div>
  );
};
