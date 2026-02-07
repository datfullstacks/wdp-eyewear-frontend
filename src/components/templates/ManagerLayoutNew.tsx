'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ManagerSidebarNew } from '@/components/organisms/ManagerSidebarNew';
import { ManagerHeaderNew } from '@/components/organisms/ManagerHeaderNew';

interface ManagerLayoutNewProps {
  children: React.ReactNode;
}

export const ManagerLayoutNew: React.FC<ManagerLayoutNewProps> = ({
  children,
}) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ManagerSidebarNew />
        <SidebarInset className="flex flex-1 flex-col">
          <ManagerHeaderNew />
          <main className="flex-1 space-y-6 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
