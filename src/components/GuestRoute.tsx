import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_DASHBOARD, ROUTES } from '../constants';

// Redirects already-authenticated users away from auth pages (login/register).
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  if (status === 'loading') return null;
  if (user) {
    const dest = ROLE_DASHBOARD[user.role as keyof typeof ROLE_DASHBOARD] ?? ROUTES.DASHBOARD;
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
}
