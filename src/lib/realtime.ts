export type StatusRealtimeDomain =
  | 'order'
  | 'shipping'
  | 'invoice'
  | 'support'
  | 'preorder_batch'
  | 'product';

export interface StatusRealtimeEvent {
  type: 'status.changed';
  domain: StatusRealtimeDomain | string;
  entityId: string;
  statusField: string;
  previousStatus: string | null;
  nextStatus: string | null;
  actor?: {
    id?: string | null;
    role?: string | null;
  } | null;
  timestamp: string;
  meta?: Record<string, unknown>;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, '').replace(/\/api$/, '');
}

export function buildRealtimeUrl(token: string): string | null {
  if (typeof window === 'undefined') return null;
  if (!token) return null;

  const configuredBaseUrl = String(
    process.env.NEXT_PUBLIC_API_URL || ''
  ).trim();
  const fallbackBaseUrl = window.location.origin;
  const normalizedBaseUrl = normalizeBaseUrl(
    configuredBaseUrl || fallbackBaseUrl
  );

  try {
    const url = new URL(normalizedBaseUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/ws';
    url.search = '';
    url.searchParams.set('token', token);
    return url.toString();
  } catch {
    return null;
  }
}

export function isStatusRealtimeEvent(
  payload: unknown
): payload is StatusRealtimeEvent {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const data = payload as Record<string, unknown>;
  return (
    data.type === 'status.changed' &&
    typeof data.domain === 'string' &&
    typeof data.entityId === 'string' &&
    typeof data.statusField === 'string'
  );
}
