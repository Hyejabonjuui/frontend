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
});
