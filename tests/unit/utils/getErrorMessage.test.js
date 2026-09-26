import { describe, expect, it } from 'vitest';

import { ERROR_MESSAGES } from '@/constants/messages';
import { getErrorMessage, isCanceledError } from '@/utils/getErrorMessage';

/** axios 오류 객체 중 이 함수가 읽는 부분만 만든다. */
const responseError = (status, data = {}) => ({ response: { status, data } });

describe('getErrorMessage', () => {
  it('서버가 보낸 message를 가장 먼저 쓴다', () => {
    expect(getErrorMessage(responseError(400, { message: '이미 가입된 이메일이에요' }))).toBe(
      '이미 가입된 이메일이에요',
    );
  });

  it.each([
    [401, ERROR_MESSAGES.UNAUTHORIZED],
    [403, ERROR_MESSAGES.FORBIDDEN],
    [404, ERROR_MESSAGES.NOT_FOUND],
    [500, ERROR_MESSAGES.SERVER],
  ])('message가 없으면 %i 상태에 맞는 문구를 준다', (status, message) => {
    expect(getErrorMessage(responseError(status))).toBe(message);
  });

  it('모르는 상태 코드는 기본 문구를 준다', () => {
    expect(getErrorMessage(responseError(418))).toBe(ERROR_MESSAGES.DEFAULT);
  });

  it.each([
    ['ECONNABORTED', ERROR_MESSAGES.TIMEOUT],
    ['ETIMEDOUT', ERROR_MESSAGES.TIMEOUT],
    ['ERR_NETWORK', ERROR_MESSAGES.NETWORK],
  ])('응답이 없고 코드가 %s이면 그에 맞는 문구를 준다', (code, message) => {
    expect(getErrorMessage({ code })).toBe(message);
  });

  it('응답도 코드도 없으면 네트워크 문구를 준다', () => {
    expect(getErrorMessage(undefined)).toBe(ERROR_MESSAGES.NETWORK);
  });
});

describe('isCanceledError', () => {
  it('요청 취소 오류만 true다', () => {
    expect(isCanceledError({ code: 'ERR_CANCELED' })).toBe(true);
    expect(isCanceledError({ code: 'ERR_NETWORK' })).toBe(false);
    expect(isCanceledError(null)).toBe(false);
  });
});
