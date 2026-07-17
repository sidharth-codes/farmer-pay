import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_DASHBOARD, ROUTES } from '../constants';

// Sends a logged-in user to their role-specific dashboard when visiting /dashboard.
export function useDashboardRedirect() {
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (status !== 'authenticated' || !user) return;
    if (location.pathname === ROUTES.DASHBOARD) {
      const dest =
        ROLE_DASHBOARD[user.role as keyof typeof ROLE_DASHBOARD] ?? ROUTES.DASHBOARD;
      navigate(dest, { replace: true });
    }
  }, [user, status, location.pathname, navigate]);
}
