import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';
import { tokenStorage } from '@/utils/tokenStorage';

const unwrapResult = (response) => response?.result ?? response;

export const toConditionForm = (profile) => {
  if (!profile) {
    return {};
  }

  return {
    birthDate: profile.birth ?? '',
    sidoCode: profile.regionCode?.slice(0, 2) ?? '',
    regionCode: profile.regionCode ?? '',
    employmentCode: profile.employmentCode ?? '',
    houseless: profile.houselessYn ?? null,
    marriageCode: profile.marriageCode ?? '',
    incomeRange: profile.incomeRangeCode ?? '',
    educationCode: profile.educationCode ?? '',
    housingType: profile.housingType ?? '',
  };
};

/** 홈의 "만 26세 · 서울특별시 마포구 · 무주택 기준으로 찾아요" 문구에 들어갈 요약을 만든다. */
export const toConditionSummary = (profile) =>
  [
    profile?.age == null ? '' : `만 ${profile.age}세`,
    profile?.regionName ?? '',
    profile?.houselessYn === true ? '무주택' : '',
  ]
    .filter(Boolean)
    .join(' · ');

const emptyToNull = (value) => (value === '' || value === undefined ? null : value);

export const toProfileRequest = (conditionForm) => ({
  birth: conditionForm.birthDate,
  regionCode: conditionForm.regionCode,
  employmentCode: conditionForm.employmentCode,
  houselessYn: conditionForm.houseless,
  marriageCode: emptyToNull(conditionForm.marriageCode),
  incomeRangeCode: emptyToNull(conditionForm.incomeRange),
  educationCode: emptyToNull(conditionForm.educationCode),
  housingType: emptyToNull(conditionForm.housingType),
});

export const toAccount = (response) => {
  const account = unwrapResult(response);

  return {
    id: account.memberId ?? account.id,
    memberId: account.memberId ?? account.id,
    email: account.email,
    nickname: account.nickname,
    joinedAt: (account.createdAt ?? account.joinedAt)?.slice(0, 10),
    role: account.role ?? tokenStorage.getRole() ?? 'USER',
  };
};

export const getMyAccount = async () => toAccount(await httpClient.get(ENDPOINTS.USER.ME));

export const getMyConditions = async () => {
  const profile = unwrapResult(await httpClient.get(ENDPOINTS.USER.PROFILE));

  return { conditions: toConditionForm(profile), summary: toConditionSummary(profile) };
};

export const updateMyConditions = async (conditionForm) =>
  toConditionForm(
    unwrapResult(await httpClient.patch(ENDPOINTS.USER.PROFILE, toProfileRequest(conditionForm))),
  );

/** F-05: 탈퇴하면 조건·관심 정책·알림이 함께 지워진다. */
export const deleteAccount = async () =>
  unwrapResult(await httpClient.patch(ENDPOINTS.USER.DELETE));
