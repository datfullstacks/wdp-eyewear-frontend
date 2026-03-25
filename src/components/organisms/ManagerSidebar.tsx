'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Glasses,
  LayoutDashboard,
  LogOut,
  Package,
  Percent,
  Shield,
  ShoppingCart,
  Tag,
  TrendingUp,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/atoms';
import { cn } from '@/lib/utils';

type BadgeType = 'warning' | 'error' | 'info';

type MenuItem = {
  icon: LucideIcon;
  key: string;
  label: string;
  path?: string;
  exact?: boolean;
  badge?: string;
  badgeType?: BadgeType;
  children?: MenuItem[];
};

type SidebarCopy = {
  orders: string;
  allOrders: string;
  pendingOrders: string;
  orderAlerts: string;
  statistics: string;
  afterSales: string;
  refundApprovals: string;
  refundMonitoring: string;
  refundReconciliation: string;
  refundAudit: string;
  supportOverview: string;
  roleLabel: string;
  logout: string;
  loggingOut: string;
};

function getSidebarCopy(locale: string): SidebarCopy {
  if (locale === 'vi') {
    return {
      orders: 'Đơn hàng',
      allOrders: 'Tất cả đơn hàng',
      pendingOrders: 'Đơn cần xử lý',
      orderAlerts: 'Đơn trễ / cảnh báo',
      statistics: 'Thống kê',
      afterSales: 'Hậu mãi',
      refundApprovals: 'Phê duyệt hoàn tiền',
      refundMonitoring: 'Giám sát hoàn tiền',
      refundReconciliation: 'Đối soát hoàn tiền',
      refundAudit: 'Kiểm toán hoàn tiền',
      supportOverview: 'Tổng quan hỗ trợ',
      roleLabel: 'Quản lý',
      logout: 'Đăng xuất',
      loggingOut: 'Đang đăng xuất...',
    };
  }

  return {
    orders: 'Orders',
    allOrders: 'All orders',
    pendingOrders: 'Orders needing action',
    orderAlerts: 'Delayed / alert orders',
    statistics: 'Statistics',
    afterSales: 'After sales',
    refundApprovals: 'Refund approvals',
    refundMonitoring: 'Refund monitoring',
    refundReconciliation: 'Refund reconciliation',
    refundAudit: 'Refund audit',
    supportOverview: 'Support overview',
    roleLabel: 'Manager',
    logout: 'Logout',
    loggingOut: 'Signing out...',
  };
}

