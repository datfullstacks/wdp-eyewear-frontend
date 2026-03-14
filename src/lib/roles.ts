export type BackendRole =
  | 'customer'
  | 'sales'
  | 'operations'
  | 'manager'
  | 'admin';

export type FrontendRole =
  | 'customer'
  | 'staff'
  | 'operation'
  | 'manager'
  | 'admin';

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

export function canAccessStaffArea(role?: string | null): boolean {
  return normalizeRole(role) === 'sales';
}

export function canAccessOperationArea(role?: string | null): boolean {
  return normalizeRole(role) === 'operations';
}

export function canAccessManagerArea(role?: string | null): boolean {
  return normalizeRole(role) === 'manager';
}

export function canAccessAdminArea(role?: string | null): boolean {
  return normalizeRole(role) === 'admin';
}
