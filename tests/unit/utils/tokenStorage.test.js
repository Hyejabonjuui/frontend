import { describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { tokenStorage } from '@/utils/tokenStorage';

// localStorage는 setupDom에서 테스트마다 비운다.
describe('tokenStorage', () => {
  it('저장한 두 토큰을 그대로 돌려준다', () => {
    tokenStorage.setTokens({ accessToken: 'access', refreshToken: 'refresh' });

    expect(tokenStorage.getAccessToken()).toBe('access');
    expect(tokenStorage.getRefreshToken()).toBe('refresh');
  });

  it('저장한 적이 없으면 null을 준다', () => {
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it('한쪽 토큰만 오면 그 토큰만 바꾸고 다른 쪽은 건드리지 않는다', () => {
    tokenStorage.setTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' });
    tokenStorage.setTokens({ accessToken: 'new-access' });

    expect(tokenStorage.getAccessToken()).toBe('new-access');
    expect(tokenStorage.getRefreshToken()).toBe('old-refresh');
  });

  it('clear는 두 토큰만 지우고 다른 저장값은 남긴다', () => {
    tokenStorage.setTokens({ accessToken: 'access', refreshToken: 'refresh' });
    localStorage.setItem(STORAGE_KEYS.CONDITION_DRAFT, '{}');

    tokenStorage.clear();

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.CONDITION_DRAFT)).toBe('{}');
  });
});
