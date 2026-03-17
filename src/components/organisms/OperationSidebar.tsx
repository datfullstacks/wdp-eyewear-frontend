'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileSearch,
  FileText,
  Glasses,
  ListTodo,
  LogOut,
  MapPin,
  Package,
  PackageCheck,
  Printer,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  User,
  Warehouse,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import { orderApi } from '@/api';
import { Button } from '@/components/atoms';
import { computeOrderMenuCounts, type OrderMenuCounts } from '@/lib/orderWorkflow';
import { cn } from '@/lib/utils';

type BadgeType = 'warning' | 'error' | 'info';

type MenuItem = {
  icon: LucideIcon;
  label: string;
  path?: string;
  exact?: boolean;
  badge?: string;
  badgeKey?: keyof OrderMenuCounts;
  badgeType?: BadgeType;
  children?: MenuItem[];
};

const menuItems: MenuItem[] = [
  {
    icon: ShoppingCart,
    label: 'Đơn hàng',
    children: [
      {
        icon: PackageCheck,
        label: 'Đơn có sẵn',
        path: '/operation/orders/ready-stock',
        badgeKey: 'readyStock',
        badgeType: 'info',
      },
      {
        icon: Package,
        label: 'Đơn Pre-order',
        path: '/operation/orders/preorder',
        badgeKey: 'preorder',
        badgeType: 'info',
      },
      {
        icon: Glasses,
        label: 'Đơn Prescription',
        path: '/operation/orders/prescription',
        badgeKey: 'prescription',
        badgeType: 'info',
      },
      {
        icon: FileText,
        label: 'Đơn cần bổ sung Prescription',
        path: '/operation/orders/prescription-needed',
        badgeKey: 'prescriptionNeeded',
        badgeType: 'warning',
      },
      {
        icon: Wrench,
        label: 'Đơn đang gia công',
        path: '/operation/orders/processing',
        badgeKey: 'processing',
        badgeType: 'info',
      },
    ],
  },
  {
    icon: Truck,
    label: 'Vận hành giao vận',
    children: [
      {
        icon: Printer,
        label: 'Tạo vận đơn / In nhãn',
        path: '/operation/shipping/create',
      },
      {
        icon: MapPin,
        label: 'Tracking / Đối soát',
        path: '/operation/shipping/tracking',
      },
      {
        icon: PackageCheck,
        label: 'Bàn giao vận chuyển',
        path: '/operation/shipping/handover',
      },
    ],
  },
  {
    icon: Wrench,
    label: 'Gia công kính',
    children: [
      {
        icon: ClipboardList,
        label: 'Hàng đợi gia công',
        path: '/operation/lab/queue',
        badge: '8',
        badgeType: 'info',
      },
      {
        icon: ClipboardCheck,
        label: 'Thông số lắp tròng / QC',
        path: '/operation/lab/specs',
      },
      {
        icon: CheckSquare,
        label: 'Kết quả QC & đóng gói',
        path: '/operation/lab/qc-results',
      },
    ],
  },
  {
    icon: Warehouse,
    label: 'Sản phẩm & kho',
    children: [
      { icon: Search, label: 'Tra cứu sản phẩm', path: '/operation/products' },
      {
        icon: FileSearch,
        label: 'Tồn kho / tình trạng',
        path: '/operation/inventory/stock',
      },
      {
        icon: Package,
        label: 'Nhập hàng Pre-order',
        path: '/operation/inventory/import',
      },
    ],
  },
  {
    icon: Settings,
    label: 'Thiết lập cá nhân',
    children: [
      {
        icon: Bell,
        label: 'Thông báo',
        path: '/operation/settings/notifications',
        badge: '2',
        badgeType: 'info',
      },
      {
        icon: ListTodo,
        label: 'Nhiệm vụ của tôi',
        path: '/operation/settings/tasks',
      },
      {
        icon: User,
        label: 'Cài đặt tài khoản',
        path: '/operation/settings/account',
      },
    ],
  },
];

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
  if (exact) return pathname === itemPath;
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export const OperationSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [orderCounts, setOrderCounts] = useState<OrderMenuCounts | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCounts = async () => {
      try {
        const result = await orderApi.getAll({ page: 1, limit: 500 });
        const counts = computeOrderMenuCounts(result.orders);
        if (mounted) setOrderCounts(counts);
      } catch {
        if (mounted) setOrderCounts(null);
      }
    };

    void loadCounts();

    return () => {
      mounted = false;
    };
  }, []);

  const resolvedMenuItems = useMemo(() => {
    const visibleMenuItems = menuItems.filter(
      (item) =>
        !item.children?.every((child) =>
          child.path?.startsWith('/operation/shipping')
        )
    );

    if (!orderCounts) return visibleMenuItems;

    return visibleMenuItems.map((item) => {
      if (!item.children) return item;

      return {
        ...item,
        children: item.children.map((child) => {
          if (!child.badgeKey) return child;
          const value = orderCounts[child.badgeKey];
          return {
            ...child,
            badge: value > 0 ? String(value) : undefined,
          };
        }),
      };
    });
  }, [orderCounts]);

  const defaultOpenMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const item of resolvedMenuItems) {
      if (!item.children) continue;
      const open = item.children.some((c) => isActivePath(pathname, c.path, c.exact));
      map.set(item.label, open);
    }
    return map;
  }, [pathname, resolvedMenuItems]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    for (const item of resolvedMenuItems) {
      if (item.children) obj[item.label] = defaultOpenMap.get(item.label) ?? false;
    }
    return obj;
  });

  useMemo(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const item of resolvedMenuItems) {
        if (!item.children) continue;
        const shouldOpen = item.children.some((c) => isActivePath(pathname, c.path, c.exact));
        if (shouldOpen) next[item.label] = true;
      }
      return next;
    });
  }, [pathname, resolvedMenuItems]);

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
                Eyes Dream
              </span>
              <div className="text-xs text-gray-500">Operations</div>
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
        onClick={() => setCollapsed((v) => !v)}
        className="absolute top-20 -right-3 h-6 w-6 rounded-full border border-gray-200 bg-gray-100 p-0 shadow-sm hover:bg-gray-200"
        aria-label={collapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {resolvedMenuItems.map((item) => {
          if (!item.children) {
            const active = isActivePath(pathname, item.path, item.exact);
            return (
              <Link
                key={item.label}
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
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          }

          const hasActiveChild = item.children.some((c) => isActivePath(pathname, c.path, c.exact));
          const isOpen = !!openGroups[item.label];

          return (
            <div key={item.label} className="space-y-1">
              <button
                type="button"
                onClick={() =>
                  !collapsed &&
                  setOpenGroups((p) => ({ ...p, [item.label]: !p[item.label] }))
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
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </>
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="mt-1 space-y-1">
                  {item.children.map((child) => {
                    const active = isActivePath(pathname, child.path, child.exact);
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
                          <MenuItemBadge badge={child.badge} type={child.badgeType} />
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

      <div className="border-t border-gray-200 p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="gradient-gold text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold">
            OP
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">Nhân viên</p>
              <p className="truncate text-xs text-gray-500">Operations</p>
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
