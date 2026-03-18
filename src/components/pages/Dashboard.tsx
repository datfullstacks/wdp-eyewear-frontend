'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  CalendarRange,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Target,
  TrendingUp,
  UserPlus,
} from 'lucide-react';

import { StatCard } from '@/components/molecules/StatCard';
import { Header } from '@/components/organisms/Header';
import {
  saleDashboardData,
  type DashboardBreakdownItem,
  type DashboardTone,
  type SaleDashboardMonth,
} from '@/lib/mock-data/saleDashboard';
import { cn } from '@/lib/utils';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('vi-VN');
const percentFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 1,
});

const toneClasses: Record<
  DashboardTone,
  {
    dot: string;
    bar: string;
  }
> = {
  amber: {
    dot: 'bg-amber-500',
    bar: 'bg-gradient-to-r from-amber-400 to-orange-400',
  },
  sky: {
    dot: 'bg-sky-500',
    bar: 'bg-gradient-to-r from-sky-400 to-cyan-400',
  },
  emerald: {
    dot: 'bg-emerald-500',
    bar: 'bg-gradient-to-r from-emerald-400 to-teal-400',
  },
  violet: {
    dot: 'bg-violet-500',
    bar: 'bg-gradient-to-r from-violet-400 to-fuchsia-400',
  },
};

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatCompactCurrency(value: number) {
  const formatDecimal = (amount: number) =>
    Number.isInteger(amount) ? `${amount}` : amount.toFixed(1);

  if (value >= 1_000_000_000) {
    return `${formatDecimal(value / 1_000_000_000)} tỷ`;
  }

  return `${formatDecimal(value / 1_000_000)} triệu`;
}

