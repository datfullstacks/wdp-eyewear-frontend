'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useLocale } from 'next-intl';
import {
  ChevronLeft,
  ChevronRight,
  Glasses,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  Building2,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/atoms';
import { cn } from '@/lib/utils';

type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

type SidebarCopy = {
  accessTitle: string;
  accessDescription: string;
  roleLabel: string;
  logout: string;
  loggingOut: string;
  expandSidebar: string;
  collapseSidebar: string;
};

function getSidebarCopy(locale: string): SidebarCopy {
  if (locale === 'vi') {
    return {
      accessTitle: 'Quyền truy cập ở cấp hệ thống',
      accessDescription:
        'Khu vực admin được tách biệt khỏi các luồng vận hành hằng ngày.',
      roleLabel: 'Quản trị hệ thống',
      logout: 'Đăng xuất',
      loggingOut: 'Đang đăng xuất...',
      expandSidebar: 'Mở sidebar',
      collapseSidebar: 'Thu gọn sidebar',
    };
  }

  return {
    accessTitle: 'Access is system-scoped',
    accessDescription:
      'Admin area is isolated from daily business operations.',
    roleLabel: 'System Admin',
    logout: 'Logout',
    loggingOut: 'Signing out...',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
  };
}

function isActivePath(pathname: string, itemPath: string) {
  return pathname === itemPath || pathname.includes(`${itemPath}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        icon: LayoutDashboard,
        label: 'System Overview',
        path: '/admin/dashboard',
      },
      {
        icon: Users,
        label: 'Access Review',
        path: '/admin/users',
      },
      {
        icon: Building2,
        label: 'Flagship Store',
        path: '/admin/stores',
      },
      {
        icon: Settings,
        label: 'System Config',
        path: '/admin/settings',
      },
    ],
    []
  );

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
              <div className="text-xs text-gray-500">{copy.roleLabel}</div>
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
        aria-label={collapsed ? copy.expandSidebar : copy.collapseSidebar}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const active = isActivePath(pathname, item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                active
                  ? 'bg-red-100 text-red-900'
                  : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900',
                collapsed && 'justify-center'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-gray-200 px-4 py-4">
        <div
          className={cn(
            'rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-900',
            collapsed && 'px-2 text-center'
          )}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium">{copy.accessTitle}</span>
            )}
          </div>
          {!collapsed && (
            <p className="mt-2 text-xs text-red-700">
              {copy.accessDescription}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className={cn(
            'w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900',
            collapsed ? 'justify-center px-0' : 'justify-start'
          )}
          aria-label={isLoggingOut ? copy.loggingOut : copy.logout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed ? (
            <span>{isLoggingOut ? copy.loggingOut : copy.logout}</span>
          ) : null}
        </Button>

        {!collapsed ? (
          <p className="text-xs text-gray-500">{copy.roleLabel}</p>
        ) : null}
      </div>
    </aside>
  );
}
