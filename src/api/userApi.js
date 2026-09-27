import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

const unwrapResult = (response) => response?.result ?? response;

export const toConditionForm = (profile) => {
  if (!profile) {
    return {};
  }

  // 로컬 목 API는 이미 화면 폼 모델을 반환한다.
  if ('birthDate' in profile || 'houseless' in profile || 'incomeRange' in profile) {
    return profile;
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
  toConditionForm(unwrapResult(await httpClient.get(ENDPOINTS.USER.PROFILE)));

export const updateMyConditions = async (conditionForm) =>
  toConditionForm(
    unwrapResult(await httpClient.patch(ENDPOINTS.USER.PROFILE, toProfileRequest(conditionForm))),
  );

/** F-05: 탈퇴하면 조건·관심 정책·알림이 함께 지워진다. */
export const deleteAccount = () => httpClient.patch(ENDPOINTS.USER.DELETE);
