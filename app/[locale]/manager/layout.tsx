import { ManagerDashboardLayout } from '@/components/templates/ManagerDashboardLayout';
import NextTopLoader from '@/components/ui/NextTopLoader';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ManagerDashboardLayout>
      <NextTopLoader
        color="#2563eb"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px #2563eb,0 0 5px #2563eb"
      />
      {children}
    </ManagerDashboardLayout>
  );
}
