import { beforeEach, describe, expect, it } from 'vitest';

import { findHandler } from '@/mocks/handlers';
import { buildAccessToken, findUserByToken, mockStore } from '@/mocks/store';

describe('개발용 목 서버 회원 탈퇴', () => {
  beforeEach(() => {
    mockStore.reset();
  });

  it('회원과 조건은 soft delete하고 관심 정책·알림과 토큰은 제거한다', () => {
    const accessToken = buildAccessToken(1, 'USER');
    const authorization = `Bearer ${accessToken}`;
    const user = findUserByToken(authorization);
    const handler = findHandler('patch', '/api/members/me/delete');

    const response = handler.handle({ user, authorization });
    const state = mockStore.getState();
    const withdrawnUser = state.users.find((item) => item.id === 1);

    expect(response.status).toBe(200);
    expect(response.data.code).toBe('SUCCESS_001');
    expect(withdrawnUser.deletedAt).toBeTruthy();
    expect(withdrawnUser.profile.deletedAt).toBe(withdrawnUser.deletedAt);
    expect(state.favorites[1]).toBeUndefined();
    expect(state.notifications[1]).toBeUndefined();
    expect(findUserByToken(authorization)).toBeNull();
  });

  it('탈퇴 회원의 닉네임으로 새 계정을 만들 수 없다', () => {
    const accessToken = buildAccessToken(1, 'USER');
    const authorization = `Bearer ${accessToken}`;
    const withdrawalHandler = findHandler('patch', '/api/members/me/delete');
    withdrawalHandler.handle({ user: findUserByToken(authorization), authorization });

    const email = 'new-member@hyeja.kr';
    mockStore.update((state) => {
      state.emailVerifications[email] = {
        code: null,
        expiresAt: null,
        verifiedUntil: Date.now() + 30 * 60 * 1000,
      };

      return state;
    });

    const signupHandler = findHandler('post', '/api/members');
    const response = signupHandler.handle({
      body: {
        email,
        password: 'hyeja1234!',
        nickname: '민지',
        profile: {},
      },
    });

    expect(response.status).toBe(409);
    expect(response.data.message).toBe('이미 사용 중인 닉네임이에요');
    expect(mockStore.getState().users.some((item) => item.email === email)).toBe(false);
  });
});