function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`;
}

function buildTrend(current: number, previous?: number) {
  if (!previous) {
    return {
      value: 0,
      isPositive: true,
    };
  }

  const delta = ((current - previous) / previous) * 100;

  return {
    value: Number(Math.abs(delta).toFixed(1)),
    isPositive: delta >= 0,
  };
}

function getAverageOrderValue(month: SaleDashboardMonth) {
  return Math.round(month.revenue / month.orders);
}

function BreakdownCard({
  title,
  subtitle,
  icon: Icon,
  items,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  items: DashboardBreakdownItem[];
}) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-amber-300 to-orange-300 p-2.5 text-slate-900 shadow-sm">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200/70 bg-white/70 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn('h-2.5 w-2.5 rounded-full', toneClasses[item.tone].dot)}
                  />
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(item.revenue)}
                </p>
              </div>

              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold',
                  item.change >= 0
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                )}
              >
                {item.change >= 0 ? '+' : ''}
                {percentFormatter.format(item.change)}%
              </span>
            </div>

            <div className="mt-3 h-2.5 rounded-full bg-slate-100">
              <div
                className={cn('h-full rounded-full', toneClasses[item.tone].bar)}
                style={{ width: `${item.share}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{item.share}% doanh thu</span>
              <span>{formatCompactCurrency(item.revenue)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart({
  data,
  selectedMonthId,
}: {
  data: SaleDashboardMonth[];
  selectedMonthId: string;
}) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue));
  const maxOrders = Math.max(...data.map((item) => item.orders));
  const guideRatios = [100, 75, 50, 25, 0];
  const orderPoints = data.map((item, index) => {
    const x = ((index + 0.5) / data.length) * 100;
    const y = 100 - (item.orders / maxOrders) * 100;

    return {
      id: item.id,
      x,
      y,
    };
  });

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-2.5 text-white shadow-sm">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Xu hướng doanh thu theo tháng
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                So sánh 6 tháng gần nhất theo doanh thu và số đơn hoàn tất.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 ring-1 ring-slate-200">
            <span className="h-3 w-3 rounded-sm bg-gradient-to-r from-amber-400 to-orange-400" />
            Doanh thu
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 ring-1 ring-slate-200">
            <span className="relative inline-flex h-3 w-5 items-center">
              <span className="h-0.5 w-5 bg-slate-700" />
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700" />
            </span>
            Số đơn
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[56px_1fr]">
        <div className="hidden h-[320px] flex-col justify-between py-2 text-xs text-slate-400 lg:flex">
          {guideRatios.map((ratio) => (
            <span key={ratio}>
              {Math.round((maxRevenue * ratio) / 100 / 1_000_000)}
              M
            </span>
          ))}
        </div>

        <div className="relative h-[320px]">
          <div className="absolute inset-x-2 top-2 bottom-14 flex flex-col justify-between">
            {guideRatios.map((ratio) => (
              <div
                key={ratio}
                className="border-t border-dashed border-slate-200/80"
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-4 top-2 bottom-14">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                points={orderPoints.map((point) => `${point.x},${point.y}`).join(' ')}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                className="text-slate-700"
              />

              {orderPoints.map((point) => (
                <circle
                  key={point.id}
                  cx={point.x}
                  cy={point.y}
                  r={point.id === selectedMonthId ? 3 : 2.3}
                  className={cn(
                    point.id === selectedMonthId ? 'fill-amber-500' : 'fill-slate-700'
                  )}
                />
              ))}
            </svg>
          </div>

          <div className="absolute inset-x-0 top-2 bottom-0 flex gap-3 px-2 pb-2">
            {data.map((item) => {
              const revenueHeight = Math.max((item.revenue / maxRevenue) * 100, 18);
              const selected = item.id === selectedMonthId;

              return (
                <div key={item.id} className="flex h-full flex-1 flex-col">
                  <div className="relative flex-1">
                    <div className="absolute inset-0 flex items-end justify-center">
                      <div
                        className={cn(
                          'relative w-full max-w-16 rounded-t-[1.25rem] border shadow-lg transition-all duration-300',
                          selected
                            ? 'border-amber-100 bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200 shadow-amber-100/90'
                            : 'border-white/80 bg-gradient-to-t from-slate-300 via-slate-200 to-white shadow-slate-200/90'
                        )}
                        style={{ height: `${revenueHeight}%` }}
                      >
                        <div
                          className={cn(
                            'absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-full px-2 py-1 text-[11px] font-semibold shadow-sm md:inline-flex',
                            selected
                              ? 'bg-slate-900 text-white'
                              : 'bg-white/95 text-slate-700 ring-1 ring-slate-200'
                          )}
                        >
                          {formatCompactCurrency(item.revenue)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 text-center">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        selected ? 'text-slate-900' : 'text-slate-600'
                      )}
                    >
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {numberFormatter.format(item.orders)} đơn
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const defaultMonth = saleDashboardData[saleDashboardData.length - 1];
  const [selectedMonthId, setSelectedMonthId] = useState(defaultMonth.id);

  const selectedIndex = saleDashboardData.findIndex((item) => item.id === selectedMonthId);
  const selectedMonth = saleDashboardData[selectedIndex] ?? defaultMonth;
  const previousMonth = selectedIndex > 0 ? saleDashboardData[selectedIndex - 1] : undefined;
  const averageOrderValue = getAverageOrderValue(selectedMonth);
  const previousAverageOrderValue = previousMonth
    ? getAverageOrderValue(previousMonth)
    : undefined;
  const targetProgress = (selectedMonth.revenue / selectedMonth.target) * 100;
  const bestChannel = [...selectedMonth.channels].sort((a, b) => b.share - a.share)[0];
  const bestCategory = [...selectedMonth.categories].sort((a, b) => b.share - a.share)[0];
  const highestWeeklyRevenue = Math.max(
    ...selectedMonth.weeklyTrend.map((week) => week.revenue)
  );

  const summaryStats = [
    {
      title: 'Doanh thu tháng',
      value: formatCompactCurrency(selectedMonth.revenue),
      icon: DollarSign,
      trend: previousMonth
        ? buildTrend(selectedMonth.revenue, previousMonth.revenue)
        : undefined,
    },
    {
      title: 'Đơn hoàn tất',
      value: numberFormatter.format(selectedMonth.orders),
      icon: ShoppingCart,
      trend: previousMonth
        ? buildTrend(selectedMonth.orders, previousMonth.orders)
        : undefined,
    },
    {
      title: 'Giá trị đơn trung bình',
      value: formatCompactCurrency(averageOrderValue),
      icon: CreditCard,
      trend: previousAverageOrderValue
        ? buildTrend(averageOrderValue, previousAverageOrderValue)
        : undefined,
    },
    {
      title: 'Khách mới trong tháng',
      value: numberFormatter.format(selectedMonth.newCustomers),
      icon: UserPlus,
      trend: previousMonth
        ? buildTrend(selectedMonth.newCustomers, previousMonth.newCustomers)
        : undefined,
    },
  ];

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Thống kê bán hàng theo tháng với dữ liệu demo để chốt layout trước khi nối API thật"
      />

      <div className="space-y-6 p-6">
        <section className="animate-fade-in">
          <div className="glass-card overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Dữ liệu demo
                </div>

                <div>
                  <h2 className="font-display text-2xl font-semibold text-slate-900">
                    Giao diện thống kê theo tháng cho sale dashboard
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Trang này đang dùng dữ liệu cứng theo từng tháng để đội sale có thể
                    duyệt bố cục, biểu đồ và các chỉ số cần hiển thị trước khi nối
                    backend.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Phạm vi
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      6 tháng gần nhất
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Tháng đang xem
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedMonth.fullLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Trạng thái
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Sẵn sàng thay bằng API thật
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {saleDashboardData.map((month) => {
                  const selected = month.id === selectedMonthId;

                  return (
                    <button
                      key={month.id}
                      type="button"
                      onClick={() => setSelectedMonthId(month.id)}
                      className={cn(
                        'rounded-2xl px-4 py-3 text-left transition-all duration-200',
                        selected
                          ? 'bg-slate-900 text-white shadow-lg'
                          : 'bg-white/80 text-slate-700 ring-1 ring-slate-200 hover:bg-white'
                      )}
                    >
                      <p className="text-sm font-semibold">{month.label}</p>
                      <p
                        className={cn(
                          'mt-1 text-xs',
                          selected ? 'text-slate-300' : 'text-slate-500'
                        )}
                      >
                        {formatCompactCurrency(month.revenue)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="animate-fade-in">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryStats.map((stat) => (
              <StatCard
                key={stat.title}
                {...stat}
                className="p-4"
                titleClassName="text-xs uppercase tracking-[0.18em]"
                valueClassName="text-2xl"
                trendClassName="text-xs"
                iconWrapperClassName="rounded-xl bg-gradient-to-br from-amber-300 to-orange-300 p-3"
                iconSize="md"
              />
            ))}
          </div>
        </section>

        <section className="animate-slide-in">
          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <TrendChart data={saleDashboardData} selectedMonthId={selectedMonthId} />

            <div className="space-y-6">
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-2.5 text-white shadow-sm">
                        <Target className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Tiến độ so với mục tiêu
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Theo dõi kết quả tháng đang chọn để đặt KPI cho sale.
                        </p>
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      targetProgress >= 100
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                    )}
                  >
                    {targetProgress >= 100 ? 'Vượt mục tiêu' : 'Đang bám mục tiêu'}
                  </span>
                </div>

                <div className="mt-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-semibold text-slate-900">
                        {Math.round(targetProgress)}%
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatCurrency(selectedMonth.revenue)} /{' '}
                        {formatCurrency(selectedMonth.target)}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {selectedMonth.fullLabel}
                    </span>
                  </div>

                  <div className="mt-4 h-3 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-slate-900 via-amber-500 to-orange-400"
                      style={{ width: `${Math.min(targetProgress, 100)}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {targetProgress >= 100
                      ? `Tháng này đang vượt ${formatCompactCurrency(
                          selectedMonth.revenue - selectedMonth.target
                        )} so với mục tiêu.`
                      : `Còn thiếu ${formatCompactCurrency(
                          selectedMonth.target - selectedMonth.revenue
                        )} để chạm KPI doanh thu.`}
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Fulfillment
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {formatPercent(selectedMonth.fulfillmentRate)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Giao đúng hẹn
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {formatPercent(selectedMonth.onTimeRate)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Hoàn đổi
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {formatPercent(selectedMonth.refundRate)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-900 px-4 py-4 text-white">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                      Kênh dẫn đầu
                    </p>
                    <p className="mt-2 text-base font-semibold">{bestChannel.label}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {bestChannel.share}% doanh thu tháng
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 px-4 py-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Nhóm bán tốt
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {bestCategory.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {bestCategory.share}% doanh thu tháng
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-amber-300 to-orange-300 p-2.5 text-slate-900 shadow-sm">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Điểm nhấn nên hiển thị
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Các insight phù hợp cho dashboard sale khi chưa có data thật.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {selectedMonth.highlights.map((highlight, index) => (
                    <div
                      key={highlight}
                      className="rounded-2xl border border-slate-200/70 bg-white/70 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-6 text-slate-600">{highlight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="animate-slide-in">
          <div className="grid gap-6 xl:grid-cols-2">
            <BreakdownCard
              title="Cơ cấu kênh bán"
              subtitle="Tỷ trọng doanh thu để ưu tiên kênh sale và quảng cáo."
              icon={TrendingUp}
              items={selectedMonth.channels}
            />
            <BreakdownCard
              title="Cơ cấu nhóm sản phẩm"
              subtitle="Nhóm hàng nào nên giữ ở block nổi bật trên dashboard."
              icon={Package}
              items={selectedMonth.categories}
            />
          </div>
        </section>

        <section className="animate-slide-in">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-2.5 text-white shadow-sm">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Top sản phẩm bán tốt
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Danh sách gợi ý để sale nhìn nhanh SKU đang kéo doanh thu.
                      </p>
                    </div>
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {selectedMonth.topProducts.length} SKU
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {selectedMonth.topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="grid gap-4 rounded-2xl border border-slate-200/70 bg-white/75 p-4 sm:grid-cols-[auto_1fr_auto]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                      {index + 1}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {product.name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {product.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          {numberFormatter.format(product.unitsSold)} chiếc
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Doanh thu SKU</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-amber-300 to-orange-300 p-2.5 text-slate-900 shadow-sm">
                  <CalendarRange className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Nhịp bán trong tháng
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Snapshot theo tuần để nhìn ra thời điểm chốt đơn mạnh.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {selectedMonth.weeklyTrend.map((week) => (
                  <div
                    key={week.label}
                    className="rounded-2xl border border-slate-200/70 bg-white/75 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-slate-900">{week.label}</p>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {numberFormatter.format(week.orders)} đơn
                      </span>
                    </div>

                    <p className="mt-3 text-xl font-semibold text-slate-900">
                      {formatCompactCurrency(week.revenue)}
                    </p>

                    <div className="mt-3 h-2.5 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-slate-900 via-amber-500 to-orange-400"
                        style={{
                          width: `${(week.revenue / highestWeeklyRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                  Chỉ số bổ sung
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-slate-300">Tỷ lệ quay lại</p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatPercent(selectedMonth.returningRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Tỷ lệ chuyển đổi</p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatPercent(selectedMonth.conversionRate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
