import { describe, expect, it } from 'vitest';

import {
  toCardNewsDetail,
  toCardNewsList,
  toPolicyDetail,
  toPolicyList,
  toPolicyListParams,
  toPolicySearchResult,
} from '@/api/policyApi';
import { APPLY_PERIOD_TYPE, JUDGE_RESULT, RECOMMENDATION_GROUP } from '@/constants/policy';

describe('정책 상세 API 응답 변환', () => {
  it('응답 봉투와 회원 맞춤 필드를 정책 상세 화면 모델로 변환한다', () => {
    const policy = toPolicyDetail({
      isSuccess: true,
      code: 'SUCCESS_001',
      message: '요청에 성공했습니다.',
      result: {
        policyId: 'R202609270001',
        policyName: '청년 월세 지원',
        categories: ['MONTHLY_RENT'],
        categoryLabels: ['월세'],
        apiSubCategory: '주거비 지원',
        description: '월세를 지원해요.',
        supportContent: '월 최대 20만 원',
        extraQualification: '무주택자',
        applyPeriod: 'SPECIFIC_PERIOD',
        applyPeriodLabel: '특정기간',
        applyStartDate: '2026-09-01',
        applyEndDate: '2026-09-30',
        applyMethod: '온라인 신청',
        applyUrl: 'https://example.com/apply',
        refUrl: 'https://example.com/notice',
        activeYn: true,
        isFavorite: true,
        overallStatus: 'UNKNOWN',
        conditions: [
          {
            type: 'AGE',
            status: 'ABLE',
            policyCondition: '만 19~34세',
            memberValue: '만 27세',
          },
        ],
      },
    });

    expect(policy).toMatchObject({
      id: 'R202609270001',
      title: '청년 월세 지원',
      subtype: 'MONTHLY_RENT',
      subtypeName: '월세',
      benefit: '월 최대 20만 원',
      applyPeriodType: APPLY_PERIOD_TYPE.PERIOD,
      isFavorite: true,
      judgementGroup: RECOMMENDATION_GROUP.NEED_CHECK,
    });
    expect(policy.judgements).toEqual([
      {
        conditionKey: 'AGE',
        conditionName: '나이',
        result: JUDGE_RESULT.MET,
        requirement: '만 19~34세',
        myValue: '만 27세',
      },
    ]);
  });

  it('상시 모집과 알 수 없는 조건 상태를 안전하게 변환한다', () => {
    const policy = toPolicyDetail({
      policyId: 'always-policy',
      policyName: '상시 정책',
      applyPeriod: 'ALWAYS',
      conditions: [{ type: 'CUSTOM', status: 'NEW_STATUS' }],
    });

    expect(policy.applyPeriodType).toBe(APPLY_PERIOD_TYPE.ALWAYS);
    expect(policy.judgements[0]).toMatchObject({
      conditionKey: 'CUSTOM',
      conditionName: 'CUSTOM',
      result: JUDGE_RESULT.NEED_CHECK,
    });
  });
});

describe('카드뉴스 API 응답 변환', () => {
  it('목록 응답의 result와 DTO 필드를 화면 목록 모델로 변환한다', () => {
    expect(
      toCardNewsList({
        isSuccess: true,
        result: [
          {
            policyId: 'DEMO-HOUSING-001',
            policyName: '월세 부담 완화',
            description: '월 임대료 일부를 지원합니다.',
            applyEndDate: '2027-12-31',
          },
        ],
      }),
    ).toEqual([
      {
        policyId: 'DEMO-HOUSING-001',
        title: '월세 부담 완화',
        summary: '월 임대료 일부를 지원합니다.',
        applyEndDate: '2027-12-31',
        cardCount: 4,
      },
    ]);
  });

  it('상세 응답의 카드 배열을 팝업 모델로 변환하고 카드 수를 배열 길이로 계산한다', () => {
    expect(
      toCardNewsDetail({
        result: {
          policyId: 'DEMO-HOUSING-001',
          categoryLabel: '월세',
          isAuthenticated: false,
          isFavorite: false,
          applyUrl: 'https://example.com/apply',
          cards: [
            {
              cardNewsId: 11,
              cardNo: 1,
              title: '월세 부담 완화',
              badges: ['청년'],
              body: '월 임대료 일부를 지원합니다.',
            },
          ],
        },
      }),
    ).toEqual({
      policyId: 'DEMO-HOUSING-001',
      title: '월세 부담 완화',
      subtypeName: '월세',
      cardCount: 1,
      isAuthenticated: false,
      isFavorite: false,
      applyUrl: 'https://example.com/apply',
      cards: [
        {
          id: 11,
          order: 1,
          heading: '월세 부담 완화',
          tags: ['청년'],
          body: '월 임대료 일부를 지원합니다.',
        },
      ],
    });
  });
});

