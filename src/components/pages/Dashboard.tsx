'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { RecentOrdersTable } from '@/components/organisms/RecentOrdersTable';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { buildDetailPath } from '@/hooks/useDetailRoute';
import { orderApi, userApi, type OrderRecord } from '@/api';
import {
  computeOrderMenuCounts,
  getOrderAlertTypes,
  needsActionOrder,
  needsPrescriptionSupplement,
} from '@/lib/orderWorkflow';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BellRing,
  ClipboardList,
  CreditCard,
  ShoppingCart,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function resolveDashboardSectionPath(
  pathname: string,
  section:
    | 'orders'
    | 'products'
    | 'orders/pending'
    | 'orders/prescription-needed'
    | 'orders/alerts'
    | 'cases/refunds'
    | 'cases/returns'
    | 'customers'
    | 'checkout'
): string {
  const normalizedPath = String(pathname || '').replace(/\/+$/, '');

  if (normalizedPath.startsWith('/sale/dashboard')) {
    return `/sale/${section}`;
  }

  if (normalizedPath.startsWith('/dashboard')) {
    return `/dashboard/${section}`;
  }

  return `/${section}`;
}

function isSameLocalDay(dateValue?: string): boolean {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function normalizeRawStatus(order: Pick<OrderRecord, 'rawStatus'>): string {
  return String(order.rawStatus || '')
    .trim()
    .toLowerCase();
}

function isRefundCaseOpen(order: OrderRecord): boolean {
  const refundStatus = String(order.refund?.status || '')
    .trim()
    .toLowerCase();

  return Boolean(
    refundStatus && !['none', 'completed', 'rejected'].includes(refundStatus)
  );
}

function isCancelledOrder(order: OrderRecord): boolean {
  return normalizeRawStatus(order) === 'cancelled';
}

function formatCompactCurrency(value: number): string {
  return currencyFormatter.format(value || 0);
}

async function getTodayCustomerCount(): Promise<number> {
  const pageSize = 200;
  let page = 1;
  let totalPages = 1;
  let count = 0;

  while (page <= totalPages) {
    const result = await userApi.getAll({
      page,
      limit: pageSize,
      role: 'customer',
    });

    count += result.users.filter((customer) => isSameLocalDay(customer.createdAt)).length;
    totalPages = Math.max(1, Math.ceil(result.total / Math.max(result.pageSize, 1)));

    if (result.users.length === 0) break;
    page += 1;
  }

  return count;
}

type QueueTone = 'warning' | 'error' | 'info' | 'success';

function queueToneClasses(tone: QueueTone) {
  const map: Record<QueueTone, string> = {
    warning: 'border-amber-200 bg-amber-50/80 text-amber-950',
    error: 'border-rose-200 bg-rose-50/80 text-rose-950',
    info: 'border-sky-200 bg-sky-50/80 text-sky-950',
    success: 'border-emerald-200 bg-emerald-50/80 text-emerald-950',
  };

  return map[tone];
}

type QueueCardProps = {
  title: string;
  description: string;
  value: number;
  href: string;
  tone: QueueTone;
};

function QueueCard({ title, description, value, href, tone }: QueueCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        queueToneClasses(tone)
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm opacity-80">{description}</p>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-lg font-semibold shadow-sm">
          {value}
        </span>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
        Mở hàng đợi
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

type QuickActionProps = {
  title: string;
  description: string;
  href: string;
};

function QuickActionCard({ title, description, href }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="glass-card group border-border/80 block rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-foreground text-sm font-semibold">{title}</p>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        <ArrowRight className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

const Dashboard = () => {
  const pathname = usePathname();
  const ordersPath = resolveDashboardSectionPath(pathname, 'orders');
  const pendingPath = resolveDashboardSectionPath(pathname, 'orders/pending');
  const prescriptionNeededPath = resolveDashboardSectionPath(
    pathname,
    'orders/prescription-needed'
  );
  const refundsPath = resolveDashboardSectionPath(pathname, 'cases/refunds');
  const returnsPath = resolveDashboardSectionPath(pathname, 'cases/returns');
  const customersPath = resolveDashboardSectionPath(pathname, 'customers');

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [todayCustomerCount, setTodayCustomerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const [ordersResult, customersResult] = await Promise.allSettled([
        orderApi.getAll({ page: 1, limit: 500 }),
        getTodayCustomerCount(),
      ]);

      if (!isMounted) return;

      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value.orders);
      } else {
        setOrders([]);
      }

      if (customersResult.status === 'fulfilled') {
        setTodayCustomerCount(customersResult.value);
      } else {
        setTodayCustomerCount(0);
      }

      if (
        ordersResult.status === 'rejected' &&
        customersResult.status === 'rejected'
      ) {
        setErrorMessage('Không tải được tổng quan dashboard của sale.');
      }

      setIsLoading(false);
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const overview = useMemo(() => {
    const activeOrders = orders.filter(
      (order) => !['cancelled', 'returned'].includes(normalizeRawStatus(order))
    );
    const todayOrders = activeOrders.filter((order) =>
      isSameLocalDay(order.createdAt)
    );
    const todayOrderCount = todayOrders.length;
    const todayGross = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const todayCollected = todayOrders.reduce(
      (sum, order) => sum + Math.max(0, Number(order.paidAmount || 0)),
      0
    );
    const menuCounts = computeOrderMenuCounts(orders);
    const activeRefundCases = orders.filter(isRefundCaseOpen).length;
    const cancelledOrders = orders.filter(isCancelledOrder).length;
    const urgentOrders = orders.filter(
      (order) =>
        needsActionOrder(order) ||
        needsPrescriptionSupplement(order) ||
        getOrderAlertTypes(order).length > 0 ||
        isRefundCaseOpen(order)
    );

    return {
      todayOrderCount,
      todayGross,
      todayCollected,
      menuCounts,
      activeRefundCases,
      cancelledOrders,
      urgentOrders,
    };
  }, [orders]);

  const stats = useMemo(
    () => [
      {
        title: 'Đơn mới hôm nay',
        value: isLoading ? '--' : String(overview.todayOrderCount),
        icon: ShoppingCart,
      },
      {
        title: 'Giá trị đơn hôm nay',
        value: isLoading ? '--' : formatCompactCurrency(overview.todayGross),
        icon: Wallet,
      },
      {
        title: 'Đã thu / đặt cọc',
        value: isLoading
          ? '--'
          : formatCompactCurrency(overview.todayCollected),
        icon: CreditCard,
      },
      {
        title: 'Khách tạo hôm nay',
        value: isLoading ? '--' : String(todayCustomerCount),
        icon: Users,
      },
    ],
    [isLoading, overview, todayCustomerCount]
  );

  const queueCards = useMemo(
    () => [
      {
        title: 'Đơn cần xử lý',
        description: 'Chờ xác nhận, thanh toán hoặc cần sale tiếp tục.',
        value: overview.menuCounts.needsAction,
        href: pendingPath,
        tone: 'warning' as const,
      },
      {
        title: 'Bổ sung toa kính',
        description: 'Prescription cần sale liên hệ và bổ sung thông tin.',
        value: overview.menuCounts.prescriptionNeeded,
        href: prescriptionNeededPath,
        tone: 'info' as const,
      },
      {
        title: 'Đơn đã hủy',
        description: 'Theo dõi các đơn đã hủy để kiểm tra lại lịch sử xử lý.',
        value: overview.cancelledOrders,
        href: ordersPath,
        tone: 'error' as const,
      },
      {
        title: 'Case sau bán',
        description: 'Hoàn tiền, điều chỉnh và các case cần sale theo dõi.',
        value: overview.activeRefundCases,
        href: refundsPath,
        tone: 'success' as const,
      },
    ],
    [ordersPath, overview, pendingPath, prescriptionNeededPath, refundsPath]
  );

  const quickActions = useMemo(
    () => [
      {
        title: 'Theo dõi đơn cần xử lý',
        description: 'Mở danh sách đơn đang chờ xác nhận, thanh toán hoặc cần sale tiếp tục.',
        href: pendingPath,
      },
      {
        title: 'Tra cứu khách',
        description: 'Xem lịch sử đơn, ghi chú và thông tin liên hệ.',
        href: customersPath,
      },
      {
        title: 'Theo dõi đổi / trả',
        description: 'Vào hàng đợi sau bán để cập nhật hoàn tiền và đổi trả.',
        href: returnsPath,
      },
    ],
    [customersPath, pendingPath, returnsPath]
  );

  return (
    <>
      <Header
        title="Bảng điều khiển Sale"
        subtitle="Tổng quan doanh số, hàng đợi ưu tiên và tác vụ cần xử lý trong ngày"
      />

      <div className="space-y-8 p-6">
        <section className="animate-fade-in">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.title}>
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  className="p-3"
                  titleClassName="text-xs"
                  valueClassName="text-xl"
                  trendClassName="text-xs"
                  iconWrapperClassName="gradient-gold rounded-md p-2"
                  iconSize="md"
                />
              </div>
            ))}
          </div>

          {errorMessage && (
            <p className="text-destructive mt-3 text-sm">{errorMessage}</p>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="animate-slide-in space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-foreground flex items-center gap-2 text-lg font-semibold">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 shadow-sm shadow-amber-500/10">
                    <BellRing className="h-4.5 w-4.5 text-amber-700" />
                  </span>
                  Ưu tiên của sale
                </h2>
                <p className="text-muted-foreground text-sm">
                  Nhóm hàng đợi cần sale chăm và không nên để trễ trong ngày.
                </p>
              </div>
              {overview.urgentOrders.length > 0 && (
                <StatusBadge status="warning">
                  {overview.urgentOrders.length} cần xử lý
                </StatusBadge>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {queueCards.map((card) => (
                <QueueCard key={card.title} {...card} />
              ))}
            </div>
          </div>

          <div className="animate-slide-in space-y-4">
            <div>
              <h2 className="font-display text-foreground flex items-center gap-2 text-lg font-semibold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 shadow-sm shadow-sky-500/10">
                  <Sparkles className="h-4.5 w-4.5 text-sky-700" />
                </span>
                Lối tắt nghiệp vụ
              </h2>
              <p className="text-muted-foreground text-sm">
                Đi nhanh vào các tác vụ bán hàng mà sale dùng nhiều nhất.
              </p>
            </div>

            <div className="grid gap-4">
              {quickActions.map((action) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </div>
          </div>
        </section>

        <section className="animate-slide-in">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-foreground flex items-center gap-2 text-lg font-semibold">
                <ClipboardList className="text-accent h-5 w-5" />
                Đơn hàng gần đây
              </h2>
              <p className="text-muted-foreground text-sm">
                Theo dõi nhanh các đơn mới, trạng thái vận chuyển và chi tiết
                liên quan.
              </p>
            </div>
            <Link
              href={ordersPath}
              className="text-accent text-sm hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <RecentOrdersTable
            limit={120}
            emptyMessage="Chưa có đơn hàng nào để hiển thị trên dashboard sale."
            detailHref={(order) => buildDetailPath(ordersPath, order.id)}
          />
        </section>
      </div>
    </>
  );
};

export default Dashboard;
