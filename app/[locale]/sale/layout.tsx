import { DashboardLayout } from '@/components/templates/DashboardLayout';

export default function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
