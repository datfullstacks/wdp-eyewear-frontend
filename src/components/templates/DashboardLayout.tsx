'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

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

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <main 
        className={cn(
          'transition-all duration-300',
          collapsed ? 'ml-20' : 'ml-72'
        )}
      >
        {children}
      </main>
    </div>
  );
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
};
