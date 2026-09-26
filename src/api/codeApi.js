import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';
import { PROFILE_CODE_GROUPS } from '@/constants/profileCodes';

const unwrapResult = (response) => response?.result ?? response;

/** 지역은 서버에서 받고, enum 선택지는 백엔드 enum과 동일한 고정 코드표를 쓴다. */
export const getCodes = async () => {
  const response = await httpClient.get(ENDPOINTS.CODE.REGIONS);
  const regions = unwrapResult(response).map((sido) => ({
    ...sido,
    sigungu: sido.sigungu.map((region) => ({
      code: region.code ?? region.regionCode,
      name: region.name ?? region.sigunguName,
    })),
  }));

  return { regions, ...PROFILE_CODE_GROUPS };
};
