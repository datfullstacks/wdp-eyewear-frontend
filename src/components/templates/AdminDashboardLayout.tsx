'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

const AdminSidebar = dynamic(
  () => import('@/components/organisms/AdminSidebar').then((mod) => mod.AdminSidebar),
  {
    ssr: false,
    loading: () => (
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200/70 bg-white/90" />
    ),
  }
);

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      <AdminSidebar />
      <main className={cn('ml-64 pl-8 transition-all duration-300')}>{children}</main>
    </div>
  );
}
