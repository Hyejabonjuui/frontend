/**
 * 화면 설계서(화면 전체 v2) 주석에 적힌 경로를 그대로 따른다.
 * 설계서에 경로가 적힌 기능은 기능 번호를 함께 남긴다.
 * 설계서에 경로가 없는 기능은 같은 규칙(/api 접두사 + 리소스 중심)으로 맞췄다.
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup', // F-01
    LOGOUT: '/api/auth/logout',
    FIND_EMAIL: '/api/auth/find-email',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  USER: {
    ME: '/api/me', // F-05 (DELETE = 회원 탈퇴)
    PROFILE: '/api/me/profile', // F-03
  },
  CODE: {
    LIST: '/api/codes', // F-03 선택지
  },
  POLICY: {
    LIST: '/api/policies',
    DETAIL: (policyId) => `/api/policies/${policyId}`, // F-11
    CARD_NEWS: '/api/policies/card-news',
    RECOMMENDATIONS: '/api/recommendations', // F-14 (POST { query })
    TERMS: '/api/terms', // F-13
  },
  FAVORITE: {
    LIST: '/api/favorite', // F-18
    DETAIL: (policyId) => `/api/favorite/${policyId}`, // F-16 POST/DELETE
  },
  NOTIFICATION: {
    LIST: '/api/me/notifications',
    DETAIL: (notificationId) => `/api/me/notifications/${notificationId}`,
    READ: (notificationId) => `/api/me/notifications/${notificationId}/read`,
    READ_ALL: '/api/me/notifications/read-all',
  },
  ADMIN: {
    COLLECT: '/api/admin/collect', // F-09
    COLLECT_STATUS: '/api/admin/collect/status',
  },
};
