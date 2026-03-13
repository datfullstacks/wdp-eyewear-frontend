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
  const shouldRedirectToStaff = role === 'sales' || role === 'staff';
  const shouldRedirectToOperation = role === 'operations' || role === 'operation';
  const shouldRedirectToManager = role === 'admin' || role === 'manager';

  if (shouldRedirectToManager) {
    redirect('/manager');
  }

  if (shouldRedirectToOperation) {
    redirect('/operation/dashboard-operation');
  }

  if (role === 'customer') {
    redirect('/');
  }

  redirect(shouldRedirectToStaff ? '/staff/dashboard-staff' : safeCallbackUrl);
}
