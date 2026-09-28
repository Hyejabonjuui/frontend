/**
 * I-8 관심 정책 (S-07 관심 저장, S-14 관심 목록)
 *
 * notice: 실제 백엔드 없이 MSW가 관심 목록·저장·해제와 정책 상세에 응답한다.
 *         저장 후 목록이 바뀌는 흐름은 테스트 안의 favoriteIds 배열로 서버 상태를 흉내 내고,
 *         상세 응답의 isFavorite도 같은 배열로 만든다.
 * notice: 중복 저장(409 FAVORITE_001)·없는 관심 해제(404 FAVORITE_002) 코드는 백엔드 ErrorStatus 기준이다.
 */
import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';
import { ERROR_MESSAGES, TOAST_MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { POLICIES } from '@/mocks/data/policies';

import { renderApp, signInAs } from '../../helpers/renderApp';
import {
  FAVORITE_POLICY,
  MEMBER_CREDENTIALS,
  POLICY,
  TOKENS,
  buildPolicyDetail,
  toPolicySummary,
} from '../../msw/fixtures';
import { apiUrl, fail, ok } from '../../msw/respond';
import { server } from '../../msw/server';

const DETAIL_PATH = `/policies/${POLICY.id}`;

let favoriteIds;
let requests;

const toBackendFavorite = (policyId) => {
  const policy = POLICIES.find((item) => item.id === policyId);

  return {
    favorite_id: policyId + 100,
    policy_id: policyId,
    policy_name: policy.title,
    category_codes: [policy.subtype],
    category_names: [toPolicySummary(policy).subtypeName],
    support_content: policy.summary,
    apply_end_date: policy.applyEndDate,
    apply_period_code: policy.applyPeriodType,
    apply_url: policy.applyUrl,
    created_at: '2026-09-26T10:30:00',
  };
};

/** 저장·해제 요청을 기록하고, 관심 목록 응답에 바로 반영하는 가짜 서버 상태 */
const mockFavoriteServer = () => {
  const verifyTokenRequest = (request) => {
    expect(request.headers.get('Authorization')).toBe(`Bearer ${TOKENS.MEMBER}`);
    expect(new URL(request.url).searchParams.has('memberId')).toBe(false);
  };

  server.use(
    http.get(apiUrl(ENDPOINTS.POLICY.DETAIL(':policyId')), ({ params, request }) => {
      const policy = POLICIES.find((item) => item.id === Number(params.policyId));
      const isAuthenticated = request.headers.has('Authorization');

      return ok({
        isSuccess: true,
        result: buildPolicyDetail(policy, {
          isAuthenticated,
          isFavorite: favoriteIds.includes(policy.id),
        }),
      });
    }),
    http.get(apiUrl(ENDPOINTS.FAVORITE.LIST), ({ request }) => {
      verifyTokenRequest(request);
      return ok({
        isSuccess: true,
        code: 'SUCCESS_001',
        message: '성공입니다.',
        result: {
          favorites: favoriteIds.map(toBackendFavorite),
          page: 0,
          size: 8,
          totalElements: favoriteIds.length,
          totalPages: favoriteIds.length ? 1 : 0,
          hasNext: false,
        },
      });
    }),
    http.post(apiUrl(ENDPOINTS.FAVORITE.DETAIL(':policyId')), ({ params, request }) => {
      verifyTokenRequest(request);
      requests.push(`POST ${params.policyId}`);
      favoriteIds = [...favoriteIds, Number(params.policyId)];
      return ok();
    }),
    http.delete(apiUrl(ENDPOINTS.FAVORITE.DETAIL(':policyId')), ({ params, request }) => {
      verifyTokenRequest(request);
      requests.push(`DELETE ${params.policyId}`);
      favoriteIds = favoriteIds.filter((policyId) => policyId !== Number(params.policyId));
      return ok();
    }),
  );
};

beforeEach(() => {
  favoriteIds = [];
  requests = [];
  mockFavoriteServer();
});

describe('관심 정책 저장·해제', () => {
  it('관심 저장을 누르면 저장하고, 다시 누르면 해제한다', async () => {
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(DETAIL_PATH);

    await user.click(await screen.findByRole('button', { name: '관심 저장' }, { timeout: 5000 }));

    expect(await screen.findByRole('button', { name: '관심 해제' })).toBeInTheDocument();
    expect(screen.getByText(TOAST_MESSAGES.FAVORITE_ADDED)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '관심 해제' }));

    expect(await screen.findByRole('button', { name: '관심 저장' })).toBeInTheDocument();
    expect(requests).toEqual([`POST ${POLICY.id}`, `DELETE ${POLICY.id}`]);
  });

  it('비로그인이면 로그인을 요구하고, 로그인하면 누르려던 저장을 이어서 한다', async () => {
    const { user } = renderApp(DETAIL_PATH);

    await user.click(await screen.findByRole('button', { name: '관심 저장' }));

    expect(screen.getByText(TOAST_MESSAGES.LOGIN_REQUIRED)).toBeInTheDocument();
    expect(requests).toEqual([]);

    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('이메일'), MEMBER_CREDENTIALS.email);
    await user.type(within(dialog).getByLabelText('비밀번호'), MEMBER_CREDENTIALS.password);
    await user.click(within(dialog).getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(requests).toEqual([`POST ${POLICY.id}`]));
    expect(await screen.findByRole('button', { name: '관심 해제' })).toBeInTheDocument();
  });
});

