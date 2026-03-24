export type BackendRole =
  | 'customer'
  | 'sales'
  | 'operations'
  | 'manager'
  | 'admin';

export type FrontendRole =
  | 'customer'
  | 'sales'
  | 'staff'
  | 'operations'
  | 'operation'
  | 'manager'
  | 'admin';

const LEGACY_ADMIN_BUSINESS_PREFIXES = [
  '/admin/refunds',
  '/admin/reconciliation',
  '/admin/audit',
] as const;

export function normalizeRole(role?: string | null): string {
  return String(role || '')
    .trim()
    .toLowerCase();
}

export function toBackendRole(role: string): string {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === 'staff') return 'sales';
  if (normalizedRole === 'operation') return 'operations';
  return normalizedRole;
}

export function toFrontendRole(role: string): string {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === 'sales') return 'staff';
  if (normalizedRole === 'operations') return 'operation';
  return normalizedRole;
}

export function isSalesRole(role?: string | null): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'sales' || normalizedRole === 'staff';
}

export function isOperationsRole(role?: string | null): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'operations' || normalizedRole === 'operation';
}

export function isManagerRole(role?: string | null): boolean {
  return normalizeRole(role) === 'manager';
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeRole(role) === 'admin';
}

export function canAccessStaffArea(role?: string | null): boolean {
  return isSalesRole(role);
}

export function canAccessOperationArea(role?: string | null): boolean {
  return isOperationsRole(role);
}

export function canAccessManagerArea(role?: string | null): boolean {
  return isManagerRole(role);
}

export function canAccessAdminArea(role?: string | null): boolean {
  return isAdminRole(role);
}

export function getDefaultRouteForRole(role?: string | null): string {
  if (isAdminRole(role)) return '/admin/dashboard';
  if (isManagerRole(role)) return '/manager/dashboard';
  if (isOperationsRole(role)) return '/operation/orders/ready-stock';
  if (isSalesRole(role)) return '/sale/dashboard';
  return '/';
}

export function isLegacyAdminBusinessPath(pathname?: string | null): boolean {
  const normalizedPath = String(pathname || '').trim().toLowerCase();
  return LEGACY_ADMIN_BUSINESS_PREFIXES.some(
    (prefix) =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  );
}

export function getLegacyAdminBusinessRedirectPath(
  pathname?: string | null
): string | null {
  const normalizedPath = String(pathname || '').trim();
  if (!normalizedPath) return null;

  const mappings: Array<[string, string]> = [
    ['/admin/refunds', '/manager/refunds/monitoring'],
    ['/admin/reconciliation', '/manager/reconciliation'],
    ['/admin/audit', '/manager/audit'],
  ];

  for (const [fromPrefix, toPrefix] of mappings) {
    if (
      normalizedPath === fromPrefix ||
      normalizedPath.startsWith(`${fromPrefix}/`)
    ) {
      return normalizedPath.replace(fromPrefix, toPrefix);
    }
  }

  return null;
}
