import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { QueryProvider } from '@/lib/query-provider';
import { Toaster } from '@/components/ui/sonner';
import type { ReactNode } from 'react';

export default async function LocaleLayout({
  children,
  params: _params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <QueryProvider>
        {children}
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
