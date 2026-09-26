/**
 * I-9 홈 정책 목록의 에러·빈 상태 (S-01)
 *
 * notice: 실제 백엔드 없이 MSW가 정책 목록에 응답한다. 500·빈 배열은 server.use로 만든다.
 */
import { screen } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';
import { EMPTY_MESSAGES, ERROR_MESSAGES } from '@/constants/messages';

import { renderApp } from '../../helpers/renderApp';
import { EMPTY_POLICY_PAGE, POLICY_PAGE } from '../../msw/fixtures';
import { apiUrl, fail, ok } from '../../msw/respond';
import { server } from '../../msw/server';

describe('홈 정책 목록', () => {
  it('정책을 받으면 목록과 건수를 보여 준다', async () => {
    renderApp('/');

    expect(await screen.findByText(`신청 중 ${POLICY_PAGE.totalCount}건`)).toBeInTheDocument();
    POLICY_PAGE.content.forEach((policy) => {
      expect(screen.getAllByText(policy.title).length).toBeGreaterThan(0);
    });
  });

  it('서버 오류면 오류 상태와 토스트를 보여 주고, 다시 시도하면 목록을 불러온다', async () => {
    server.use(http.get(apiUrl(ENDPOINTS.POLICY.LIST), () => fail(500), { once: true }));
    const { user } = renderApp('/');

    expect(await screen.findByText(ERROR_MESSAGES.SERVER)).toBeInTheDocument();
    expect(screen.getByText(ERROR_MESSAGES.POLICY_LOAD_FAILED)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await screen.findByText(`신청 중 ${POLICY_PAGE.totalCount}건`)).toBeInTheDocument();
  });

  it('정책이 없으면 빈 상태를 보여 준다', async () => {
    server.use(http.get(apiUrl(ENDPOINTS.POLICY.LIST), () => ok(EMPTY_POLICY_PAGE)));
    renderApp('/');

    expect(await screen.findByText(EMPTY_MESSAGES.POLICY_LIST)).toBeInTheDocument();
    expect(screen.getByText('신청 중 0건')).toBeInTheDocument();
  });
});
