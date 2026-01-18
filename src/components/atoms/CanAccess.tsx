import { ReactNode } from 'react';

type Role = 'customer' | 'staff' | 'operations' | 'manager' | 'admin';

interface CanAccessProps {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanAccess({ roles, children, fallback = null }: CanAccessProps) {
  // TODO: Get user role from session/auth
  // const session = useSession();
  // const userRole = session?.user?.role;
  
  // Mock for now
  const userRole: Role = 'staff';
  
  const hasAccess = roles.includes(userRole);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Helper hook for imperative checks
export function useCanAccess() {
  // TODO: Get from session
  const userRole: Role = 'staff';
  
  return (roles: Role[]) => roles.includes(userRole);
}
