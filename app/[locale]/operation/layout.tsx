import { OperationDashboardLayout } from '@/components/templates/OperationDashboardLayout';

export default function OperationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OperationDashboardLayout>{children}</OperationDashboardLayout>;
}
