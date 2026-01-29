import { ReactNode } from 'react';
import { ManagerLayout } from '@/components/templates';

export default function ManagerRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ManagerLayout>{children}</ManagerLayout>;
}
