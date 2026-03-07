import { Package, CheckCircle } from 'lucide-react';

interface PendingStatsGridProps {
  totalCount: number;
  selectedCount: number;
}

export const PendingStatsGrid = ({
  totalCount,
  selectedCount,
}: PendingStatsGridProps) => {
  const stats = [
    {
      label: 'Tổng đơn',
      value: totalCount,
      icon: Package,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Đã chọn',
      value: selectedCount,
      icon: CheckCircle,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card border-border rounded-xl border p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-foreground text-sm font-bold tracking-wide">
                  {stat.label}
                </p>
                <p className="text-foreground text-2xl font-extrabold leading-none">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
