/**
 * I-7 추천 결과 (S-05)
 *
 * notice: 실제 백엔드(AI 판정) 없이 MSW가 추천 응답을 준다. 그룹 구성과 isAiFailed는 fixtures의 고정값이다.
 *         AI 응답 형태(groups, isAiFailed, query)는 프론트 가정값이라, 명세가 확정되면
 *         fixtures.RECOMMENDATIONS부터 맞추고 이 테스트는 그대로 둔다.
 */
import { screen } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';
import { EMPTY_MESSAGES, ERROR_MESSAGES, TOAST_MESSAGES } from '@/constants/messages';
import { RECOMMENDATION_GROUP, RECOMMENDATION_GROUP_LABEL } from '@/constants/policy';

import { renderApp, signInAs } from '../../helpers/renderApp';
import { EMPTY_RECOMMENDATIONS, RECOMMENDATIONS, TOKENS } from '../../msw/fixtures';
import { apiUrl, fail, ok } from '../../msw/respond';
import { server } from '../../msw/server';

const RESULT_PATH = `/recommendations?keyword=${encodeURIComponent('월세')}`;
const LOADING_TEXT = 'AI가 내 조건으로 정책을 확인하고 있어요';

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
      const [policy] = RECOMMENDATIONS.groups[group];

      expect(await groupHeading(group, 1)).toBeInTheDocument();
      expect(screen.getByText(policy.title)).toBeInTheDocument();
      expect(screen.getByText(policy.reason)).toBeInTheDocument();
    }
  });

  it('AI 설명을 못 받으면 판정 결과와 함께 안내를 보여 준다', async () => {
    server.use(
      http.post(apiUrl(ENDPOINTS.POLICY.RECOMMENDATIONS), () =>
        ok({ ...RECOMMENDATIONS, isAiFailed: true }),
      ),
    );
    signInAs(TOKENS.MEMBER);
    renderApp(RESULT_PATH);

    expect(await screen.findByText(TOAST_MESSAGES.AI_FAILED)).toBeInTheDocument();
    expect(await groupHeading(RECOMMENDATION_GROUP.POSSIBLE, 1)).toBeInTheDocument();
  });

  it('후보가 0건이면 빈 상태와 안내 토스트를 보여 준다', async () => {
    server.use(
      http.post(apiUrl(ENDPOINTS.POLICY.RECOMMENDATIONS), () => ok(EMPTY_RECOMMENDATIONS)),
    );
    signInAs(TOKENS.MEMBER);
    renderApp(RESULT_PATH);

    expect(await screen.findByText(EMPTY_MESSAGES.RECOMMENDATION)).toBeInTheDocument();
    expect(screen.getByText(TOAST_MESSAGES.NO_CANDIDATE)).toBeInTheDocument();
  });

  it('서버 오류면 오류 상태를 보여 주고 다시 시도하면 결과를 불러온다', async () => {
    server.use(
      http.post(apiUrl(ENDPOINTS.POLICY.RECOMMENDATIONS), () => fail(500), { once: true }),
    );
    signInAs(TOKENS.MEMBER);
    const { user } = renderApp(RESULT_PATH);

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGES.SERVER);

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await groupHeading(RECOMMENDATION_GROUP.POSSIBLE, 1)).toBeInTheDocument();
  });
});
