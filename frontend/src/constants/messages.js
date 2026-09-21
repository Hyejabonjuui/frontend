/** 문구는 설계서 "공통 규칙 · 상태 정의"의 화면별 toast 예시를 따른다. */
export const TOAST_MESSAGES = {
  FAVORITE_ADDED: '관심 정책에 저장했어요',
  FAVORITE_REMOVED: '관심 정책에서 뺐어요',
  LOGIN_REQUIRED: '로그인하면 내 조건으로 판정해드려요',
  LOGOUT_DONE: '로그아웃했어요',
  SIGNUP_DONE: '가입이 완료됐어요',
  SIGNUP_LEFT: '처음부터 다시 진행돼요',
  CONDITION_SAVED: '내 조건을 저장했어요',
  CONDITION_REQUIRED: '필수 항목을 모두 채워 주세요',
  CONDITION_DRAFT_LOADED: '이어서 작성 중이에요 · 저장하지 않고 나갔던 내용을 불러왔어요',
  AI_FAILED:
    '지금은 AI 설명을 불러오지 못해 조건 판정 결과만 보여드려요. 자세한 자격은 상세에서 확인하세요.',
  NO_CANDIDATE: '조건에 맞는 정책을 찾지 못했어요',
  APPLY_LINK_MISSING: '신청 링크가 없는 정책이에요',
  NOTIFICATION_DELETED: '알림을 삭제했어요',
  ACCOUNT_DELETED: '회원 탈퇴가 끝났어요',
  ADMIN_COLLECT_STARTED: '정책 수집을 시작했어요',
  ADMIN_COLLECT_DONE: '정책 수집을 마쳤어요',
};

/** 설계서 S-06 "로그인 안내 창" 문구. 확인을 누르면 로그인 모달로 이어진다. */
export const LOGIN_NOTICE = {
  DEFAULT: {
    title: '로그인하고 1초만에 확인하기',
    description: '로그인하면 내 조건으로 판정해드려요',
  },
  SEARCH: {
    title: '로그인하고 1초만에 찾아보기',
    description: '검색은 로그인한 뒤에 쓸 수 있어요. 한 번 로그인하면 내 조건으로 바로 판정해드려요',
  },
  CONFIRM_LABEL: '로그인하고 확인하기',
};

export const ERROR_MESSAGES = {
  DEFAULT: '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요',
  NETWORK: '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요',
  TIMEOUT: '응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요',
  UNAUTHORIZED: '로그인이 필요한 서비스예요',
  FORBIDDEN: '접근 권한이 없어요',
  NOT_FOUND: '요청한 정보를 찾을 수 없어요',
  SERVER: '서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요',
  POLICY_LOAD_FAILED: '정책을 불러오지 못했어요. 잠시 후 다시 시도해 주세요',
};

export const EMPTY_MESSAGES = {
  POLICY_LIST: '조건에 맞는 정책이 없어요',
  RECOMMENDATION: '지금 조건에 맞는 주거 정책이 없어요',
  RECOMMENDATION_DESCRIPTION: '조건을 바꾸거나 다른 유형으로 찾아보세요. 새 정책은 매일 모아요.',
  RECOMMENDATION_CAPTION: '후보 0건 · 정책을 지어내지 않음',
  FAVORITE: '아직 관심 정책이 없어요',
  FAVORITE_DESCRIPTION: '정책 옆 ♡를 누르면 여기 모이고, 마감 7일 전에 알려드려요',
  NOTIFICATION: '받은 알림이 없어요',
  NOTIFICATION_UNREAD: '새로 온 알림이 없어요',
};

export const VALIDATION_MESSAGES = {
  REQUIRED_EMAIL: '이메일을 입력해 주세요',
  INVALID_EMAIL: '이메일 형식이 올바르지 않아요',
  DUPLICATED_EMAIL: '이미 가입된 이메일이에요',
  REQUIRED_PASSWORD: '비밀번호를 입력해 주세요',
  WEAK_PASSWORD: '8자 이상, 영문과 숫자, 특수문자를 섞어 주세요',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않아요',
  REQUIRED_NICKNAME: '닉네임을 입력해 주세요',
  LONG_NICKNAME: '닉네임은 최대 20자까지 쓸 수 있어요',
  REQUIRED_FIELD: '필수 항목이에요',
  REGION_WHOLE_NOT_ALLOWED: '시/군/구 전체는 선택할 수 없어요. 구체적인 지역을 선택해 주세요',
  REQUIRED_SEARCH_KEYWORD: '검색할 내용을 입력해 주세요',
};
