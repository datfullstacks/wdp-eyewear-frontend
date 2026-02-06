import { ManagerSidebar } from '@/components/organisms/ManagerSidebar';
import { cn } from '@/lib/utils';

interface ManagerDashboardLayoutProps {
  children: React.ReactNode;
}

export const ManagerDashboardLayout = ({
  children,
}: ManagerDashboardLayoutProps) => {
  return (
    <div className="bg-background min-h-screen">
      <ManagerSidebar />
      <main className={cn('ml-64 pl-8 transition-all duration-300')}>
        {children}
      </main>
    </div>
  );
};
