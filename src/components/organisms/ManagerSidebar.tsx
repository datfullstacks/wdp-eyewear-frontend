'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Glasses,
  Package,
  DollarSign,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Bell,
  User,
  FileText,
  TrendingUp,
  Percent,
  Tag,
  Shield,
  UserCog,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms';

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
  const pathname = usePathname();
  const t = useTranslations('manager.sidebar');

  const menuItems: MenuItem[] = useMemo(() => [
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
          label: t('detailedReports'),
          path: '/manager/revenue-new',
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
        {
          icon: ClipboardList,
          key: 'systemSettings',
          label: t('systemSettings'),
          path: '/manager/settings',
        },
      ],
    },
    {
      icon: Settings,
      key: 'personalSettings',
      label: t('personalSettings'),
      children: [
        {
          icon: Bell,
          key: 'notifications',
          label: t('notifications'),
          path: '/manager/notifications',
          badge: '2',
          badgeType: 'info' as BadgeType,
        },
        {
          icon: User,
          key: 'accountSettings',
          label: t('accountSettings'),
          path: '/manager/account',
        },
      ],
    },
  ], [t]);

  const defaultOpenMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const item of menuItems) {
      if (!item.children) continue;
      const open = item.children.some((c) =>
        isActivePath(pathname, c.path, c.exact)
      );
      map.set(item.key, open);
    }
    return map;
  }, [pathname, menuItems]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    for (const item of menuItems) {
      if (item.children)
        obj[item.key] = defaultOpenMap.get(item.key) ?? false;
    }
    return obj;
  });

  useMemo(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const item of menuItems) {
        if (!item.children) continue;
        const shouldOpen = item.children.some((c) =>
          isActivePath(pathname, c.path, c.exact)
        );
        if (shouldOpen) next[item.key] = true;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-gray-100 transition-all duration-300',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo */}
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

      {/* Toggle */}
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute top-20 -right-3 h-6 w-6 rounded-full border border-gray-200 bg-gray-100 p-0 shadow-sm hover:bg-gray-200"
        aria-label={collapsed ? t('expandSidebar') : t('collapseSidebar')}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          // Leaf
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
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          }

          // Group
          const hasActiveChild = item.children.some((c) =>
            isActivePath(pathname, c.path, c.exact)
          );
          const isOpen = !!openGroups[item.key];

          return (
            <div key={item.key} className="space-y-1">
              <button
                type="button"
                onClick={() =>
                  !collapsed &&
                  setOpenGroups((p) => ({
                    ...p,
                    [item.key]: !p[item.key],
                  }))
                }
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
                {!collapsed && (
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
                )}
              </button>

              {/* Children */}
              {!collapsed && isOpen && (
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
                        {child.badge && (
                          <MenuItemBadge
                            badge={child.badge}
                            type={child.badgeType}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User */}
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

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">{t('manager')}</p>
              <p className="truncate text-xs text-gray-500">Manager</p>
            </div>
          )}

          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};
