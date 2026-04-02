'use client';

import { useTransition } from 'react';
import { setLocale } from '@/lib/locale';

export function useLocaleSwitch() {
  const [isPending, startTransition] = useTransition();

  const switchLocale = (locale: string) => {
    startTransition(async () => {
      await setLocale(locale);
      // Use window.location.reload() instead of router.refresh() to preserve
      // the current URL path (e.g. /manager/products/[id]) when switching locale.
      // router.refresh() can lose the current path in some Next.js routing scenarios.
      window.location.reload();
    });
  };

  return { switchLocale, isPending };
}
