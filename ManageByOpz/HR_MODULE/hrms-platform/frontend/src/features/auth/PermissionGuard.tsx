import React from 'react';
import { useAppSelector } from '../../app/hooks';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  requiredPermission,
  fallback = null,
}: PermissionGuardProps) {
  const permissions = useAppSelector((state) => state.auth.permissions) || [];
  const role = useAppSelector((state) => state.auth.role);

  // Ultra Super Admin can do everything bypass permission check
  if (role === 'ROLE_ULTRA_SUPER_ADMIN') {
    return <>{children}</>;
  }

  const hasPermission = permissions.includes(requiredPermission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
