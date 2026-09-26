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
    // 설계서 F-01: 가입 직후처럼 조건이 아직 없으면 조건 등록(S-04)부터 마치게 한다.
    return (
      <Navigate to={user.conditionSummary ? ROUTES.HOME : ROUTES.CONDITION_SETUP} replace />
    );
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
