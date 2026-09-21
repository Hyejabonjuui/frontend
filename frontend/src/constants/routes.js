export const ROUTES = {
  HOME: '/',
  SIGNUP: '/signup',
  FIND_EMAIL: '/find-email',
  RESET_PASSWORD: '/reset-password',
  CONDITION_SETUP: '/conditions',
  RECOMMENDATION: '/recommendations',
  POLICY_DETAIL: '/policies/:policyId',
  MY_PAGE: '/mypage',
  NOTIFICATION: '/notifications',
  FAVORITE: '/favorites',
  ADMIN: '/admin',
  NOT_FOUND: '*',
};

export const buildPolicyDetailPath = (policyId) => `/policies/${policyId}`;

export const MY_PAGE_TABS = {
  CONDITION: 'condition',
  ACCOUNT: 'account',
  NOTIFICATION: 'notification',
};

/** 조건 수정은 온보딩(/conditions)이 아니라 마이페이지 탭으로 간다. */
export const buildMyPagePath = (tab) => `${ROUTES.MY_PAGE}?tab=${tab}`;
