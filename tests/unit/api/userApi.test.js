import { beforeEach, describe, expect, it } from 'vitest';

import { toAccount } from '@/api/userApi';
import { tokenStorage } from '@/utils/tokenStorage';

const encodePayload = (payload) => {
  const value = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `header.${value}.signature`;
};

describe('회원 계정 조회 API', () => {
  beforeEach(() => {
    tokenStorage.setTokens({ accessToken: encodePayload({ sub: '1', role: 'USER' }) });
  });

  it('백엔드 응답을 로그인 회원 모델로 변환한다', () => {
    expect(
      toAccount({
        isSuccess: true,
        code: 'SUCCESS_001',
        message: '성공입니다.',
        result: {
          memberId: 1,
          email: 'member@hyeja.kr',
          nickname: '혜자회원',
          createdAt: '2026-09-27T15:00:42.070Z',
        },
      }),
    ).toEqual({
      id: 1,
      memberId: 1,
      email: 'member@hyeja.kr',
      nickname: '혜자회원',
      joinedAt: '2026-09-27',
      role: 'USER',
    });
  });
});
