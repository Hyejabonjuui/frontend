/**
 * 통합 테스트용 응답 데이터.
 *
 * notice: 실제 백엔드가 없어서 src/mocks/data의 데모 데이터를 가져다 응답 모양으로 다듬는다.
 * notice: 응답 필드 모양은 src/mocks/handlers.js(목 서버)와 화면 코드가 기대하는 형태를 따른 가정값이다.
 *         백엔드 API 명세가 확정되면 이 파일의 필드명부터 명세에 맞춘다.
 * notice: 판정 결과(judgements)는 목 서버의 판정 로직(src/mocks/judge.js)을 쓰지 않고 고정값으로 둔다.
 *         실제 판정은 백엔드가 하므로, 프론트 테스트는 "받은 판정을 어떻게 보여 주는지"만 본다.
 */
import { JUDGE_RESULT, POLICY_SUBTYPES, RECOMMENDATION_GROUP } from '@/constants/policy';
import { buildCardNews } from '@/mocks/data/cardNews';
import { CODE_GROUPS } from '@/mocks/data/codes';
import { NOTIFICATIONS } from '@/mocks/data/notifications';
import { POLICIES } from '@/mocks/data/policies';
import { TERMS } from '@/mocks/data/terms';
import { USERS } from '@/mocks/data/users';

const findSubtypeName = (subtype) =>
  POLICY_SUBTYPES.find((option) => option.value === subtype)?.label ?? '기타 주거';

export const toPolicySummary = (policy) => ({
  id: policy.id,
  title: policy.title,
  subtype: policy.subtype,
  subtypeName: findSubtypeName(policy.subtype),
  regionName: policy.regionName,
  organization: policy.organization,
  summary: policy.summary,
  applyPeriodType: policy.applyPeriodType,
  applyStartDate: policy.applyStartDate,
  applyEndDate: policy.applyEndDate,
  viewCount: policy.viewCount,
});

const toPublicUser = (user, conditionSummary) => ({
  id: user.id,
  email: user.email,
  nickname: user.nickname,
  role: user.role,
  joinedAt: user.joinedAt,
  conditionSummary,
});

const [MEMBER, ADMIN] = USERS;

export const MEMBER_USER = toPublicUser(MEMBER, '만 27세 · 마포구 · 무주택');
export const ADMIN_USER = toPublicUser(ADMIN, '만 31세 · 서울 전체');
/** 가입 직후처럼 조건을 아직 등록하지 않은 회원 */
export const NEW_USER = { ...toPublicUser(MEMBER, ''), id: 3, email: 'new@hyeja.kr' };

export const MEMBER_CREDENTIALS = { email: MEMBER.email, password: MEMBER.password };

export const MEMBER_PROFILE = { ...MEMBER.profile };

export const TOKENS = {
  MEMBER: 'test-access-token-member',
  ADMIN: 'test-access-token-admin',
  NEW_USER: 'test-access-token-new-user',
};

/** Authorization 헤더의 토큰으로 로그인한 회원을 찾는다. */
export const USER_BY_TOKEN = {
  [TOKENS.MEMBER]: MEMBER_USER,
  [TOKENS.ADMIN]: ADMIN_USER,
  [TOKENS.NEW_USER]: NEW_USER,
};

export const CODES = CODE_GROUPS;

/** 실제 시군구 목록 API의 응답 계약을 재현한다. */
export const REGION_LIST_RESPONSE = {
  isSuccess: true,
  code: 'SUCCESS_001',
  message: '시군구 목록 조회에 성공했습니다.',
  result: CODES.regions.map((sido) => ({
    sidoCode: sido.sidoCode,
    sidoName: sido.sidoName,
    sigungu: sido.sigungu.map((region) => ({
      regionCode: region.code,
      sigunguName: region.name,
    })),
  })),
};

export const TERM_LIST = { content: TERMS };

export const POLICY = POLICIES[0];

export const POLICY_PAGE = {
  content: POLICIES.slice(0, 8).map(toPolicySummary),
  totalCount: POLICIES.length,
  totalPages: Math.ceil(POLICIES.length / 8),
};

const UI_TO_API_CATEGORY = {
  SUBSCRIPTION: 'PURCHASE',
  PUBLIC_HOUSING: 'PUBLIC_RENT',
  ETC_HOUSING: 'OTHER',
};

const toApiPolicyListItem = (policy, { isAuthenticated }) => ({
  policy_id: String(policy.id),
  policy_name: policy.title,
  category_codes: [UI_TO_API_CATEGORY[policy.subtype] ?? policy.subtype],
  category_names: [findSubtypeName(policy.subtype)],
  regions:
    policy.regionCode === 'ALL'
      ? []
      : [{ region_code: policy.regionCode, region_name: policy.regionName }],
  nationwide: policy.regionCode === 'ALL',
  apply_end_date: policy.applyEndDate,
  apply_period_code: policy.applyPeriodType === 'ALWAYS' ? 'ALWAYS' : 'SPECIFIC_PERIOD',
  d_day: null,
  ...(isAuthenticated ? { favorite_yn: policy.id === POLICY.id } : {}),
});

