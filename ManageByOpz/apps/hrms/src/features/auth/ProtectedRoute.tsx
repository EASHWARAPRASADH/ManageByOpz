import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page and keep the current location in state so we can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
