import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

import { APPLY_PERIOD_TYPE, JUDGE_RESULT, RECOMMENDATION_GROUP } from '@/constants/policy';

const CONDITION_LABELS = {
  AGE: '나이',
  REGION: '지역',
  INCOME: '소득',
  EMPLOYMENT: '취업',
  HOUSELESS: '무주택',
};

const STATUS_TO_RESULT = {
  ABLE: JUDGE_RESULT.MET,
  DISABLE: JUDGE_RESULT.NOT_MET,
  UNKNOWN: JUDGE_RESULT.NEED_CHECK,
};

const STATUS_TO_GROUP = {
  ABLE: RECOMMENDATION_GROUP.POSSIBLE,
  DISABLE: RECOMMENDATION_GROUP.IMPOSSIBLE,
  UNKNOWN: RECOMMENDATION_GROUP.NEED_CHECK,
};

const STATUS_SUMMARIES = {
  ABLE: '신청 가능한 조건이에요',
  DISABLE: '충족하지 못한 조건이 있어요',
  UNKNOWN: '직접 확인이 필요한 조건이 있어요',
};

const unwrapResult = (response) => response?.result ?? response;

export const toPolicyDetail = (response) => {
  const result = unwrapResult(response);

  if (!result) {
    return null;
  }

  const judgements = (result.conditions ?? []).map((condition) => ({
    conditionKey: condition.type,
    conditionName: CONDITION_LABELS[condition.type] ?? condition.type,
    result: STATUS_TO_RESULT[condition.status] ?? JUDGE_RESULT.NEED_CHECK,
    requirement: condition.policyCondition,
    myValue: condition.memberValue,
  }));

  return {
    id: result.policyId,
    title: result.policyName,
    subtype: result.categories?.[0] ?? result.apiSubCategory ?? '',
    subtypeName: result.categoryLabels?.[0] ?? result.apiSubCategory ?? '기타 주거',
    categoryLabels: result.categoryLabels ?? [],
    description: result.description ?? '',
    benefit: result.supportContent ?? '',
    extraQualification: result.extraQualification ?? '',
    applyPeriodType:
      result.applyPeriod === 'ALWAYS' ? APPLY_PERIOD_TYPE.ALWAYS : APPLY_PERIOD_TYPE.PERIOD,
    applyPeriodLabel: result.applyPeriodLabel ?? '',
    applyStartDate: result.applyStartDate,
    applyEndDate: result.applyEndDate,
    applyMethod: result.applyMethod ?? '',
    applyUrl: result.applyUrl,
    refUrl: result.refUrl,
    active: result.activeYn,
    isFavorite: Boolean(result.isFavorite),
    judgements,
    rawConditions: judgements.map((judgement) => ({
      key: judgement.conditionKey,
      label: judgement.conditionName,
      value: judgement.requirement,
    })),
    judgementSummary: STATUS_SUMMARIES[result.overallStatus] ?? '',
    judgementGroup: STATUS_TO_GROUP[result.overallStatus] ?? null,
  };
};

export const getPolicies = (params) => httpClient.get(ENDPOINTS.POLICY.LIST, { params });

export const getPolicyDetail = async (policyId) =>
  toPolicyDetail(await httpClient.get(ENDPOINTS.POLICY.DETAIL(policyId)));

export const getCardNews = () => httpClient.get(ENDPOINTS.POLICY.CARD_NEWS);

/** F-14: 설계서대로 검색어를 body의 query로 보낸다. */
export const getRecommendations = ({ keyword }) =>
  httpClient.post(ENDPOINTS.POLICY.RECOMMENDATIONS, { query: keyword });

export const getTerms = () => httpClient.get(ENDPOINTS.POLICY.TERMS);
