'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Glasses,
  LayoutDashboard,
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

function isActivePath(pathname: string, itemPath: string) {
  return pathname === itemPath || pathname.includes(`${itemPath}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
        label: 'Store Network',
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
              <div className="text-xs text-gray-500">System Admin</div>
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
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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

      <div className="border-t border-gray-200 px-4 py-4">
        <div
          className={cn(
            'rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-900',
            collapsed && 'px-2 text-center'
          )}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Access is system-scoped</span>}
          </div>
          {!collapsed && (
            <p className="mt-2 text-xs text-red-700">
              Admin area is isolated from daily business operations.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
