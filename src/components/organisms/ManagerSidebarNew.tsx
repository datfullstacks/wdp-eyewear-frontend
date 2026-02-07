'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ManagerSidebarNew() {
  const t = useTranslations('manager.sidebar');
  const locale = useLocale();
  const pathname = usePathname();

  const menuItems = [
    {
      title: t('dashboard'),
      icon: LayoutDashboard,
      href: `/${locale}/manager`,
    },
    {
      title: t('products'),
      icon: Package,
      href: `/${locale}/manager/products`,
    },
    {
      title: t('pricing'),
      icon: DollarSign,
      href: `/${locale}/manager/pricing`,
    },
    {
      title: t('users'),
      icon: Users,
      href: `/${locale}/manager/users`,
    },
    {
      title: t('policies'),
      icon: FileText,
      href: `/${locale}/manager/policies`,
    },
    {
      title: t('revenue'),
      icon: TrendingUp,
      href: `/${locale}/manager/revenue`,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">WDP Eyewear</span>
            <span className="text-xs text-muted-foreground">
              {t('managerPanel')}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatar.png" alt="Manager" />
            <AvatarFallback>MG</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">John Manager</span>
            <span className="text-xs text-muted-foreground">
              manager@wdp.com
            </span>
          </div>
          <button className="rounded-md p-2 hover:bg-accent">
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
