import { DashboardLayout } from '@/components/templates/DashboardLayout';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