describe('정책 목록 API 요청·응답 변환', () => {
  it('비로그인 목록 필터와 1부터 시작하는 페이지를 백엔드 쿼리로 변환한다', () => {
    expect(
      toPolicyListParams({
        subtype: 'SUBSCRIPTION',
        sort: 'VIEWS',
        onlyMatched: true,
        page: 2,
        size: 8,
      }),
    ).toEqual({
      category: 'PURCHASE',
      sort: 'VIEW_COUNT',
      page: 1,
      size: 8,
    });

    expect(toPolicyListParams({ subtype: 'ALL', page: 1 })).not.toHaveProperty('category');
    expect(toPolicyListParams({ onlyMatched: true })).not.toHaveProperty('onlyEligible');
  });

  it('회원용 목록에만 필수 조건 필터를 포함한다', () => {
    expect(
      toPolicyListParams(
        {
          onlyMatched: true,
          page: 1,
        },
        { includeEligibility: true },
      ),
    ).toEqual({
      sort: 'DEADLINE',
      onlyEligible: true,
      page: 0,
      size: 8,
    });
  });

  it('회원용 목록 응답과 페이지 정보를 화면 모델로 변환한다', () => {
    const result = toPolicyList({
      isSuccess: true,
      result: {
        policies: [
          {
            policy_id: 'R202609230001',
            policy_name: '청년 월세 지원',
            category_codes: ['MONTHLY_RENT'],
            category_names: ['월세'],
            regions: [{ region_code: '11440', region_name: '서울특별시 마포구' }],
            nationwide: false,
            apply_end_date: '2026-09-30',
            apply_period_code: 'SPECIFIC_PERIOD',
            d_day: 4,
            favorite_yn: true,
          },
        ],
        page: 0,
        size: 8,
        totalElements: 24,
        totalPages: 3,
        hasNext: true,
      },
    });

    expect(result).toMatchObject({
      page: 1,
      size: 8,
      totalCount: 24,
      totalPages: 3,
      hasNext: true,
    });
    expect(result.content[0]).toMatchObject({
      id: 'R202609230001',
      title: '청년 월세 지원',
      subtypeName: '월세',
      regionName: '서울특별시 마포구',
      applyPeriodType: APPLY_PERIOD_TYPE.PERIOD,
      remainingDays: 4,
      isFavorite: true,
    });
  });
});

