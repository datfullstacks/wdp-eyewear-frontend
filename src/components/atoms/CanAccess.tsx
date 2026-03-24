'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';

import { toBackendRole } from '@/lib/roles';

type Role =
  | 'customer'
  | 'staff'
  | 'sales'
  | 'operation'
  | 'operations'
  | 'manager'
  | 'admin';

interface CanAccessProps {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

function matchesRole(expectedRoles: Role[], currentRole: string): boolean {
  const normalizedRole = toBackendRole(currentRole);
  return expectedRoles.some((expectedRole) => {
    const normalizedExpectedRole = toBackendRole(expectedRole);
    return normalizedExpectedRole === normalizedRole;
  });
}

export function CanAccess({
  roles,
  children,
  fallback = null,
}: CanAccessProps) {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    void getSession().then((session) => {
      if (!mounted) return;
      setUserRole(String(session?.user?.role || 'customer'));
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!userRole) {
    return <>{fallback}</>;
  }

  return matchesRole(roles, userRole) ? <>{children}</> : <>{fallback}</>;
}

export function useCanAccess() {
  const [userRole, setUserRole] = useState<string>('customer');

  useEffect(() => {
    let mounted = true;

    void getSession().then((session) => {
      if (!mounted) return;
      setUserRole(String(session?.user?.role || 'customer'));
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (roles: Role[]) => matchesRole(roles, userRole);
}
