export function getUserManagementBasePath(pathname?: string | null): '/manager/users' | '/admin/users' {
  const normalizedPath = String(pathname || '');
  return normalizedPath.includes('/admin/users') ? '/admin/users' : '/manager/users';
}

export function isAdminAreaPath(pathname?: string | null): boolean {
  return String(pathname || '').includes('/admin');
}
