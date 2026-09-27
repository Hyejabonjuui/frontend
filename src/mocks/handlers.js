import {
  APPLY_PERIOD_TYPE,
  FAVORITE_STATUS,
  JUDGE_RESULT,
  NATIONWIDE_REGION_CODE,
  RECOMMENDATION_GROUP,
} from '@/constants/policy';
import { buildCardNews } from '@/mocks/data/cardNews';
import { CODE_GROUPS } from '@/mocks/data/codes';
import { POLICIES } from '@/mocks/data/policies';
import { getPolicyStringLengthCase } from '@/mocks/data/policyStringLengthCases';
import { TERMS } from '@/mocks/data/terms';
import {
  buildJudgementReason,
  buildJudgements,
  buildRawConditions,
  getRecommendationGroup,
} from '@/mocks/judge';
import { buildAccessToken, findUserByToken, mockStore } from '@/mocks/store';

const ok = (data) => ({ status: 200, data });
const fail = (status, message) => ({ status, data: { message } });

const buildRegionListResponse = () => ({
  isSuccess: true,
  code: 'SUCCESS_001',
  message: '시군구 목록 조회에 성공했습니다.',
  result: CODE_GROUPS.regions.map((sido) => ({
    sidoCode: sido.sidoCode,
    sidoName: sido.sidoName,
    sigungu: sido.sigungu.map((region) => ({
      regionCode: region.code,
      sigunguName: region.name,
    })),
  })),
});

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  nickname: user.nickname,
  role: user.role,
  joinedAt: user.joinedAt,
  conditionSummary: buildConditionSummary(user.profile),
});

const findRegionName = (regionCode) => {
  const sido = CODE_GROUPS.regions.find((region) =>
    region.sigungu.some((sigungu) => sigungu.code === regionCode),
  );

  return sido?.sigungu.find((sigungu) => sigungu.code === regionCode)?.name ?? '';
};

function buildConditionSummary(profile) {
  if (!profile?.birthDate) {
    return '';
  }

  const birthYear = Number(profile.birthDate.slice(0, 4));
  const age = new Date().getFullYear() - birthYear;
  const parts = [`만 ${age}세`, findRegionName(profile.regionCode)];

  if (profile.houseless) {
    parts.push('무주택');
  }

  return parts.filter(Boolean).join(' · ');
}

const remainingDays = (policy) => {
  if (policy.applyPeriodType === APPLY_PERIOD_TYPE.ALWAYS) {
    return Number.MAX_SAFE_INTEGER;
  }

  const end = new Date(policy.applyEndDate);
  const today = new Date();

  return Math.round((end - today) / (1000 * 60 * 60 * 24));
};

