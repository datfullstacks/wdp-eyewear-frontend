'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const Sidebar = dynamic(
  () => import('@/components/organisms/Sidebar').then((m) => m.Sidebar),
  {
    ssr: false,
    loading: () => (
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200/70 bg-white/90" />
    ),
  }
);

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <main className={cn('ml-64 pl-8 transition-all duration-300')}>
        {children}
      </main>
    </div>
  );
};
