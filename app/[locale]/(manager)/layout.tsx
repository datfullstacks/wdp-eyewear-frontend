import { ManagerDashboardLayout } from '@/components/templates/ManagerDashboardLayout';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManagerDashboardLayout>{children}</ManagerDashboardLayout>;
}