const toPolicySummary = (policy) => ({
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

const UI_TO_API_CATEGORY = {
  SUBSCRIPTION: 'PURCHASE',
  PUBLIC_HOUSING: 'PUBLIC_RENT',
  ETC_HOUSING: 'OTHER',
};

const API_TO_UI_CATEGORY = Object.fromEntries(
  Object.entries(UI_TO_API_CATEGORY).map(([uiCategory, apiCategory]) => [apiCategory, uiCategory]),
);

const toApiPolicyListItem = (policy, user) => ({
  policy_id: String(policy.id),
  policy_name: policy.title,
  category_codes: [UI_TO_API_CATEGORY[policy.subtype] ?? policy.subtype],
  category_names: [findSubtypeName(policy.subtype)],
  regions:
    policy.regionCode === NATIONWIDE_REGION_CODE
      ? []
      : [{ region_code: policy.regionCode, region_name: policy.regionName }],
  nationwide: policy.regionCode === NATIONWIDE_REGION_CODE,
  apply_end_date: policy.applyEndDate,
  apply_period_code:
    policy.applyPeriodType === APPLY_PERIOD_TYPE.ALWAYS ? 'ALWAYS' : 'SPECIFIC_PERIOD',
  d_day: policy.applyPeriodType === APPLY_PERIOD_TYPE.ALWAYS ? null : remainingDays(policy),
  ...(user
    ? { favorite_yn: getFavorites(user.id).some((favorite) => favorite.policyId === policy.id) }
    : {}),
});

const SUBTYPE_NAMES = {
  MONTHLY_RENT: '월세',
  JEONSE: '전세',
  SUBSCRIPTION: '청약·구입',
  PUBLIC_HOUSING: '공공임대',
  ETC_HOUSING: '기타 주거',
};

function findSubtypeName(subtype) {
  return SUBTYPE_NAMES[subtype] ?? '기타 주거';
}

const sortPolicies = (policies, sort) => {
  if (sort === 'VIEWS') {
    return [...policies].sort((a, b) => b.viewCount - a.viewCount);
  }

  if (sort === 'LATEST') {
    return [...policies].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return [...policies].sort((a, b) => remainingDays(a) - remainingDays(b));
};

const getFavorites = (userId) => mockStore.getState().favorites[userId] ?? [];

const getNotifications = (userId) => mockStore.getState().notifications[userId] ?? [];

// notice: 더미 데이터의 UI 문자열 테스트용이다. URL에 필드·길이가 유효할 때만 정책 1건을 대체한다.
// 예: /policies/1?uiTextTestField=title&uiTextTestLength=50
const getActivePolicies = () => {
  if (typeof window === 'undefined') {
    return POLICIES;
  }

  const query = new URLSearchParams(window.location.search);
  const lengthText = query.get('uiTextTestLength');
  const length = lengthText && /^\d+$/.test(lengthText) ? Number(lengthText) : NaN;
  const testPolicy = getPolicyStringLengthCase(query.get('uiTextTestField'), length);

  return testPolicy
    ? POLICIES.map((policy) => (policy.id === testPolicy.id ? testPolicy : policy))
    : POLICIES;
};

const findActivePolicyById = (policyId) =>
  getActivePolicies().find((policy) => policy.id === Number(policyId));

const listPolicies = (params, user) => {
  const { category, sort = 'DEADLINE', onlyEligible, page = 0, size = 8 } = params;
  const subtype = API_TO_UI_CATEGORY[category] ?? category ?? 'ALL';
  let filtered = getActivePolicies().filter(
    (policy) => subtype === 'ALL' || policy.subtype === subtype,
  );

  if (onlyEligible === 'true' || onlyEligible === true) {
    filtered = filtered.filter((policy) => {
      if (!user) {
        return false;
      }
      // 전국 정책은 사는 곳을 가리지 않으니 "나에게 맞는 것만"에서도 늘 남긴다.
      if (policy.regionCode === NATIONWIDE_REGION_CODE) {
        return true;
      }

      const judgements = buildJudgements(policy, user.profile);

      return getRecommendationGroup(judgements) !== RECOMMENDATION_GROUP.IMPOSSIBLE;
    });
  }

  const sorted = sortPolicies(filtered, sort === 'VIEW_COUNT' ? 'VIEWS' : sort);
  const pageNumber = Number(page);
  const pageSize = Number(size);
  const start = pageNumber * pageSize;
  const totalPages = Math.ceil(filtered.length / pageSize);

  return ok({
    isSuccess: true,
    code: 'SUCCESS_001',
    message: '요청에 성공했습니다.',
    result: {
      policies: sorted
        .slice(start, start + pageSize)
        .map((policy) => toApiPolicyListItem(policy, user)),
      page: pageNumber,
      size: pageSize,
      totalElements: sorted.length,
      totalPages,
      hasNext: pageNumber + 1 < totalPages,
    },
  });
};

const buildRecommendations = (query, user) => {
  const keyword = (query ?? '').trim();
  const matchedSubtype = Object.entries(SUBTYPE_NAMES).find(([, name]) =>
    keyword.includes(name.split('·')[0]),
  );
  // notice: 목 전용으로 후보 0건 화면을 확인하려고 둔 검색어다.
  const isNoCandidateCase = keyword.includes('후보0건');
  const candidates = (isNoCandidateCase ? [] : getActivePolicies()).filter((policy) => {
    // 설계서: 다른 지역 전용 정책은 결과에서 제외한다.
    if (policy.regionCode !== NATIONWIDE_REGION_CODE && user?.profile?.regionCode) {
      const isSameSido = policy.regionCode.slice(0, 2) === user.profile.regionCode.slice(0, 2);
      if (!isSameSido) {
        return false;
      }
    }
    if (matchedSubtype) {
      return policy.subtype === matchedSubtype[0];
    }

    return true;
  });

  const groups = {
    [RECOMMENDATION_GROUP.POSSIBLE]: [],
    [RECOMMENDATION_GROUP.NEED_CHECK]: [],
    [RECOMMENDATION_GROUP.IMPOSSIBLE]: [],
  };

  candidates.slice(0, 20).forEach((policy) => {
    const profile = user?.profile ?? {};
    const judgements = buildJudgements(policy, profile);
    const group = getRecommendationGroup(judgements);

    groups[group].push({
      ...toPolicySummary(policy),
      judgements,
      reason: buildJudgementReason(judgements, group),
    });
  });

  return ok({
    query: {
      keyword,
      matchedSubtypeName: matchedSubtype ? SUBTYPE_NAMES[matchedSubtype[0]] : '',
      conditionSummary: user ? buildConditionSummary(user.profile) : '',
    },
    groups,
    isAiFailed: keyword.includes('AI실패'), // notice: 목 전용으로 AI 실패 화면을 확인하는 검색어다.
  });
};

const requireUser = (user) => (user ? null : fail(401, '로그인이 필요한 서비스예요'));

export const HANDLERS = [
  {
    method: 'post',
    match: (url) => url === '/api/members/login',
    handle: ({ body }) => {
      const user = mockStore.getState().users.find((item) => item.email === body.email);

      if (!user || user.password !== body.password) {
        return fail(401, '이메일 또는 비밀번호가 올바르지 않아요');
      }

      return ok({
        accessToken: buildAccessToken(user.id, user.role),
        memberId: user.id,
        nickname: user.nickname,
      });
    },
  },
  {
    method: 'post',
    match: (url) => url === '/api/members/email-verifications',
    handle: ({ body }) => {
      const isDuplicated = mockStore.getState().users.some((item) => item.email === body.email);

      if (isDuplicated) {
        return fail(409, '이미 가입된 이메일이에요');
      }

      mockStore.update((state) => {
        state.emailVerifications ??= {};
        state.emailVerifications[body.email] = {
          code: '384021',
          expiresAt: Date.now() + 5 * 60 * 1000,
          verifiedUntil: null,
        };

        return state;
      });

      return ok({ expiresInSeconds: 300 });
    },
  },
  {
    method: 'post',
    match: (url) => url === '/api/members/email-verifications/confirmation',
    handle: ({ body }) => {
      const verification = mockStore.getState().emailVerifications?.[body.email];

      if (!verification || verification.expiresAt <= Date.now()) {
        return fail(400, '인증 코드가 만료됐어요. 다시 받아 주세요');
      }

      if (verification.code !== body.code) {
        return fail(400, '인증 코드가 올바르지 않아요');
      }

      mockStore.update((state) => {
        state.emailVerifications[body.email] = {
          code: null,
          expiresAt: null,
          verifiedUntil: Date.now() + 30 * 60 * 1000,
        };

        return state;
      });

      return ok({ verified: true });
    },
  },
  {
    method: 'post',
    match: (url) => url === '/api/members',
    handle: ({ body }) => {
      const isDuplicated = mockStore.getState().users.some((item) => item.email === body.email);

      if (isDuplicated) {
        return fail(409, '이미 가입된 이메일이에요');
      }

      const verification = mockStore.getState().emailVerifications?.[body.email];

      if (!verification?.verifiedUntil || verification.verifiedUntil <= Date.now()) {
        return fail(400, '이메일 인증을 먼저 완료해 주세요');
      }

      const created = mockStore.update((state) => {
        const id = state.lastUserId + 1;
        const user = {
          id,
          email: body.email,
          password: body.password,
          nickname: body.nickname,
          role: 'USER',
          joinedAt: new Date().toISOString().slice(0, 10),
          profile: {
            birthDate: body.profile.birth,
            sidoCode: body.profile.regionCode.slice(0, 2),
            regionCode: body.profile.regionCode,
            employmentCode: body.profile.employmentCode,
            houseless: body.profile.houselessYn,
            marriageCode: body.profile.marriageCode ?? '',
            incomeRange: body.profile.incomeRangeCode ?? '',
            educationCode: body.profile.educationCode ?? '',
            housingType: body.profile.housingType ?? '',
          },
        };

        state.users.push(user);
        state.favorites[id] = [];
        state.notifications[id] = [];
        delete state.emailVerifications[body.email];
        state.lastUserId = id;

        return state;
      });

      const user = created.users.at(-1);

      // 설계서 F-01: 가입하면 자동 로그인 후 조건 등록으로 이어진다.
      return ok({
        accessToken: buildAccessToken(user.id, user.role),
        refreshToken: `mock-refresh-token-${user.id}`,
        user: toPublicUser(user),
      });
    },
  },
  { method: 'post', match: (url) => url === '/api/members/logout', handle: () => ok({}) },
  {
    method: 'post',
    match: (url) => url === '/api/auth/find-email',
    handle: ({ body }) => {
      const user = mockStore.getState().users.find((item) => item.nickname === body.nickname);

      return user ? ok({ email: user.email }) : fail(404, '일치하는 회원을 찾지 못했어요');
    },
  },
  {
    method: 'post',
    match: (url) => url === '/api/auth/reset-password',
    handle: () => ok({ message: '임시 비밀번호를 이메일로 보냈어요' }),
  },
  {
    method: 'get',
    match: (url) => url === '/api/members/me',
    handle: ({ user }) => requireUser(user) ?? ok(toPublicUser(user)),
  },
  {
    method: 'patch',
    match: (url) => url === '/api/members/me/delete',
    handle: ({ user }) => {
      const denied = requireUser(user);
      if (denied) {
        return denied;
      }

      mockStore.update((state) => {
        state.users = state.users.filter((item) => item.id !== user.id);
        delete state.favorites[user.id];
        delete state.notifications[user.id];

        return state;
      });

      return ok({});
    },
  },
  {
    method: 'get',
    match: (url) => url === '/api/members/me/profile',
    handle: ({ user }) => requireUser(user) ?? ok(user.profile ?? {}),
  },
  {
    method: 'patch',
    match: (url) => url === '/api/members/me/profile',
    handle: ({ user, body }) => {
      const denied = requireUser(user);
      if (denied) {
        return denied;
      }

      mockStore.update((state) => {
        const target = state.users.find((item) => item.id === user.id);
        target.profile = { ...target.profile, ...body };

        return state;
      });

      return ok(body);
    },
  },
  {
    method: 'get',
    match: (url) => url === '/api/regions',
    handle: () => ok(buildRegionListResponse()),
  },
  {
    method: 'get',
    match: (url) => url === '/api/policies/card-news',
    handle: () => {
      const featured = sortPolicies(getActivePolicies(), 'DEADLINE').slice(0, 4);

      return ok({ content: featured.map(buildCardNews) });
    },
  },
  {
    method: 'get',
    match: (url) => url === '/api/policies/housing',
    handle: ({ params }) => listPolicies(params, null),
  },
  {
    method: 'get',
    match: (url) => url === '/api/policies/housing/me',
    handle: ({ params, user }) => requireUser(user) ?? listPolicies(params, user),
  },
  {
    method: 'get',
    match: (url) => /^\/api\/policies\/[^/]+$/.test(url),
    handle: ({ url, user }) => {
      const policy = findActivePolicyById(url.split('/').at(-1));

      if (!policy) {
        return fail(404, '요청한 정보를 찾을 수 없어요');
      }

      const judgements = user ? buildJudgements(policy, user.profile ?? {}) : [];
      const group = judgements.length ? getRecommendationGroup(judgements) : null;
      const resultStatus = {
        [JUDGE_RESULT.MET]: 'ABLE',
        [JUDGE_RESULT.NOT_MET]: 'DISABLE',
        [JUDGE_RESULT.NEED_CHECK]: 'UNKNOWN',
      };
      const conditions = judgements.length
        ? judgements.map((judgement) => ({
            type: judgement.conditionKey,
            status: resultStatus[judgement.result],
            policyCondition: judgement.requirement,
            memberValue: judgement.myValue,
          }))
        : buildRawConditions(policy).map((condition) => ({
            type: condition.key,
            status: 'UNKNOWN',
            policyCondition: condition.value,
            memberValue: '',
          }));
      const overallStatus =
        group === RECOMMENDATION_GROUP.POSSIBLE
          ? 'ABLE'
          : group === RECOMMENDATION_GROUP.IMPOSSIBLE
            ? 'DISABLE'
            : 'UNKNOWN';

      return ok({
        isSuccess: true,
        code: 'SUCCESS_001',
        message: '요청에 성공했습니다.',
        result: {
          policyId: String(policy.id),
          policyName: policy.title,
          categories: [policy.subtype],
          categoryLabels: [findSubtypeName(policy.subtype)],
          apiSubCategory: findSubtypeName(policy.subtype),
          keywords: '',
          description: policy.description,
          supportContent: policy.benefit,
          extraQualification: policy.requirement?.extraQualification ?? '',
          applyPeriod:
            policy.applyPeriodType === APPLY_PERIOD_TYPE.ALWAYS ? 'ALWAYS' : 'SPECIFIC_PERIOD',
          applyPeriodLabel:
            policy.applyPeriodType === APPLY_PERIOD_TYPE.ALWAYS ? '상시' : '특정기간',
          applyStartDate: policy.applyStartDate,
          applyEndDate: policy.applyEndDate,
          applyMethod: policy.applyMethod,
          applyUrl: policy.applyUrl,
          refUrl: policy.applyUrl,
          activeYn: true,
          isFavorite: Boolean(
            user && getFavorites(user.id).some((favorite) => favorite.policyId === policy.id),
          ),
          overallStatus,
          conditions,
        },
      });
    },
  },
  {
    method: 'post',
    match: (url) => url === '/api/recommendations',
    handle: ({ body, user }) => buildRecommendations(body?.query, user),
  },
  { method: 'get', match: (url) => url === '/api/terms', handle: () => ok({ content: TERMS }) },
  {
    method: 'get',
    match: (url) => url === '/api/favorite',
    handle: ({ user }) => {
      const denied = requireUser(user);
      if (denied) {
        return denied;
      }

      const content = getFavorites(user.id)
        .map((favorite) => {
          const policy = findActivePolicyById(favorite.policyId);

          return policy ? { ...favorite, policy: toPolicySummary(policy) } : null;
        })
        .filter(Boolean);

      return ok({ content });
    },
  },
  {
    method: 'post',
    match: (url) => /^\/api\/favorite\/[^/]+$/.test(url),
    handle: ({ url, user }) => {
      const denied = requireUser(user);
      if (denied) {
        return denied;
      }

      const policyId = Number(url.split('/').at(-1));

      mockStore.update((state) => {
        const favorites = state.favorites[user.id] ?? [];

        if (!favorites.some((item) => item.policyId === policyId)) {
          favorites.unshift({
            policyId,
            status: FAVORITE_STATUS.INTEREST,
            savedAt: new Date().toISOString().slice(0, 10),
          });
        }
        state.favorites[user.id] = favorites;

        return state;
      });

      return ok({});
    },
  },
  {
    method: 'delete',
    match: (url) => /^\/api\/favorite\/[^/]+$/.test(url),
    handle: ({ url, user }) => {
      const denied = requireUser(user);
      if (denied) {
        return denied;
      }

      const policyId = Number(url.split('/').at(-1));

      mockStore.update((state) => {
        state.favorites[user.id] = (state.favorites[user.id] ?? []).filter(
          (item) => item.policyId !== policyId,
        );

        return state;
      });

      return ok({});
    },
  },
  {
    method: 'get',
    match: (url) => url === '/api/notification',
    handle: ({ params, user }) => {
      const denied = requireUser(user);
      if (denied) {
        return denied;
      }

      const page = Math.max(Number(params.page ?? 0), 0);
      const size = Math.max(Number(params.size ?? 8), 1);
      const notifications = getNotifications(user.id);
      const totalPages = Math.ceil(notifications.length / size);
      const pageNotifications = notifications.slice(page * size, (page + 1) * size);
      const items = pageNotifications.map((notification) => {
        const policy = findActivePolicyById(notification.policyId);

        return {
          notification_id: notification.id,
          member_id: user.id,
          policy_id: String(notification.policyId),
          policy_name: policy?.title ?? notification.body,
          content: notification.title,
          read_yn: notification.isRead,
          apply_end_date: policy?.applyEndDate ?? null,
          created_at: notification.createdAt,
        };
      });

      return ok({
        isSuccess: true,
        code: 'SUCCESS_001',
        message: '성공입니다.',
        result: {
          notifications: items,
          page,
          size,
          totalElements: notifications.length,
          totalPages,
          hasNext: page + 1 < totalPages,
        },
      });
    },
  },
  {
    method: 'patch',
    match: (url) => /^\/api\/notification\/\d+\/read$/.test(url),
    handle: ({ url, user }) => {
      const denied = requireUser(user);
      if (denied) {
        return denied;
      }

      const notificationId = Number(url.split('/').at(-2));
      let updatedNotification;

      mockStore.update((state) => {
        const notification = state.notifications[user.id]?.find(
          (item) => item.id === notificationId,
        );
        if (notification) {
          notification.isRead = true;
          updatedNotification = { ...notification };
        }

        return state;
      });

      const policy = findActivePolicyById(updatedNotification?.policyId);

      return ok({
        isSuccess: true,
        code: 'SUCCESS_001',
        message: '성공입니다.',
        result: updatedNotification
          ? {
              notification_id: updatedNotification.id,
              member_id: user.id,
              policy_id: String(updatedNotification.policyId),
              policy_name: policy?.title ?? updatedNotification.body,
              content: updatedNotification.title,
              read_yn: true,
              apply_end_date: policy?.applyEndDate ?? null,
              created_at: updatedNotification.createdAt,
            }
          : null,
      });
    },
  },
  {
    method: 'delete',
    match: (url) => /^\/api\/notification\/\d+$/.test(url),
    handle: ({ url, user }) => {
      const denied = requireUser(user);
      if (denied) {
        return denied;
      }

      const notificationId = Number(url.split('/').at(-1));

      mockStore.update((state) => {
        state.notifications[user.id] = getNotifications(user.id).filter(
          (item) => item.id !== notificationId,
        );

        return state;
      });

      return ok({});
    },
  },
  {
    method: 'post',
    match: (url) => url === '/api/admin/collect',
    handle: ({ user }) => {
      const denied = requireUser(user);
      if (denied) {
        return denied;
      }
      if (user.role !== 'ADMIN') {
        return fail(403, '접근 권한이 없어요');
      }

      const startedAt = new Date();
      const finishedAt = new Date(startedAt.getTime() + 105000);
      const collectLog = {
        status: 'SUCCESS',
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        fetchedCount: 142,
        newCount: 3,
        updatedCount: 5,
        closedCount: 2,
      };

      mockStore.update((state) => {
        state.collectLog = collectLog;

        return state;
      });

      return ok(collectLog);
    },
  },
  {
    method: 'get',
    match: (url) => url === '/api/admin/collect/status',
    handle: () => ok(mockStore.getState().collectLog),
  },
];

export const findHandler = (method, url) =>
  HANDLERS.find((handler) => handler.method === method && handler.match(url));

export { findUserByToken };