describe('정책 검색(추천) API 응답 변환', () => {
  const toSearchItem = (overrides = {}) => ({
    policyId: 'R202609280001',
    policyName: '청년 월세 지원',
    categories: ['MONTHLY_RENT'],
    applyEndDate: '2026-09-30',
    applyPeriod: 'SPECIFIC_PERIOD',
    isFavorite: false,
    aiReason: '조건을 모두 만족해요',
    status: {
      age: 'ABLE',
      region: 'ABLE',
      income: 'ABLE',
      employment: 'ABLE',
      houseless: 'ABLE',
    },
    ...overrides,
  });

  it('approved · underReview · declined를 가능 · 확인 필요 · 불가 그룹으로 나눈다', () => {
    const { groups, query, isAiFailed } = toPolicySearchResult({
      isSuccess: true,
      code: 'SUCCESS_001',
      message: '요청에 성공했습니다.',
      result: {
        approved: [toSearchItem({ policyId: 'A1' })],
        underReview: [toSearchItem({ policyId: 'U1' }), toSearchItem({ policyId: 'U2' })],
        declined: [toSearchItem({ policyId: 'D1' })],
      },
    });

    expect(groups[RECOMMENDATION_GROUP.POSSIBLE].map((policy) => policy.id)).toEqual(['A1']);
    expect(groups[RECOMMENDATION_GROUP.NEED_CHECK].map((policy) => policy.id)).toEqual([
      'U1',
      'U2',
    ]);
    expect(groups[RECOMMENDATION_GROUP.IMPOSSIBLE].map((policy) => policy.id)).toEqual(['D1']);
    expect(query).toBeNull();
    expect(isAiFailed).toBe(false);
  });

  it('검색 항목을 추천 카드 모델로 변환한다', () => {
    const { groups } = toPolicySearchResult({
      result: {
        approved: [toSearchItem({ applyPeriod: 'ALWAYS', isFavorite: true })],
      },
    });

    expect(groups[RECOMMENDATION_GROUP.POSSIBLE][0]).toMatchObject({
      id: 'R202609280001',
      title: '청년 월세 지원',
      subtype: 'MONTHLY_RENT',
      subtypeName: '월세',
      applyPeriodType: APPLY_PERIOD_TYPE.ALWAYS,
      applyEndDate: '2026-09-30',
      isFavorite: true,
      reason: '조건을 모두 만족해요',
    });
  });

  it.each([
    ['PURCHASE', 'SUBSCRIPTION', '청약·구입'],
    ['PUBLIC_RENT', 'PUBLIC_HOUSING', '공공임대'],
    ['OTHER', 'ETC_HOUSING', '기타 주거'],
    ['JEONSE', 'JEONSE', '전세'],
  ])('백엔드 카테고리 %s를 프론트 코드 %s로 바꾼다', (apiCategory, subtype, subtypeName) => {
    const { groups } = toPolicySearchResult({
      result: { approved: [toSearchItem({ categories: [apiCategory] })] },
    });

    expect(groups[RECOMMENDATION_GROUP.POSSIBLE][0]).toMatchObject({ subtype, subtypeName });
  });

  it('조건별 status를 판정 목록으로 바꾸고, 없는 값은 확인 필요로 둔다', () => {
    const { groups } = toPolicySearchResult({
      result: {
        declined: [
          toSearchItem({
            status: { age: 'ABLE', region: 'DISABLE', income: 'UNKNOWN', employment: null },
          }),
        ],
      },
    });

    expect(groups[RECOMMENDATION_GROUP.IMPOSSIBLE][0].judgements).toEqual([
      { conditionKey: 'AGE', conditionName: '나이', result: JUDGE_RESULT.MET },
      { conditionKey: 'REGION', conditionName: '지역', result: JUDGE_RESULT.NOT_MET },
      { conditionKey: 'INCOME', conditionName: '소득', result: JUDGE_RESULT.NEED_CHECK },
      { conditionKey: 'EMPLOYMENT', conditionName: '취업', result: JUDGE_RESULT.NEED_CHECK },
      { conditionKey: 'HOUSELESS', conditionName: '무주택', result: JUDGE_RESULT.NEED_CHECK },
    ]);
  });

  it('검색 결과가 비어 있으면 세 그룹 모두 빈 배열로 둔다', () => {
    expect(
      toPolicySearchResult({ result: { approved: [], underReview: [], declined: [] } }).groups,
    ).toEqual({
      [RECOMMENDATION_GROUP.POSSIBLE]: [],
      [RECOMMENDATION_GROUP.NEED_CHECK]: [],
      [RECOMMENDATION_GROUP.IMPOSSIBLE]: [],
    });
    expect(toPolicySearchResult({ result: null }).groups[RECOMMENDATION_GROUP.POSSIBLE]).toEqual(
      [],
    );
  });
});
