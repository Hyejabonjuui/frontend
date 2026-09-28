/**
 * I-7 추천 결과 (S-05)
 *
 * notice: 실제 백엔드(AI 판정) 없이 MSW가 GET /api/policies/search 응답을 준다. 그룹 구성은 fixtures의 고정값이다.
 *         응답 형태(approved · underReview · declined)는 백엔드 PolicySearchResponseDTO를 따른다.
 *         DTO가 바뀌면 fixtures.POLICY_SEARCH_RESULT와 policyApi.toPolicySearchResult부터 맞춘다.
 */
import { screen, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';
import { EMPTY_MESSAGES, ERROR_MESSAGES, TOAST_MESSAGES } from '@/constants/messages';
import { RECOMMENDATION_GROUP, RECOMMENDATION_GROUP_LABEL } from '@/constants/policy';

import { renderApp, signInAs } from '../../helpers/renderApp';
import { EMPTY_POLICY_SEARCH_RESULT, POLICY_SEARCH_RESULT, TOKENS } from '../../msw/fixtures';
import { apiUrl, fail, ok } from '../../msw/respond';
import { server } from '../../msw/server';

const RESULT_PATH = `/search?query=${encodeURIComponent('월세')}`;
const LOADING_TEXT = 'AI가 내 조건으로 정책을 확인하고 있어요';

const SEARCH_RESULT_KEYS = {
  [RECOMMENDATION_GROUP.POSSIBLE]: 'approved',
  [RECOMMENDATION_GROUP.NEED_CHECK]: 'underReview',
  [RECOMMENDATION_GROUP.IMPOSSIBLE]: 'declined',
};

const groupHeading = (group, count) =>
  screen.findByRole('heading', { name: `${RECOMMENDATION_GROUP_LABEL[group]} · ${count}건` });

describe('추천 결과', () => {
  it('응답을 기다리는 동안 결과 모양의 스켈레톤을 보여 준다', async () => {
    signInAs(TOKENS.MEMBER);
    renderApp(RESULT_PATH);

    expect(await screen.findByText(LOADING_TEXT)).toBeInTheDocument();
    expect(await groupHeading(RECOMMENDATION_GROUP.POSSIBLE, 1)).toBeInTheDocument();
    expect(screen.queryByText(LOADING_TEXT)).not.toBeInTheDocument();
  });

  it('가능 · 확인 필요 · 불가 그룹으로 나눠 정책을 보여 준다', async () => {
    signInAs(TOKENS.MEMBER);
    renderApp(RESULT_PATH);

    for (const group of Object.values(RECOMMENDATION_GROUP)) {
      const [policy] = POLICY_SEARCH_RESULT.result[SEARCH_RESULT_KEYS[group]];

      expect(await groupHeading(group, 1)).toBeInTheDocument();
      expect(screen.getByText(policy.policyName)).toBeInTheDocument();
      expect(screen.getByText(policy.aiReason)).toBeInTheDocument();
    }
  });

  it('후보가 0건이면 빈 상태와 안내 토스트를 보여 준다', async () => {
    server.use(http.get(apiUrl(ENDPOINTS.POLICY.SEARCH), () => ok(EMPTY_POLICY_SEARCH_RESULT)));
    signInAs(TOKENS.MEMBER);
    renderApp(RESULT_PATH);

    expect(await screen.findByText(EMPTY_MESSAGES.SEARCH)).toBeInTheDocument();
    expect(await screen.findByText(TOAST_MESSAGES.NO_CANDIDATE)).toBeInTheDocument();
  });

  it('0건 뒤 다시 검색해도 0건이면 안내 토스트를 다시 보여 준다', async () => {
    const requestedQueries = [];
    server.use(
      http.get(apiUrl(ENDPOINTS.POLICY.SEARCH), ({ request }) => {
        requestedQueries.push(new URL(request.url).searchParams.get('query'));

        return ok(EMPTY_POLICY_SEARCH_RESULT);
      }),
    );
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(RESULT_PATH);

    expect(await screen.findByText(TOAST_MESSAGES.NO_CANDIDATE)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByText(TOAST_MESSAGES.NO_CANDIDATE)).not.toBeInTheDocument(),
    );

    const searchInput = screen.getByRole('textbox', { name: '정책 검색' });
    await user.clear(searchInput);
    await user.type(searchInput, '전세');
    await user.click(screen.getByRole('button', { name: '검색', exact: true }));

    await waitFor(() => expect(requestedQueries).toEqual(['월세', '전세']));
    expect(await screen.findByText(TOAST_MESSAGES.NO_CANDIDATE)).toBeInTheDocument();
  });

  it('해시태그를 누르면 검색창과 검색어 모두 #을 붙인 해시태그로 검색한다', async () => {
    const requestedQueries = [];
    server.use(
      http.get(apiUrl(ENDPOINTS.POLICY.SEARCH), ({ request }) => {
        requestedQueries.push(new URL(request.url).searchParams.get('query'));

        return ok(POLICY_SEARCH_RESULT);
      }),
    );
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(RESULT_PATH);

    expect(await groupHeading(RECOMMENDATION_GROUP.POSSIBLE, 1)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '#월세' }));

    expect(screen.getByRole('textbox', { name: '정책 검색' })).toHaveValue('#월세');
    await waitFor(() => expect(requestedQueries).toEqual(['월세', '#월세']));
  });

  it('홈에서 해시태그를 누르면 #이 빠지지 않은 검색어로 검색 화면에서 검색한다', async () => {
    const requestedQueries = [];
    server.use(
      http.get(apiUrl(ENDPOINTS.POLICY.SEARCH), ({ request }) => {
        requestedQueries.push(new URL(request.url).searchParams.get('query'));

        return ok(POLICY_SEARCH_RESULT);
      }),
    );
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp('/home');

    const homeSearchInput = await screen.findByRole('textbox', { name: '정책 검색' });
    await waitFor(() => expect(homeSearchInput).not.toHaveAttribute('readonly'));
    await user.click(screen.getByRole('button', { name: '#월세' }));

    expect(await groupHeading(RECOMMENDATION_GROUP.POSSIBLE, 1)).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get('query')).toBe('#월세');
    expect(screen.getByRole('textbox', { name: '정책 검색' })).toHaveValue('#월세');
    expect(requestedQueries).toEqual(['#월세']);
  });

  it('같은 검색어로 다시 검색하면 요청 없이 안내 토스트를 보여 준다', async () => {
    const requestedQueries = [];
    server.use(
      http.get(apiUrl(ENDPOINTS.POLICY.SEARCH), ({ request }) => {
        requestedQueries.push(new URL(request.url).searchParams.get('query'));

        return ok(POLICY_SEARCH_RESULT);
      }),
    );
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(RESULT_PATH);

    expect(await groupHeading(RECOMMENDATION_GROUP.POSSIBLE, 1)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '검색', exact: true }));

    expect(await screen.findByText('월세로 검색했어요')).toBeInTheDocument();
    expect(requestedQueries).toEqual(['월세']);
  });

  it('같은 검색어가 실패했었다면 다시 검색할 때 재요청한다', async () => {
    server.use(http.get(apiUrl(ENDPOINTS.POLICY.SEARCH), () => fail(500), { once: true }));
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(RESULT_PATH);

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGES.SERVER);

    await user.click(screen.getByRole('button', { name: '검색', exact: true }));

    expect(await groupHeading(RECOMMENDATION_GROUP.POSSIBLE, 1)).toBeInTheDocument();
    expect(screen.queryByText('월세로 검색했어요')).not.toBeInTheDocument();
  });

  it('서버 오류면 오류 상태를 보여 주고 다시 시도하면 결과를 불러온다', async () => {
    server.use(http.get(apiUrl(ENDPOINTS.POLICY.SEARCH), () => fail(500), { once: true }));
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(RESULT_PATH);

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGES.SERVER);

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await groupHeading(RECOMMENDATION_GROUP.POSSIBLE, 1)).toBeInTheDocument();
  });
});
