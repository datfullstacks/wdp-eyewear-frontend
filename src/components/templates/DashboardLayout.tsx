import { Sidebar } from '@/components/organisms/Sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

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
