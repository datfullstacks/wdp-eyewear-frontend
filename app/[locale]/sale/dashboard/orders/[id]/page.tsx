import { redirect } from 'next/navigation';

export default async function SaleDashboardOrderDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(`/sale/orders/${encodeURIComponent(id)}`);
}
