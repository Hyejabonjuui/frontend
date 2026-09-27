import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

const unwrapResult = (response) => response?.result ?? response;

export const getMyProfile = async () => {
  const response = await httpClient.get(ENDPOINTS.USER.ME);
  const account = unwrapResult(response);

  return {
    ...account,
    id: account.id ?? account.memberId,
    joinedAt: account.joinedAt ?? account.createdAt?.slice(0, 10),
    hasProfile: account.hasProfile ?? (account.memberId == null ? undefined : true),
  };
};

export const getMyConditions = async () =>
  unwrapResult(await httpClient.get(ENDPOINTS.USER.PROFILE));

export const updateMyConditions = async (conditionForm) =>
  unwrapResult(await httpClient.patch(ENDPOINTS.USER.PROFILE, conditionForm));

/** F-05: 탈퇴하면 조건·관심 정책·알림이 함께 지워진다. */
export const deleteAccount = () => httpClient.patch(ENDPOINTS.USER.DELETE);
