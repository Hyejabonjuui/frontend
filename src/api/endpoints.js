/**
 * 화면 설계서(화면 전체 v2) 주석에 적힌 경로를 그대로 따른다.
 * 설계서에 경로가 적힌 기능은 기능 번호를 함께 남긴다.
 * 설계서에 경로가 없는 기능은 같은 규칙(/api 접두사 + 리소스 중심)으로 맞췄다.
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/members/login',
    SIGNUP: '/api/members', // 계정 + profile 동시 저장
    EMAIL_VERIFICATION: '/api/members/email-verifications',
    EMAIL_VERIFICATION_CONFIRMATION: '/api/members/email-verifications/confirmation',
    LOGOUT: '/api/members/logout',
    FIND_EMAIL: '/api/members/find-email',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  USER: {
    ME: '/api/members/me',
    DELETE: '/api/members/me/delete',
    PROFILE: '/api/members/me/profile', // F-03
  },
  CODE: {
    REGIONS: '/api/regions',
  },
  POLICY: {
    LIST: '/api/policies/housing',
    MEMBER_LIST: '/api/policies/housing/me',
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
    LIST: '/api/notification',
    DETAIL: (notificationId) => `/api/notification/${notificationId}`,
    READ: (notificationId) => `/api/notification/${notificationId}/read`,
  },
  ADMIN: {
    COLLECT: '/api/admin/collect', // F-09
    COLLECT_STATUS: '/api/admin/collect/status',
  },
};
