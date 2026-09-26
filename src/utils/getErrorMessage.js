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

/** 요청 취소는 화면에 노출할 오류가 아니다. */
export const isCanceledError = (error) => error?.code === 'ERR_CANCELED';

export const getErrorMessage = (error) => {
  const response = error?.response;

  if (response) {
    return response.data?.message ?? STATUS_MESSAGES[response.status] ?? ERROR_MESSAGES.DEFAULT;
  }

  return CODE_MESSAGES[error?.code] ?? ERROR_MESSAGES.NETWORK;
};
