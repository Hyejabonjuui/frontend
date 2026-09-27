import { describe, expect, it } from 'vitest';

import { toPolicyDetail } from '@/api/policyApi';
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