describe('관심 정책 하트 상태', () => {
  it('관심 목록 첫 페이지에 없는 관심 정책도 상세 응답 기준으로 채운 하트를 보여 주고, 누르면 해제한다', async () => {
    favoriteIds = [POLICY.id];
    // 관심 목록 첫 페이지에는 다른 정책만 있다. 하트는 이 목록을 보지 않아야 한다.
    server.use(
      http.get(apiUrl(ENDPOINTS.FAVORITE.LIST), () =>
        ok({
          isSuccess: true,
          result: {
            favorites: [toBackendFavorite(FAVORITE_POLICY.id)],
            page: 0,
            size: 8,
            totalElements: 9,
            totalPages: 2,
            hasNext: true,
          },
        }),
      ),
    );
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(DETAIL_PATH);

    await user.click(await screen.findByRole('button', { name: '관심 해제' }, { timeout: 5000 }));

    expect(await screen.findByRole('button', { name: '관심 저장' })).toBeInTheDocument();
    expect(requests).toEqual([`DELETE ${POLICY.id}`]);
  });

  it('이미 저장된 정책이라 409가 오면 오류 대신 저장된 하트로 맞춘다', async () => {
    server.use(
      http.post(apiUrl(ENDPOINTS.FAVORITE.DETAIL(':policyId')), () =>
        HttpResponse.json(
          { isSuccess: false, code: 'FAVORITE_001', message: '이미 등록된 관심 정책입니다.' },
          { status: 409 },
        ),
      ),
    );
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(DETAIL_PATH);

    await user.click(await screen.findByRole('button', { name: '관심 저장' }, { timeout: 5000 }));

    expect(await screen.findByRole('button', { name: '관심 해제' })).toBeInTheDocument();
    expect(screen.queryByText('이미 등록된 관심 정책입니다.')).not.toBeInTheDocument();
  });
});

describe('관심 목록', () => {
  it('목록을 못 불러오면 오류 상태를 보여 주고, 다시 시도하면 목록을 보여 준다', async () => {
    favoriteIds = [FAVORITE_POLICY.id];
    server.use(http.get(apiUrl(ENDPOINTS.FAVORITE.LIST), () => fail(500), { once: true }));
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(ROUTES.FAVORITE);

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGES.SERVER);

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await screen.findByText(FAVORITE_POLICY.title)).toBeInTheDocument();
  });

  it('목록에서 해제하면 목록에서 빠진다', async () => {
    favoriteIds = [FAVORITE_POLICY.id];
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(ROUTES.FAVORITE);

    await screen.findByText(FAVORITE_POLICY.title);
    await user.click(screen.getByRole('button', { name: '관심 정책 해제' }));

    await waitFor(() => expect(screen.queryByText(FAVORITE_POLICY.title)).not.toBeInTheDocument());
    expect(requests).toEqual([`DELETE ${FAVORITE_POLICY.id}`]);
  });
});
