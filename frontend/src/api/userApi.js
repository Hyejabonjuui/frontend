import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

export const getMyProfile = () => httpClient.get(ENDPOINTS.USER.ME);

export const getMyConditions = () => httpClient.get(ENDPOINTS.USER.PROFILE);

export const updateMyConditions = (conditionForm) =>
  httpClient.put(ENDPOINTS.USER.PROFILE, conditionForm);

/** F-05: 탈퇴하면 조건·관심 정책·알림이 함께 지워진다. */
export const deleteAccount = () => httpClient.delete(ENDPOINTS.USER.ME);
