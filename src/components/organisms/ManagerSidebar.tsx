'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BarChart3,
  TrendingUp,
  Percent,
  Package,
  FileText,
  UserCheck,
  Shield,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms';

type BadgeType = 'warning' | 'error' | 'info';

type MenuItem = {
  icon: LucideIcon;
  label: string;
  path?: string;
  exact?: boolean;
  badge?: string;
  badgeType?: BadgeType;
  children?: MenuItem[];
};

const managerMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/manager/dashboard' },
  
  {
    icon: BarChart3,
    label: 'Báo cáo & Thống kê',
    children: [
      { icon: TrendingUp, label: 'Doanh thu', path: '/manager/revenue' },
      { icon: BarChart3, label: 'Báo cáo bán hàng', path: '/manager/reports/sales' },
      { icon: FileText, label: 'Báo cáo tồn kho', path: '/manager/reports/inventory' },
    ],
  },

  {
    icon: Percent,
    label: 'Khuyến mãi',
    children: [
      { icon: Percent, label: 'Quản lý Discount', path: '/manager/discounts' },
      { icon: FileText, label: 'Chương trình khuyến mãi', path: '/manager/promotions' },
    ],
  },

  {
    icon: Package,
    label: 'Quản lý sản phẩm',
    children: [
      { icon: Package, label: 'Danh sách sản phẩm', path: '/manager/products' },
      { icon: Settings, label: 'Danh mục sản phẩm', path: '/manager/categories' },
    ],
  },

  {
    icon: Users,
    label: 'Quản lý nhân sự',
    children: [
      { icon: Users, label: 'Danh sách người dùng', path: '/manager/users' },
      { icon: UserCheck, label: 'Phân quyền', path: '/manager/permissions' },
    ],
  },

  {
    icon: Shield,
    label: 'Chính sách',
    children: [
      { icon: FileText, label: 'Chính sách cửa hàng', path: '/manager/policies' },
      { icon: Settings, label: 'Cài đặt hệ thống', path: '/manager/settings' },
    ],
  },
];

interface BadgeProps {
  badge: string;
  type?: BadgeType;
}

const MenuItemBadge = ({ badge, type = 'info' }: BadgeProps) => {
  return (
    <span
      className={cn(
        'text-xs font-medium px-2 py-0.5 rounded-full',
        {
          'bg-blue-100 text-blue-600': type === 'info',
          'bg-yellow-100 text-yellow-600': type === 'warning',
          'bg-red-100 text-red-600': type === 'error',
        }
      )}
    >
      {badge}
    </span>
  );
};

function isActivePath(currentPath: string, menuPath?: string, exact?: boolean) {
  if (!menuPath) return false;

  if (exact) {
    return currentPath === menuPath;
  }

  return currentPath.startsWith(menuPath);
}

export const ManagerSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['default']));
  const pathname = usePathname();

  const activeItemsWithChildren = useMemo(() => {
    return managerMenuItems.filter(item => 
      item.children?.some(child => isActivePath(pathname, child.path, child.exact))
    );
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => {
      const newGroups = new Set(prev);
      if (newGroups.has(label)) {
        newGroups.delete(label);
      } else {
        newGroups.add(label);
      }
      return newGroups;
    });
  };

  return (
    <aside
      className={cn(
        'text-foreground bg-card border-border fixed left-0 top-0 z-50 h-full border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="border-border flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="gradient-gold text-primary flex h-8 w-8 items-center justify-center rounded-lg font-bold">
              M
            </div>
            <h2 className="font-display text-lg font-semibold">Manager</h2>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {managerMenuItems.map((item) => {
          if (item.path) {
            // Direct menu item
            const active = isActivePath(pathname, item.path, item.exact);
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                  active
                    ? 'bg-yellow-400 text-yellow-950'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <MenuItemBadge badge={item.badge} type={item.badgeType} />
                    )}
                  </>
                )}
              </Link>
            );
          } else {
            // Group menu item
            const isOpen = openGroups.has(item.label);
            const hasActiveChild = activeItemsWithChildren.includes(item);

            return (
              <div key={item.label} className="mb-2">
                <button
                  onClick={() => !collapsed && toggleGroup(item.label)}
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
                    {item.children?.map((child) => {
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
          }
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
            MG
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">Manager</p>
              <p className="truncate text-xs text-gray-500">Quản lý</p>
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