'use client';

import { useCallback, useMemo } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

type ParamValue = string | string[] | undefined;

function normalizeParam(value: ParamValue): string {
  if (Array.isArray(value)) {
    return String(value[0] || '').trim();
  }

  return String(value || '').trim();
}

export function stripLastPathSegment(pathname: string): string {
  const segments = String(pathname || '')
    .split('/')
    .filter(Boolean);

  if (segments.length <= 1) {
    return pathname || '/';
  }

  return `/${segments.slice(0, -1).join('/')}`;
}

export function buildDetailPath(basePath: string, id: string): string {
  const normalizedBase = String(basePath || '/').replace(/\/+$/, '') || '/';
  const normalizedId = encodeURIComponent(String(id || '').trim());

  return normalizedBase === '/'
    ? `/${normalizedId}`
    : `${normalizedBase}/${normalizedId}`;
}

export function useDetailRoute(paramName = 'id') {
  const params = useParams<Record<string, ParamValue>>();
  const pathname = usePathname();
  const router = useRouter();

  const detailId = useMemo(() => {
    const raw = normalizeParam(params?.[paramName]);
    return raw ? decodeURIComponent(raw) : '';
  }, [paramName, params]);

  const basePath = useMemo(
    () => (detailId ? stripLastPathSegment(pathname) : pathname),
    [detailId, pathname]
  );

  const openDetail = useCallback(
    (id: string) => {
      const normalizedId = String(id || '').trim();
      if (!normalizedId) return;
      router.push(buildDetailPath(basePath, normalizedId));
    },
    [basePath, router]
  );

  const closeDetail = useCallback(() => {
    router.push(basePath || '/');
  }, [basePath, router]);

  return {
    detailId,
    basePath,
    openDetail,
    closeDetail,
    hasDetailRoute: Boolean(detailId),
  };
}
