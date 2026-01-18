'use client';

import { useRouter } from '@/i18n/routing';
import { useTransition } from 'react';
import { setLocale } from '@/lib/locale';

export function useLocaleSwitch() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (locale: string) => {
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return { switchLocale, isPending };
}
