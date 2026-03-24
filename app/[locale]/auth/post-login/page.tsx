import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDefaultRouteForRole } from '@/lib/roles';

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
  if (safeCallbackUrl !== '/' && safeCallbackUrl !== '/login') {
    redirect(safeCallbackUrl);
  }

  redirect(getDefaultRouteForRole(role));
}
