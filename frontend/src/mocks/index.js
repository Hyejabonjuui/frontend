import { MOCK_PASSWORD, USERS } from '@/mocks/data/users';
import { mockAdapter } from '@/mocks/mockAdapter';
import { mockStore } from '@/mocks/store';

/**
 * 백엔드 없이 화면을 확인하려고 axios 어댑터를 목 핸들러로 바꾼다.
 * VITE_USE_MOCK 이 'true' 일 때만 호출된다.
 */
export const enableMockApi = (httpClient) => {
  httpClient.defaults.adapter = mockAdapter;

  window.hyejaMock = {
    reset: () => {
      mockStore.reset();
      window.location.reload();
    },
    accounts: USERS.map((user) => ({
      email: user.email,
      password: MOCK_PASSWORD,
      role: user.role,
    })),
  };

  const accountGuide = USERS.map((user) => `${user.email} / ${MOCK_PASSWORD}`).join(' · ');

  console.info(
    `[혜자] 목 API로 동작합니다. 로그인 계정: ${accountGuide}\n초기화: window.hyejaMock.reset()`,
  );
};