function MenuItemBadge({
  badge,
  type = 'info',
}: {
  badge: string;
  type?: BadgeType;
}) {
  const colors: Record<BadgeType, string> = {
    warning: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    error: 'bg-red-500/20 text-red-500 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  };

  return (
    <span
      className={cn(
        'ml-auto rounded-full border px-1.5 py-0.5 text-xs font-medium',
        colors[type]
      )}
    >
      {badge}
    </span>
  );
}

function isActivePath(pathname: string, itemPath?: string, exact?: boolean) {
  if (!itemPath) return false;
  if (exact) return pathname === itemPath || pathname.endsWith(itemPath);

  return (
    pathname === itemPath ||
    pathname.endsWith(itemPath) ||
    pathname.includes(`${itemPath}/`)
  );
}

export const ManagerSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('manager.sidebar');
  const copy = getSidebarCopy(locale);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: `/${locale}/login` });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        icon: LayoutDashboard,
        key: 'overview',
        label: t('overview'),
        path: '/manager/dashboard',
        exact: true,
      },
      {
        icon: Package,
        key: 'productsAndPricing',
        label: t('productsAndPricing'),
        children: [
          {
            icon: Package,
            key: 'productManagement',
            label: t('productManagement'),
            path: '/manager/products',
          },
          {
            icon: DollarSign,
            key: 'pricingStrategy',
            label: t('pricingStrategy'),
            path: '/manager/pricing',
          },
          {
            icon: Tag,
            key: 'promotionsAndDiscounts',
            label: t('promotionsAndDiscounts'),
            path: '/manager/discounts',
          },
        ],
      },
      {
        icon: ShoppingCart,
        key: 'orders',
        label: copy.orders,
        children: [
          {
            icon: ClipboardList,
            key: 'allOrders',
            label: copy.allOrders,
            path: '/manager/orders',
            exact: true,
          },
          {
            icon: Clock,
            key: 'pendingOrders',
            label: copy.pendingOrders,
            path: '/manager/orders/pending',
          },
          {
            icon: AlertTriangle,
            key: 'orderAlerts',
            label: copy.orderAlerts,
            path: '/manager/orders/alerts',
          },
        ],
      },
      {
        icon: BarChart3,
        key: 'revenueAndReports',
        label: t('revenueAndReports'),
        children: [
          {
            icon: TrendingUp,
            key: 'revenueOverview',
            label: t('revenueOverview'),
            path: '/manager/revenue',
          },
          {
            icon: Percent,
            key: 'detailedReports',
            label: copy.statistics,
            path: '/manager/revenue-new',
          },
        ],
      },
      {
        icon: CreditCard,
        key: 'afterSales',
        label: copy.afterSales,
        children: [
          {
            icon: CreditCard,
            key: 'refundApprovals',
            label: copy.refundApprovals,
            path: '/manager/refunds',
            exact: true,
          },
          {
            icon: AlertTriangle,
            key: 'refundMonitoring',
            label: copy.refundMonitoring,
            path: '/manager/refunds/monitoring',
          },
          {
            icon: TrendingUp,
            key: 'refundReconciliation',
            label: copy.refundReconciliation,
            path: '/manager/reconciliation',
          },
          {
            icon: FileText,
            key: 'refundAudit',
            label: copy.refundAudit,
            path: '/manager/audit',
          },
          {
            icon: FileText,
            key: 'supportOverview',
            label: copy.supportOverview,
            path: '/manager/cases/support',
          },
        ],
      },
      {
        icon: Users,
        key: 'humanResources',
        label: t('humanResources'),
        children: [
          {
            icon: UserCog,
            key: 'userManagement',
            label: t('userManagement'),
            path: '/manager/users',
          },
        ],
      },
      {
        icon: Shield,
        key: 'policiesAndSystem',
        label: t('policiesAndSystem'),
        children: [
          {
            icon: FileText,
            key: 'policies',
            label: t('policies'),
            path: '/manager/policies',
          },
        ],
      },
    ],
    [copy, t]
  );

  const defaultOpenMap = useMemo(() => {
    const map = new Map<string, boolean>();

    for (const item of menuItems) {
      if (!item.children) continue;
      const open = item.children.some((child) =>
        isActivePath(pathname, child.path, child.exact)
      );
      map.set(item.key, open);
    }

    return map;
  }, [menuItems, pathname]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};

    for (const item of menuItems) {
      if (item.children) {
        initialState[item.key] = defaultOpenMap.get(item.key) ?? false;
      }
    }

    return initialState;
  });

  useMemo(() => {
    setOpenGroups((previous) => {
      const next = { ...previous };

      for (const item of menuItems) {
        if (!item.children) continue;
        const shouldOpen = item.children.some((child) =>
          isActivePath(pathname, child.path, child.exact)
        );

        if (shouldOpen) {
          next[item.key] = true;
        }
      }

      return next;
    });
  }, [menuItems, pathname]);

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-gray-100 transition-all duration-300',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="gradient-gold flex h-10 w-10 items-center justify-center rounded-lg">
              <Glasses className="text-primary h-6 w-6" />
            </div>
            <div className="leading-tight">
              <span className="font-display text-lg font-semibold text-gray-900">
                {t('brandName')}
              </span>
              <div className="text-xs text-gray-500">{t('brandSubtitle')}</div>
            </div>
          </div>
        ) : (
          <div className="gradient-gold mx-auto flex h-10 w-10 items-center justify-center rounded-lg">
            <Glasses className="text-primary h-6 w-6" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="absolute top-20 -right-3 h-6 w-6 rounded-full border border-gray-200 bg-gray-100 p-0 shadow-sm hover:bg-gray-200"
        aria-label={collapsed ? t('expandSidebar') : t('collapseSidebar')}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          if (!item.children) {
            const active = isActivePath(pathname, item.path, item.exact);

            return (
              <Link
                key={item.key}
                href={item.path ?? '/'}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                  active
                    ? 'bg-yellow-400 text-yellow-950'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed ? (
                  <span className="font-medium">{item.label}</span>
                ) : null}
              </Link>
            );
          }

          const hasActiveChild = item.children.some((child) =>
            isActivePath(pathname, child.path, child.exact)
          );
          const isOpen = Boolean(openGroups[item.key]);

          return (
            <div key={item.key} className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (collapsed) return;
                  setOpenGroups((previous) => ({
                    ...previous,
                    [item.key]: !previous[item.key],
                  }));
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                  hasActiveChild
                    ? 'bg-yellow-400/40 text-yellow-950'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900',
                  collapsed && 'justify-center'
                )}
                aria-expanded={!collapsed ? isOpen : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed ? (
                  <>
                    <span className="flex-1 text-left font-medium">
                      {item.label}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </>
                ) : null}
              </button>

              {!collapsed && isOpen ? (
                <div className="mt-1 space-y-1">
                  {item.children.map((child) => {
                    const active = isActivePath(
                      pathname,
                      child.path,
                      child.exact
                    );

                    return (
                      <Link
                        key={child.path}
                        href={child.path!}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'ml-6 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200',
                          active
                            ? 'bg-yellow-400 text-yellow-950'
                            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        )}
                      >
                        <child.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{child.label}</span>
                        {child.badge ? (
                          <MenuItemBadge
                            badge={child.badge}
                            type={child.badgeType}
                          />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div
          className={cn(
            'flex items-center gap-3',
            collapsed && 'justify-center'
          )}
        >
          <div className="gradient-gold text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold">
            QL
          </div>

          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">
                {t('manager')}
              </p>
              <p className="truncate text-xs text-gray-500">{copy.roleLabel}</p>
            </div>
          ) : null}

          {!collapsed ? (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? copy.loggingOut : copy.logout}</span>
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  );
};
