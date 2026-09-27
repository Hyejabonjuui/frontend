import { screen } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';
import { buildMyPagePath, MY_PAGE_TABS } from '@/constants/routes';

import { renderApp, signInAs } from '../../helpers/renderApp';
import { MEMBER_ACCOUNT_RESPONSE, TOKENS } from '../../msw/fixtures';
import { apiUrl, ok } from '../../msw/respond';
import { server } from '../../msw/server';

describe('회원 계정 조회', () => {
  it('Bearer 토큰으로 계정을 조회하고 마이페이지에 회원 정보를 표시한다', async () => {
    let requestInfo;
    server.use(
      http.get(apiUrl(ENDPOINTS.USER.ME), ({ request }) => {
        const url = new URL(request.url);
        requestInfo = {
          authorization: request.headers.get('Authorization'),
          memberId: url.searchParams.get('memberId'),
        };

        return ok(MEMBER_ACCOUNT_RESPONSE);
      }),
    );
    signInAs(TOKENS.MEMBER);
    renderApp(buildMyPagePath(MY_PAGE_TABS.ACCOUNT));

    expect(await screen.findByText(MEMBER_ACCOUNT_RESPONSE.result.email)).toBeInTheDocument();
    expect(screen.getAllByText(MEMBER_ACCOUNT_RESPONSE.result.nickname).length).toBeGreaterThan(0);
    expect(
      screen.getByText(MEMBER_ACCOUNT_RESPONSE.result.createdAt.slice(0, 10)),
    ).toBeInTheDocument();
    expect(requestInfo).toEqual({
      authorization: `Bearer ${TOKENS.MEMBER}`,
      memberId: null,
    });
  });
});
