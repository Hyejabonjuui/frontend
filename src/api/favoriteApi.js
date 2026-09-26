import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';
import { APPLY_PERIOD_TYPE, FAVORITE_STATUS } from '@/constants/policy';

const toFavorite = (favorite) => {
  // 로컬 목 API는 이미 화면 모델을 반환하므로 변환하지 않는다.
  if (favorite.policy) {
    return favorite;
  }

  return {
    favoriteId: favorite.favorite_id,
    policyId: favorite.policy_id,
    status: FAVORITE_STATUS.INTEREST,
    savedAt: favorite.created_at,
    policy: {
      id: favorite.policy_id,
      title: favorite.policy_name,
      subtype: favorite.category_code,
      subtypeName: favorite.category_name,
      regionName: '',
      organization: '',
      summary: favorite.support_content ?? '',
      applyPeriodType: favorite.apply_end_date
        ? APPLY_PERIOD_TYPE.PERIOD
        : APPLY_PERIOD_TYPE.ALWAYS,
      applyStartDate: null,
      applyEndDate: favorite.apply_end_date,
      applyUrl: favorite.apply_url,
    },
  };
};

const unwrapResult = (response) => response?.result ?? response;

/**
 * 백엔드의 ApiResponse/result + snake_case 계약을 화면에서 쓰는 모델로 변환한다.
 * 변환을 API 경계에 두어 훅과 컴포넌트가 서버 필드명에 의존하지 않게 한다.
 */
export const getFavorites = async ({ memberId, ...params }) => {
  const response = await httpClient.get(ENDPOINTS.FAVORITE.LIST, {
    params: { memberId, ...params },
  });
  const result = unwrapResult(response) ?? {};

  return {
    content: (result.favorites ?? result.content ?? []).map(toFavorite),
    page: result.page ?? 0,
    size: result.size ?? 0,
    totalCount: result.totalElements ?? result.totalCount ?? 0,
    totalPages: result.totalPages ?? 0,
    hasNext: result.hasNext ?? false,
  };
};

export const addFavorite = (policyId, memberId) =>
  httpClient.post(ENDPOINTS.FAVORITE.DETAIL(policyId), null, { params: { memberId } });

export const removeFavorite = (policyId, memberId) =>
  httpClient.delete(ENDPOINTS.FAVORITE.DETAIL(policyId), { params: { memberId } });
