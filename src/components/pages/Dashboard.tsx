'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { RecentOrdersTable } from '@/components/organisms/RecentOrdersTable';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { buildDetailPath } from '@/hooks/useDetailRoute';
import { orderApi, productApi, type OrderRecord } from '@/api';
import {
  computeOrderMenuCounts,
  getOrderAlertTypes,
  isPreorderOrder,
  needsActionOrder,
  needsPrescriptionSupplement,
} from '@/lib/orderWorkflow';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BellRing,
  ClipboardList,
  CreditCard,
  FileHeart,
  Package,
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

function isPreorderStillActive(order: OrderRecord): boolean {
  if (!isPreorderOrder(order)) return false;

  return !['cancelled', 'returned', 'delivered'].includes(
    normalizeRawStatus(order)
  );
}

function toCustomerKey(order: OrderRecord): string {
  const phone = String(order.customerPhone || '').trim();
  const name = String(order.customerName || '').trim().toLowerCase();
  return phone || name;
}

function formatCompactCurrency(value: number): string {
  return currencyFormatter.format(value || 0);
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

function QueueCard({
  title,
  description,
  value,
  href,
  tone,
}: QueueCardProps) {
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
        Mo queue
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
      className="glass-card group block rounded-xl border border-border/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
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
  const alertsPath = resolveDashboardSectionPath(pathname, 'orders/alerts');
  const refundsPath = resolveDashboardSectionPath(pathname, 'cases/refunds');
  const returnsPath = resolveDashboardSectionPath(pathname, 'cases/returns');
  const productsPath = resolveDashboardSectionPath(pathname, 'products');
  const customersPath = resolveDashboardSectionPath(pathname, 'customers');
  const checkoutPath = resolveDashboardSectionPath(pathname, 'checkout');

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeProductCount, setActiveProductCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const [ordersResult, productsResult] = await Promise.allSettled([
        orderApi.getAll({ page: 1, limit: 500 }),
        productApi.getAll({ page: 1, limit: 1, status: 'active' }),
      ]);

      if (!isMounted) return;

      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value.orders);
      } else {
        setOrders([]);
      }

      if (productsResult.status === 'fulfilled') {
        setActiveProductCount(productsResult.value.total);
      } else {
        setActiveProductCount(0);
      }

      if (
        ordersResult.status === 'rejected' &&
        productsResult.status === 'rejected'
      ) {
        setErrorMessage('Khong tai duoc overview dashboard cua sale.');
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
    const todayOrders = activeOrders.filter((order) => isSameLocalDay(order.createdAt));
    const todayOrderCount = todayOrders.length;
    const todayGross = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const todayCollected = todayOrders.reduce(
      (sum, order) => sum + Math.max(0, Number(order.paidAmount || 0)),
      0
    );
    const customerKeys = new Set(
      activeOrders.map(toCustomerKey).filter((value) => value.trim().length > 0)
    );
    const menuCounts = computeOrderMenuCounts(orders);
    const activeRefundCases = orders.filter(isRefundCaseOpen).length;
    const activePreorders = orders.filter(isPreorderStillActive).length;
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
      activeCustomerCount: customerKeys.size,
      menuCounts,
      activeRefundCases,
      activePreorders,
      urgentOrders,
    };
  }, [orders]);

  const stats = useMemo(
    () => [
      {
        title: 'Don moi hom nay',
        value: isLoading ? '--' : String(overview.todayOrderCount),
        icon: ShoppingCart,
        helper: `${overview.activePreorders} preorder dang theo doi`,
      },
      {
        title: 'Gia tri don hom nay',
        value: isLoading ? '--' : formatCompactCurrency(overview.todayGross),
        icon: Wallet,
        helper: `${activeProductCount} SKU dang ban`,
      },
      {
        title: 'Da thu / dat coc',
        value: isLoading ? '--' : formatCompactCurrency(overview.todayCollected),
        icon: CreditCard,
        helper: 'Tinh tren don tao trong ngay',
      },
      {
        title: 'Khach dang theo doi',
        value: isLoading ? '--' : String(overview.activeCustomerCount),
        icon: Users,
        helper: `${overview.urgentOrders.length} case can sale cham`,
      },
    ],
    [activeProductCount, isLoading, overview]
  );

  const queueCards = useMemo(
    () => [
      {
        title: 'Don can xu ly',
        description: 'Cho xac nhan, thanh toan hoac can sale tiep tuc.',
        value: overview.menuCounts.needsAction,
        href: pendingPath,
        tone: 'warning' as const,
      },
      {
        title: 'Bo sung toa kinh',
        description: 'Prescription can sale lien he va bo sung thong tin.',
        value: overview.menuCounts.prescriptionNeeded,
        href: prescriptionNeededPath,
        tone: 'info' as const,
      },
      {
        title: 'Canh bao SLA',
        description: 'Don tre, preorder qua ETA hoac case co nguy co bi sot.',
        value: overview.menuCounts.alerts,
        href: alertsPath,
        tone: 'error' as const,
      },
      {
        title: 'Case sau ban',
        description: 'Refund, dieu chinh va cac case can sale theo doi.',
        value: overview.activeRefundCases,
        href: refundsPath,
        tone: 'success' as const,
      },
    ],
    [alertsPath, overview, pendingPath, prescriptionNeededPath, refundsPath]
  );

  const quickActions = useMemo(
    () => [
      {
        title: 'Tao don moi',
        description: 'Mo POS va bat dau len don nhanh cho khach tai quay.',
        href: productsPath,
      },
      {
        title: 'Mo checkout',
        description: 'Xu ly gio hang, quote va tao QR thanh toan SePay.',
        href: checkoutPath,
      },
      {
        title: 'Tra cuu khach',
        description: 'Xem lich su don, ghi chu va thong tin lien he.',
        href: customersPath,
      },
      {
        title: 'Theo doi doi / tra',
        description: 'Vao queue after-sales de cap nhat refund va returns.',
        href: returnsPath,
      },
    ],
    [checkoutPath, customersPath, productsPath, returnsPath]
  );

  return (
    <>
      <Header
        title="Dashboard Sale"
        subtitle="Tong quan doanh so, queue uu tien va tac vu can xu ly trong ngay"
      />

      <div className="space-y-8 p-6">
        <section className="animate-fade-in">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.title} className="space-y-2">
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
                <p className="text-muted-foreground px-1 text-xs">{stat.helper}</p>
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
                  <BellRing className="text-accent h-5 w-5" />
                  Uu tien cua sale
                </h2>
                <p className="text-muted-foreground text-sm">
                  Nhom queue can sale cham va khong nen de tre trong ngay.
                </p>
              </div>
              {overview.urgentOrders.length > 0 && (
                <StatusBadge status="warning">
                  {overview.urgentOrders.length} can xu ly
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
                <Sparkles className="text-accent h-5 w-5" />
                Loi tat nghiep vu
              </h2>
              <p className="text-muted-foreground text-sm">
                Di nhanh vao cac tac vu ban hang ma sale dung nhieu nhat.
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
                Don hang gan day
              </h2>
              <p className="text-muted-foreground text-sm">
                Theo doi nhanh cac don moi, trang thai van chuyen va chi tiet lien quan.
              </p>
            </div>
            <Link href={ordersPath} className="text-accent text-sm hover:underline">
              Xem tat ca
            </Link>
          </div>

          <RecentOrdersTable
            limit={120}
            emptyMessage="Chua co don hang nao de hien thi tren dashboard sale."
            detailHref={(order) => buildDetailPath(ordersPath, order.id)}
          />
        </section>
      </div>
    </>
  );
};

export default Dashboard;
