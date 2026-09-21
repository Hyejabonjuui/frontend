/** 지역 제한이 없는 정책의 지역 코드. 어느 지역에 살든 대상이 된다. */
export const NATIONWIDE_REGION_CODE = 'ALL';

export const POLICY_SUBTYPES = [
  { value: 'ALL', label: '전체' },
  { value: 'MONTHLY_RENT', label: '월세' },
  { value: 'JEONSE', label: '전세' },
  { value: 'SUBSCRIPTION', label: '청약·구입' },
  { value: 'PUBLIC_HOUSING', label: '공공임대' },
  { value: 'ETC_HOUSING', label: '기타 주거' },
];

export const POLICY_SEARCH_HASHTAGS = ['월세', '전세', '청약', '공공임대'];

/** 설계서 S-01 Select/Sort: 마감 임박순 · 조회순 두 가지만 쓴다. */
export const POLICY_SORT_OPTIONS = [
  { value: 'DEADLINE', label: '마감 임박순' },
  { value: 'VIEWS', label: '조회순' },
];

export const APPLY_PERIOD_TYPE = {
  ALWAYS: 'ALWAYS',
  PERIOD: 'PERIOD',
};

export const JUDGE_RESULT = {
  MET: 'MET',
  NOT_MET: 'NOT_MET',
  NEED_CHECK: 'NEED_CHECK',
};

export const JUDGE_RESULT_LABEL = {
  [JUDGE_RESULT.MET]: '충족',
  [JUDGE_RESULT.NOT_MET]: '미충족',
  [JUDGE_RESULT.NEED_CHECK]: '확인필요',
};

export const RECOMMENDATION_GROUP = {
  POSSIBLE: 'POSSIBLE',
  NEED_CHECK: 'NEED_CHECK',
  IMPOSSIBLE: 'IMPOSSIBLE',
};

/** 설계서 S-05의 그룹 제목을 그대로 쓴다. */
export const RECOMMENDATION_GROUP_LABEL = {
  [RECOMMENDATION_GROUP.POSSIBLE]: '받을 수 있어요',
  [RECOMMENDATION_GROUP.NEED_CHECK]: '확인이 필요해요',
  [RECOMMENDATION_GROUP.IMPOSSIBLE]: '아쉽게 안 돼요',
};

export const RECOMMENDATION_GROUP_DESCRIPTION = {
  [RECOMMENDATION_GROUP.POSSIBLE]: '조건을 모두 만족하는 정책이에요',
  [RECOMMENDATION_GROUP.NEED_CHECK]: '입력하지 않은 조건이 있거나, 공고문에서 직접 확인이 필요해요',
  [RECOMMENDATION_GROUP.IMPOSSIBLE]: '왜 안 되는지 함께 알려드려요',
};

/** 서버가 관심 정책과 함께 내려주는 상태값. 화면에서는 따로 바꾸지 않는다. */
export const FAVORITE_STATUS = {
  INTEREST: 'INTEREST',
  PREPARING: 'PREPARING',
  APPLIED: 'APPLIED',
};

export const DDAY_IMMINENT_THRESHOLD = 7;
export const POLICY_PAGE_SIZE = 8;
export const SEARCH_KEYWORD_MAX_LENGTH = 200;
