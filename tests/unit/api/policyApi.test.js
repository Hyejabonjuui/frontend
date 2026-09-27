import { describe, expect, it } from 'vitest';

import { toPolicyDetail, toPolicyList, toPolicyListParams } from '@/api/policyApi';
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

describe('정책 목록 API 요청·응답 변환', () => {
  it('화면 필터와 1부터 시작하는 페이지를 백엔드 쿼리로 변환한다', () => {
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
      onlyEligible: true,
      page: 1,
      size: 8,
    });

    expect(toPolicyListParams({ subtype: 'ALL', page: 1 })).not.toHaveProperty('category');
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
