import { Package, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface PendingStatsGridProps {
  totalCount: number;
  urgentCount: number;
  highCount: number;
  selectedCount: number;
}

export const PendingStatsGrid = ({
  totalCount,
  urgentCount,
  highCount,
  selectedCount,
}: PendingStatsGridProps) => {
  const stats = [
    {
      label: 'Tổng đơn chờ',
      value: totalCount,
      icon: Package,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Khẩn cấp',
      value: urgentCount,
      icon: AlertTriangle,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      valueColor: 'text-destructive',
    },
    {
      label: 'Ưu tiên cao',
      value: highCount,
      icon: Clock,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      valueColor: 'text-warning',
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.valueColor || ''}`}>
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
