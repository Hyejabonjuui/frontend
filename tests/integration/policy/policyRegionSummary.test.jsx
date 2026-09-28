/**
 * 홈 정책 목록의 지역 요약 표시 (S-01)
 *
 * notice: 실제 백엔드 없이 MSW가 정책 목록·시군구 목록(/api/regions)·내 조건(/api/members/me/profile)에 응답한다.
 * notice: 정책 지역은 백엔드 PolicySyncItemService처럼 시·도 코드를 시군구 전체로 풀어 둔 모양을 가정한다.
 *         시·도 코드표는 목 코드표(src/mocks/data/codes.js)라 서울이 4개 구뿐이다.
 *         백엔드가 시·도 단위로 내려주도록 바뀌면 REGIONS 값과 "전체" 기대값을 명세에 맞춘다.
 * notice: 회원 거주지는 목 회원 조건(MEMBER_PROFILE.regionCode = 11440 마포구)을 쓴다.
 */
import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';

import { renderApp, signInAs } from '../../helpers/renderApp';
import { CODES, TOKENS } from '../../msw/fixtures';
import { apiUrl, fail, ok } from '../../msw/respond';
import { server } from '../../msw/server';

const SEOUL = CODES.regions.find((sido) => sido.sidoCode === '11');

const toRegion = (code) => ({
  region_code: code,
  region_name: `서울특별시 ${SEOUL.sigungu.find((sigungu) => sigungu.code === code).name}`,
});

const REGIONS = {
  THREE_DISTRICTS: ['11200', '11440', '11680'].map(toRegion),
  WHOLE_SEOUL: SEOUL.sigungu
    .map((sigungu) => sigungu.code)
    .filter((code) => code !== '11000')
    .sort()
    .map(toRegion),
};

const buildPolicyItem = (policyId, policyName, { regions = [], nationwide = false }) => ({
  policy_id: policyId,
  policy_name: policyName,
  category_codes: ['MONTHLY_RENT'],
  category_names: ['월세'],
  regions,
  nationwide,
  apply_end_date: '2026-12-31',
  apply_period_code: 'SPECIFIC_PERIOD',
  d_day: 30,
  favorite_yn: false,
});

const POLICY_LIST_RESPONSE = {
  isSuccess: true,
  result: {
    policies: [
      buildPolicyItem('R1', '세 구 공통 월세 지원', { regions: REGIONS.THREE_DISTRICTS }),
      buildPolicyItem('R2', '서울 전역 월세 지원', { regions: REGIONS.WHOLE_SEOUL }),
      buildPolicyItem('R3', '전국 월세 지원', { nationwide: true }),
    ],
    page: 0,
    size: 8,
    totalElements: 3,
    totalPages: 1,
    hasNext: false,
  },
};

const findPolicyRow = async (policyName) =>
  (await screen.findByText(policyName, undefined, { timeout: 5000 })).closest('a');

const useGuestList = () =>
  server.use(http.get(apiUrl(ENDPOINTS.POLICY.LIST), () => ok(POLICY_LIST_RESPONSE)));

const useMemberList = () =>
  server.use(http.get(apiUrl(ENDPOINTS.POLICY.MEMBER_LIST), () => ok(POLICY_LIST_RESPONSE)));

describe('홈 정책 목록 지역 요약', () => {
  it('비회원은 지역 코드 순서로 요약하고, 시·도 전체와 전국을 한 단위로 보여 준다', async () => {
    useGuestList();
    renderApp('/home');

    const threeDistrictsRow = await findPolicyRow('세 구 공통 월세 지원');
    const wholeSeoulRow = await findPolicyRow('서울 전역 월세 지원');

    expect(
      await within(threeDistrictsRow).findByText('서울특별시 성동구 외 2개'),
    ).toBeInTheDocument();
    expect(await within(wholeSeoulRow).findByText('서울특별시 전체')).toBeInTheDocument();
    expect(within(await findPolicyRow('전국 월세 지원')).getByText('전국')).toBeInTheDocument();
  });

  it('로그인 회원은 거주지를 포함한 단위를 첫 단위로 보여 준다', async () => {
    useMemberList();
    signInAs(TOKENS.MEMBER);
    renderApp('/home');

    const row = await findPolicyRow('세 구 공통 월세 지원');

    expect(await within(row).findByText('서울특별시 마포구 외 2개')).toBeInTheDocument();
  });

  it('요약된 지역은 키보드 포커스로 전체 목록 툴팁을 열고, 링크 이름에도 전체 목록이 들어간다', async () => {
    useGuestList();
    const { user } = renderApp('/home');

    const summary = await screen.findByText('서울특별시 성동구 외 2개', undefined, {
      timeout: 5000,
    });
    summary.focus();

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('서울특별시 성동구');
    expect(tooltip).toHaveTextContent('서울특별시 마포구');
    expect(tooltip).toHaveTextContent('서울특별시 강남구');
    expect(
      screen.getByRole('link', {
        name: /대상 지역 전체: 서울특별시 성동구, 서울특별시 마포구, 서울특별시 강남구/,
      }),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('시군구 목록과 내 조건을 못 불러와도 목록은 개수 요약으로 보여 준다', async () => {
    useMemberList();
    server.use(
      http.get(apiUrl(ENDPOINTS.CODE.REGIONS), () => fail(500)),
      http.get(apiUrl(ENDPOINTS.USER.PROFILE), () => fail(500)),
    );
    signInAs(TOKENS.MEMBER);
    renderApp('/home');

    const threeDistrictsRow = await findPolicyRow('세 구 공통 월세 지원');
    const wholeSeoulRow = await findPolicyRow('서울 전역 월세 지원');

    expect(within(threeDistrictsRow).getByText('서울특별시 성동구 외 2개')).toBeInTheDocument();
    expect(within(wholeSeoulRow).getByText('서울특별시 성동구 외 3개')).toBeInTheDocument();
  });

  it('조건을 등록하지 않은 회원도 홈에 머물고 비회원 순서로 요약한다', async () => {
    let isProfileRequested = false;

    useMemberList();
    server.use(
      http.get(apiUrl(ENDPOINTS.USER.PROFILE), () => {
        isProfileRequested = true;

        return HttpResponse.json(
          {
            isSuccess: false,
            code: 'PROFILE_001',
            message: '등록된 조건이 없습니다.',
            result: null,
          },
          { status: 404 },
        );
      }),
    );
    signInAs(TOKENS.NEW_USER);
    renderApp('/home');

    await waitFor(() => expect(isProfileRequested).toBe(true));
    const row = await findPolicyRow('세 구 공통 월세 지원');

    expect(within(row).getByText('서울특별시 성동구 외 2개')).toBeInTheDocument();
    expect(window.location.pathname).not.toBe(ROUTES.CONDITION_SETUP);
  });
});
