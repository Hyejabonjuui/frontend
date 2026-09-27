import { ERROR_MESSAGES } from '@/constants/messages';

const STATUS_MESSAGES = {
  401: ERROR_MESSAGES.UNAUTHORIZED,
  403: ERROR_MESSAGES.FORBIDDEN,
  404: ERROR_MESSAGES.NOT_FOUND,
  500: ERROR_MESSAGES.SERVER,
};

const CODE_MESSAGES = {
  ECONNABORTED: ERROR_MESSAGES.TIMEOUT,
  ETIMEDOUT: ERROR_MESSAGES.TIMEOUT,
  ERR_NETWORK: ERROR_MESSAGES.NETWORK,
};

const API_CODE_MESSAGES = {
  VERIFY_001: '인증 코드가 올바르지 않아요',
  VERIFY_002: '인증 코드가 만료됐어요. 다시 받아 주세요',
  VERIFY_003: '이메일 인증을 먼저 완료해 주세요',
  VERIFY_004: '인증 코드는 60초 후 다시 받을 수 있어요',
  VERIFY_005: '인증 코드 입력 횟수를 초과했어요. 코드를 다시 받아 주세요',
  MEMBER_002: '이미 가입된 이메일이에요',
  MAIL_001: '인증 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요',
};

/** 요청 취소는 화면에 노출할 오류가 아니다. */
export const isCanceledError = (error) => error?.code === 'ERR_CANCELED';

export const getErrorMessage = (error) => {
  const response = error?.response;

  if (response) {
    return (
      API_CODE_MESSAGES[response.data?.code] ??
      response.data?.message ??
      STATUS_MESSAGES[response.status] ??
      ERROR_MESSAGES.DEFAULT
    );
  }

  return CODE_MESSAGES[error?.code] ?? ERROR_MESSAGES.NETWORK;
};
