import { screen, within } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';

import { renderApp, signInAs } from '../../helpers/renderApp';
import {
  CARD_NEWS_LIST_RESPONSE,
  POLICY,
  TOKENS,
  buildCardNewsDetailResponse,
} from '../../msw/fixtures';
import { apiUrl, ok } from '../../msw/respond';
import { server } from '../../msw/server';

describe('홈 카드뉴스', () => {
  it('비로그인은 guest 목록을 호출하고 선택한 정책의 카드 상세를 팝업에 표시한다', async () => {
    const requests = [];

    server.use(
      http.get(apiUrl(ENDPOINTS.POLICY.GUEST_CARD_NEWS), ({ request }) => {
        requests.push({
          path: new URL(request.url).pathname,
          authorization: request.headers.get('Authorization'),
        });
        return ok(CARD_NEWS_LIST_RESPONSE);
      }),
      http.get(apiUrl(ENDPOINTS.POLICY.CARD_NEWS_DETAIL(':policyId')), ({ params }) => {
        requests.push({ path: ENDPOINTS.POLICY.CARD_NEWS_DETAIL(params.policyId) });
        return ok(buildCardNewsDetailResponse(POLICY));
      }),
    );
    const { user } = renderApp('/home');

    const cardTitle = await screen.findByRole('heading', { name: POLICY.title, level: 1 });
    await user.click(cardTitle);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByText(POLICY.title)).toHaveLength(2);
    expect(within(dialog).getByText('1 / 4 · 무슨 정책인가요')).toBeInTheDocument();
    expect(requests).toEqual([
      { path: ENDPOINTS.POLICY.GUEST_CARD_NEWS, authorization: null },
      { path: ENDPOINTS.POLICY.CARD_NEWS_DETAIL(String(POLICY.id)) },
    ]);
  });

  it('카드가 1장만 오면 나머지 장은 번호만 보이는 빈 카드로 채운다', async () => {
    const detailResponse = buildCardNewsDetailResponse(POLICY);

    server.use(
      http.get(apiUrl(ENDPOINTS.POLICY.CARD_NEWS_DETAIL(':policyId')), () =>
        ok({
          ...detailResponse,
          result: { ...detailResponse.result, cards: detailResponse.result.cards.slice(0, 1) },
        }),
      ),
    );
    const { user } = renderApp('/home');

    await user.click(await screen.findByRole('heading', { name: POLICY.title, level: 1 }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('1 / 4 · 무슨 정책인가요')).toBeInTheDocument();
    for (const counter of ['2 / 4', '3 / 4', '4 / 4']) {
      expect(within(dialog).getByText(counter)).toBeInTheDocument();
    }
    expect(within(dialog).queryByText(/누가 받을 수 있나요/)).not.toBeInTheDocument();
  });

  it('로그인은 토큰으로 회원 카드뉴스 목록을 호출한다', async () => {
    let authorization;

    server.use(
      http.get(apiUrl(ENDPOINTS.POLICY.CARD_NEWS), ({ request }) => {
        authorization = request.headers.get('Authorization');
        return ok(CARD_NEWS_LIST_RESPONSE);
      }),
    );
    signInAs(TOKENS.MEMBER);
    renderApp('/home');

    expect(
      await screen.findByRole('heading', { name: POLICY.title, level: 1 }),
    ).toBeInTheDocument();
    expect(authorization).toBe(`Bearer ${TOKENS.MEMBER}`);
  });
});
