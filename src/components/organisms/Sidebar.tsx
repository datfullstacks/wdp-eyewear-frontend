'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Glasses,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  AlertTriangle,
  FileText,
  Truck,
  Package,
  Wrench,
  CheckSquare,
  Warehouse,
  Search,
  BarChart3,
  Bell,
  ListTodo,
  User,
  Clock,
  RefreshCw,
  CreditCard,
  MessageSquare,
  Printer,
  MapPin,
  ClipboardCheck,
  FileSearch,
  PackageCheck,
  History,
  FileHeart,
  TrendingUp,
  Percent,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms';

type BadgeType = 'warning' | 'error' | 'info';

type MenuItem = {
  icon: LucideIcon;
  label: string;
  path?: string; // leaf
  badge?: string;
  badgeType?: BadgeType;
  children?: MenuItem[]; // group
};

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/dashboard-staff' },

  {
    icon: ShoppingCart,
    label: 'Đơn hàng',
    children: [
      { icon: ClipboardList, label: 'Tất cả đơn hàng', path: '/orders' },
      {
        icon: Clock,
        label: 'Đơn cần xử lý',
        path: '/orders/pending',
        badge: '12',
        badgeType: 'warning',
      },
      {
        icon: FileText,
        label: 'Đơn cần bổ sung Prescription',
        path: '/orders/prescription-needed',
        badge: '5',
        badgeType: 'info',
      },
      { icon: Package, label: 'Đơn Pre-order', path: '/orders/preorder' },
      {
        icon: Glasses,
        label: 'Đơn Prescription (làm tròng)',
        path: '/orders/prescription',
      },
      { icon: Wrench, label: 'Đơn đang gia công', path: '/orders/processing' },
      {
        icon: AlertTriangle,
        label: 'Đơn trễ / cảnh báo',
        path: '/orders/alerts',
        badge: '3',
        badgeType: 'error',
      },
    ],
  },

  {
    icon: MessageSquare,
    label: 'Xử lý nghiệp vụ',
    children: [
      {
        icon: RefreshCw,
        label: 'Đổi / trả / bảo hành',
        path: '/cases/returns',
        badge: '4',
        badgeType: 'warning',
      },
      {
        icon: MessageSquare,
        label: 'Khiếu nại & hỗ trợ',
        path: '/cases/complaints',
      },
      {
        icon: CreditCard,
        label: 'Hoàn tiền / điều chỉnh',
        path: '/cases/refunds',
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
        path: '/shipping/create',
      },
      {
        icon: MapPin,
        label: 'Tracking / Đối soát',
        path: '/shipping/tracking',
      },
      {
        icon: PackageCheck,
        label: 'Bàn giao vận chuyển',
        path: '/shipping/handover',
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
        path: '/lab/queue',
        badge: '8',
        badgeType: 'info',
      },
      {
        icon: ClipboardCheck,
        label: 'Thông số lắp tròng / QC',
        path: '/lab/specs',
      },
      {
        icon: CheckSquare,
        label: 'Kết quả QC & đóng gói',
        path: '/lab/qc-results',
      },
    ],
  },

  {
    icon: Warehouse,
    label: 'Sản phẩm & kho',
    children: [
      { icon: Search, label: 'Tra cứu sản phẩm', path: '/products' },
      {
        icon: FileSearch,
        label: 'Tồn kho / tình trạng',
        path: '/inventory/stock',
      },
      {
        icon: Package,
        label: 'Nhập hàng Pre-order',
        path: '/inventory/import',
      },
    ],
  },

  {
    icon: Users,
    label: 'Khách hàng',
    children: [
      { icon: Users, label: 'Danh sách khách hàng', path: '/customers' },
      {
        icon: History,
        label: 'Lịch sử đơn & ghi chú',
        path: '/customers/history',
      },
      {
        icon: FileHeart,
        label: 'Hồ sơ Prescription',
        path: '/customers/prescriptions',
      },
    ],
  },

  {
    icon: BarChart3,
    label: 'Báo cáo',
    children: [
      {
        icon: TrendingUp,
        label: 'Báo cáo đơn theo trạng thái',
        path: '/reports/orders',
      },
      { icon: Percent, label: 'Vận chuyển / hoàn', path: '/reports/shipping' },
    ],
  },

  {
    icon: Settings,
    label: 'Thiết lập cá nhân',
    children: [
      {
        icon: Bell,
        label: 'Thông báo',
        path: '/settings/notifications',
        badge: '2',
        badgeType: 'info',
      },
      { icon: ListTodo, label: 'Nhiệm vụ của tôi', path: '/settings/tasks' },
      { icon: User, label: 'Cài đặt tài khoản', path: '/settings/account' },
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

function isActivePath(pathname: string, itemPath?: string) {
  if (!itemPath) return false;
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Which groups should be open by default (based on current route)
  const defaultOpenMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const item of menuItems) {
      if (!item.children) continue;
      const open = item.children.some((c) => isActivePath(pathname, c.path));
      map.set(item.label, open);
    }
    return map;
  }, [pathname]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    for (const item of menuItems) {
      if (item.children)
        obj[item.label] = defaultOpenMap.get(item.label) ?? false;
    }
    return obj;
  });

  // Keep openGroups synced when route changes (optional but useful)
  // If you want manual-only toggle, remove this memo-sync behavior.
  useMemo(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const item of menuItems) {
        if (!item.children) continue;
        const shouldOpen = item.children.some((c) =>
          isActivePath(pathname, c.path)
        );
        if (shouldOpen) next[item.label] = true;
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
                OpticStore
              </span>
              <div className="text-xs text-gray-500">Staff Dashboard</div>
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
        aria-label={collapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          // Leaf
          if (!item.children) {
            const active = isActivePath(pathname, item.path);
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
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          }

          // Group
          const hasActiveChild = item.children.some((c) =>
            isActivePath(pathname, c.path)
          );
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
                    const active = isActivePath(pathname, child.path);
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
            NV
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">Nhân viên</p>
              <p className="truncate text-xs text-gray-500">Sales Staff</p>
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