export const buildPolicyList = ({ isAuthenticated }) => ({
  policies: POLICIES.slice(0, 8).map((policy) => toApiPolicyListItem(policy, { isAuthenticated })),
  page: 0,
  size: 8,
  totalElements: POLICIES.length,
  totalPages: Math.ceil(POLICIES.length / 8),
  hasNext: POLICIES.length > 8,
});

export const EMPTY_POLICY_PAGE = { content: [], totalCount: 0, totalPages: 0 };

export const CARD_NEWS = { content: POLICIES.slice(0, 4).map(buildCardNews) };

export const RAW_CONDITIONS = [
  { key: 'AGE', label: '나이', value: '만 19~34세' },
  { key: 'REGION', label: '지역', value: '전국' },
  { key: 'INCOME', label: '소득', value: '기준 중위소득 60% 이하' },
];

export const JUDGEMENTS = [
  {
    conditionKey: 'AGE',
    conditionName: '나이',
    result: JUDGE_RESULT.MET,
    requirement: '만 19~34세',
    myValue: '만 27세',
  },
  {
    conditionKey: 'INCOME',
    conditionName: '소득',
    result: JUDGE_RESULT.NEED_CHECK,
    requirement: '기준 중위소득 60% 이하',
    myValue: '입력 안 함',
  },
  {
    conditionKey: 'HOUSELESS',
    conditionName: '무주택',
    result: JUDGE_RESULT.NOT_MET,
    requirement: '무주택자',
    myValue: '주택 보유',
  },
];

const RESULT_TO_API_STATUS = {
  [JUDGE_RESULT.MET]: 'ABLE',
  [JUDGE_RESULT.NOT_MET]: 'DISABLE',
  [JUDGE_RESULT.NEED_CHECK]: 'UNKNOWN',
};

const toApiCondition = (judgement) => ({
  type: judgement.conditionKey,
  status: RESULT_TO_API_STATUS[judgement.result],
  policyCondition: judgement.requirement,
  memberValue: judgement.myValue,
});

/** 실제 정책 상세 API 계약을 재현한다. */
export const buildPolicyDetail = (policy, { isAuthenticated }) => ({
  policyId: String(policy.id),
  policyName: policy.title,
  categories: [policy.subtype],
  categoryLabels: [findSubtypeName(policy.subtype)],
  apiSubCategory: findSubtypeName(policy.subtype),
  keywords: '',
  description: policy.description,
  supportContent: policy.benefit,
  extraQualification: policy.requirement?.extraQualification ?? '',
  applyPeriod: policy.applyPeriodType === 'ALWAYS' ? 'ALWAYS' : 'SPECIFIC_PERIOD',
  applyPeriodLabel: policy.applyPeriodType === 'ALWAYS' ? '상시' : '특정기간',
  applyStartDate: policy.applyStartDate,
  applyEndDate: policy.applyEndDate,
  applyMethod: policy.applyMethod,
  applyUrl: policy.applyUrl,
  refUrl: policy.applyUrl,
  activeYn: true,
  isFavorite: isAuthenticated,
  overallStatus: isAuthenticated ? 'DISABLE' : 'UNKNOWN',
  conditions: isAuthenticated
    ? JUDGEMENTS.map(toApiCondition)
    : RAW_CONDITIONS.map((condition) => ({
        type: condition.key,
        status: 'UNKNOWN',
        policyCondition: condition.value,
        memberValue: '',
      })),
});

const toRecommendation = (policy, reason) => ({
  ...toPolicySummary(policy),
  judgements: JUDGEMENTS,
  reason,
});

export const RECOMMENDATIONS = {
  query: { keyword: '월세', matchedSubtypeName: '월세', conditionSummary: '' },
  groups: {
    [RECOMMENDATION_GROUP.POSSIBLE]: [toRecommendation(POLICIES[0], '조건을 모두 만족해요')],
    [RECOMMENDATION_GROUP.NEED_CHECK]: [toRecommendation(POLICIES[1], '소득 확인이 필요해요')],
    [RECOMMENDATION_GROUP.IMPOSSIBLE]: [toRecommendation(POLICIES[2], '무주택 조건이 달라요')],
  },
  isAiFailed: false,
};

export const EMPTY_RECOMMENDATIONS = {
  query: { keyword: '없는 정책', matchedSubtypeName: '', conditionSummary: '' },
  groups: {
    [RECOMMENDATION_GROUP.POSSIBLE]: [],
    [RECOMMENDATION_GROUP.NEED_CHECK]: [],
    [RECOMMENDATION_GROUP.IMPOSSIBLE]: [],
  },
  isAiFailed: false,
};

export const FAVORITE_POLICY = POLICIES[1];

export const FAVORITES = {
  content: [
    {
      policyId: FAVORITE_POLICY.id,
      status: 'INTEREST',
      savedAt: '2026-09-19',
      policy: toPolicySummary(FAVORITE_POLICY),
    },
  ],
};

export const EMPTY_LIST = { content: [] };

export const NOTIFICATION_LIST = { content: NOTIFICATIONS };

export const COLLECT_LOG = {
  status: 'SUCCESS',
  startedAt: '2026-09-18T03:00:02+09:00',
  finishedAt: '2026-09-18T03:01:47+09:00',
  fetchedCount: 142,
  newCount: 3,
  updatedCount: 5,
  closedCount: 2,
};
