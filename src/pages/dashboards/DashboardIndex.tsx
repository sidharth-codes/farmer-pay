import { useEffect } from 'react';
import { FullPageLoader } from '../../components/ui/Spinner';
import { useDashboardRedirect } from '../../hooks/useDashboardRedirect';

// Thin wrapper that triggers the role-based redirect hook.
export function DashboardIndex() {
  useDashboardRedirect();
  useEffect(() => {}, []);
  return <FullPageLoader label="Redirecting to your dashboard…" />;
}
