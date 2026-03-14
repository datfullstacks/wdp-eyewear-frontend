import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function PostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = callbackUrl?.startsWith('/') ? callbackUrl : '/';

  const role = (session.user.role ?? '').trim().toLowerCase();
  const shouldRedirectToAdmin = role === 'admin';
  const shouldRedirectToSale = role === 'sales' || role === 'staff';
  const shouldRedirectToOperation = role === 'operations' || role === 'operation';
  const shouldRedirectToManager = role === 'manager';

  if (shouldRedirectToAdmin) {
    redirect('/admin/dashboard');
  }

  if (shouldRedirectToManager) {
    redirect('/manager/dashboard');
  }

  if (shouldRedirectToOperation) {
    redirect('/operation/orders/ready-stock');
  }

  if (role === 'customer') {
    redirect('/');
  }

  redirect(shouldRedirectToSale ? '/sale/products' : safeCallbackUrl);
}
