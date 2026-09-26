/**
 * 통합 테스트의 기본(성공) 응답 핸들러.
 *
 * notice: 백엔드 없이 네트워크만 MSW로 가짜로 둔다. 화면·훅·api·httpClient는 실제 코드가 돈다.
 * notice: 경로는 반드시 ENDPOINTS에서 가져온다. endpoints.js를 고치면 테스트 경로도 함께 따라간다.
 *         (src/mocks/handlers.js는 경로를 문자열로 따로 비교하므로 거기와는 별개다)
 * notice: 화면 진입만으로 나가는 요청(홈 목록·카드뉴스, 로그인 후 알림·관심 목록 등)을 모두 여기서 받는다.
 *         setupMsw의 onUnhandledRequest: 'error' 때문에 빠진 핸들러가 있으면 테스트가 실패한다.
 *
 * 예외 응답(500, 401, 빈 목록)은 각 테스트에서 server.use(...)로 이 핸들러를 덮어써서 만든다.
 */
import { http } from 'msw';

import { ENDPOINTS } from '@/api/endpoints';
import { POLICIES } from '@/mocks/data/policies';

import {
  CARD_NEWS,
  CODES,
  COLLECT_LOG,
  FAVORITES,
  MEMBER_PROFILE,
  MEMBER_USER,
  NOTIFICATION_LIST,
  POLICY_PAGE,
  RECOMMENDATIONS,
  TERM_LIST,
  TOKENS,
  USER_BY_TOKEN,
  buildPolicyDetail,
} from './fixtures';
import { apiUrl, fail, ok } from './respond';

const findUser = (request) => {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  return USER_BY_TOKEN[token] ?? null;
};

/** 로그인이 필요한 API는 토큰이 없거나 모르는 토큰이면 401을 준다. 실제 서버의 인증 거절을 흉내 낸다. */
const withUser = (resolve) => (info) => {
  const user = findUser(info.request);

  return user ? resolve({ ...info, user }) : fail(401, '로그인이 필요한 서비스예요');
};

export const handlers = [
  http.post(apiUrl(ENDPOINTS.AUTH.LOGIN), async ({ request }) => {
    const body = await request.json();

    if (body.email !== MEMBER_USER.email) {
      return fail(401, '이메일 또는 비밀번호가 올바르지 않아요');
    }

    return ok({
      accessToken: TOKENS.MEMBER,
      refreshToken: 'test-refresh-token',
      user: MEMBER_USER,
    });
  }),
  http.post(apiUrl(ENDPOINTS.AUTH.LOGOUT), () => ok()),

  http.get(
    apiUrl(ENDPOINTS.USER.ME),
    withUser(({ user }) => ok(user)),
  ),
  http.get(
    apiUrl(ENDPOINTS.USER.PROFILE),
    withUser(() => ok(MEMBER_PROFILE)),
  ),
  http.put(
    apiUrl(ENDPOINTS.USER.PROFILE),
    withUser(async ({ request }) => ok(await request.json())),
  ),

  http.get(apiUrl(ENDPOINTS.CODE.LIST), () => ok(CODES)),
  http.get(apiUrl(ENDPOINTS.POLICY.TERMS), () => ok(TERM_LIST)),
  http.get(apiUrl(ENDPOINTS.POLICY.CARD_NEWS), () => ok(CARD_NEWS)),
  http.get(apiUrl(ENDPOINTS.POLICY.LIST), () => ok(POLICY_PAGE)),
  http.get(apiUrl(ENDPOINTS.POLICY.DETAIL(':policyId')), ({ params, request }) => {
    const policy = POLICIES.find((item) => item.id === Number(params.policyId));

    if (!policy) {
      return fail(404, '요청한 정보를 찾을 수 없어요');
    }

    return ok(buildPolicyDetail(policy, { isAuthenticated: Boolean(findUser(request)) }));
  }),
  http.post(apiUrl(ENDPOINTS.POLICY.RECOMMENDATIONS), () => ok(RECOMMENDATIONS)),

  http.get(
    apiUrl(ENDPOINTS.FAVORITE.LIST),
    withUser(() => ok(FAVORITES)),
  ),
  http.post(
    apiUrl(ENDPOINTS.FAVORITE.DETAIL(':policyId')),
    withUser(() => ok()),
  ),
  http.delete(
    apiUrl(ENDPOINTS.FAVORITE.DETAIL(':policyId')),
    withUser(() => ok()),
  ),

  http.get(
    apiUrl(ENDPOINTS.NOTIFICATION.LIST),
    withUser(() => ok(NOTIFICATION_LIST)),
  ),

  http.post(
    apiUrl(ENDPOINTS.ADMIN.COLLECT),
    withUser(() => ok(COLLECT_LOG)),
  ),
];
