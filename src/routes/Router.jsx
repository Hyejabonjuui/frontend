import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import MainLayout from '@/components/layout/MainLayout';
import { ROUTES } from '@/constants/routes';
import AdminRoute from '@/routes/AdminRoute';
import ProtectedRoute from '@/routes/ProtectedRoute';
import PublicOnlyRoute from '@/routes/PublicOnlyRoute';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const FindEmailPage = lazy(() => import('@/pages/auth/FindEmailPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const ConditionSetupPage = lazy(() => import('@/pages/onboarding/ConditionSetupPage'));
const RecommendationPage = lazy(() => import('@/pages/recommendation/RecommendationPage'));
const PolicyDetailPage = lazy(() => import('@/pages/policy/PolicyDetailPage'));
const FavoritePage = lazy(() => import('@/pages/favorite/FavoritePage'));
const NotificationPage = lazy(() => import('@/pages/notification/NotificationPage'));
const MyPage = lazy(() => import('@/pages/mypage/MyPage'));
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.POLICY_DETAIL} element={<PolicyDetailPage />} />
          <Route path={ROUTES.RECOMMENDATION} element={<RecommendationPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            <Route path={ROUTES.FIND_EMAIL} element={<FindEmailPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.CONDITION_SETUP} element={<ConditionSetupPage />} />
            <Route path={ROUTES.FAVORITE} element={<FavoritePage />} />
            <Route path={ROUTES.NOTIFICATION} element={<NotificationPage />} />
            <Route path={ROUTES.MY_PAGE} element={<MyPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path={ROUTES.ADMIN} element={<AdminPage />} />
          </Route>

          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default Router;
