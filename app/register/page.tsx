import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function RegisterRedirectPage() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = routing.locales.includes(cookieLocale as any)
    ? (cookieLocale as string)
    : routing.defaultLocale;

  redirect(`/${locale}/register`);
}
