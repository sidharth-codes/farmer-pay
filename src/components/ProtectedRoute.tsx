import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants';
import type { UserRole } from '../types';
import { FullPageLoader } from './ui/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
  requireVerified?: boolean;
}

export function ProtectedRoute({ children, roles, requireVerified }: ProtectedRouteProps) {
  const { user, status, hasRole } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader />;
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }
  if (roles && !hasRole(...roles)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }
  if (requireVerified && user.verificationStatus !== 'VERIFIED') {
    return <Navigate to={ROUTES.VERIFY_EMAIL} replace />;
  }
  return <>{children}</>;
}

export function RequireVerifiedAccount({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireVerified>
      {children}
    </ProtectedRoute>
  );
}
