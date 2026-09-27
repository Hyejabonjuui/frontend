import { Navigate, Outlet } from 'react-router-dom';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

function PublicOnlyRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    const hasProfile = user.hasProfile ?? Boolean(user.conditionSummary);

    return <Navigate to={hasProfile ? ROUTES.HOME : ROUTES.CONDITION_SETUP} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
