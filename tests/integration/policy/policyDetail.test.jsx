/**
 * I-6 정책 상세 분기 (S-07)
 *
 * notice: 실제 백엔드 없이 MSW가 정책 상세에 응답한다. 판정 결과(judgements)는 fixtures의 고정값이다.
 *         실제 판정은 백엔드 몫이라, 여기서는 "비로그인이면 원문 조건, 로그인이면 판정 카드"라는
 *         화면 분기만 본다. 판정 규칙 자체의 테스트는 백엔드 저장소에서 한다.
 */
import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JUDGE_RESULT, JUDGE_RESULT_LABEL } from '@/constants/policy';

import { renderApp, signInAs } from '../../helpers/renderApp';
import { MEMBER_CREDENTIALS, POLICY, RAW_CONDITIONS, TOKENS } from '../../msw/fixtures';

const DETAIL_PATH = `/policies/${POLICY.id}`;
const RAW_CARD_TITLE = '신청 조건 (공고 원문)';
const JUDGEMENT_CARD_TITLE = '내 조건으로 확인해 봤어요';

const findPolicyTitle = () => screen.findByRole('heading', { name: POLICY.title });

describe('정책 상세 분기', () => {
  it('비로그인이면 공고 원문 조건 카드를 보여 주고 판정 아이콘은 없다', async () => {
    renderApp(DETAIL_PATH);
    await findPolicyTitle();

    expect(screen.getByText(RAW_CARD_TITLE)).toBeInTheDocument();
    RAW_CONDITIONS.forEach((condition) => {
      expect(screen.getByText(condition.value)).toBeInTheDocument();
    });
    expect(screen.queryByText(JUDGEMENT_CARD_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: JUDGE_RESULT_LABEL.MET })).not.toBeInTheDocument();
  });

  it('로그인하면 조건별 판정 카드를 ✓ ✗ ? 아이콘과 함께 보여 준다', async () => {
    signInAs(TOKENS.MEMBER);
    renderApp(DETAIL_PATH);
    await findPolicyTitle();

    // 세션 복구(/me)가 끝나면 상세를 한 번 더 불러오므로, 다시 불러온 뒤의 화면을 한 번에 확인한다.
    await waitFor(() => {
      expect(screen.getByText(JUDGEMENT_CARD_TITLE)).toBeInTheDocument();
      Object.values(JUDGE_RESULT).forEach((result) => {
        expect(screen.getByRole('img', { name: JUDGE_RESULT_LABEL[result] })).toBeInTheDocument();
      });
    });
    expect(screen.queryByText(RAW_CARD_TITLE)).not.toBeInTheDocument();
  });

  it('원문 카드에서 로그인하면 상세를 다시 불러와 판정 카드로 바뀐다', async () => {
    const { user } = renderApp(DETAIL_PATH);
    await findPolicyTitle();

    await user.click(screen.getByRole('button', { name: '로그인하고 확인하기' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('이메일'), MEMBER_CREDENTIALS.email);
    await user.type(within(dialog).getByLabelText('비밀번호'), MEMBER_CREDENTIALS.password);
    await user.click(within(dialog).getByRole('button', { name: '로그인' }));

    expect(await screen.findByText(JUDGEMENT_CARD_TITLE)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(RAW_CARD_TITLE)).not.toBeInTheDocument());
  });

  it('없는 정책이면 오류 상태를 보여 준다', async () => {
    renderApp('/policies/99999');

    expect(await screen.findByRole('alert')).toHaveTextContent('요청한 정보를 찾을 수 없어요');
  });
});
