import { screen, waitFor, within } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';
import { ERROR_MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { tokenStorage } from '@/utils/tokenStorage';

import { renderApp } from '../../helpers/renderApp';
import { TOKENS } from '../../msw/fixtures';
import { apiUrl, fail, ok } from '../../msw/respond';
import { server } from '../../msw/server';

const chooseOption = async (user, comboboxName, optionName) => {
  await user.click(screen.getByRole('combobox', { name: comboboxName }));
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: optionName }));
};

describe('회원가입', () => {
  it('지역 목록 조회가 실패하면 다시 시도해 가입 폼을 표시한다', async () => {
    server.use(http.get(apiUrl(ENDPOINTS.CODE.REGIONS), () => fail(500), { once: true }));
    const { user } = renderApp(ROUTES.SIGNUP);

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGES.SERVER);

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await screen.findByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('생년월일')).toBeInTheDocument();
  });

  it('계정과 profile을 한 요청으로 저장한 뒤 로그인한다', async () => {
    let signupBody;

    server.use(
      http.post(apiUrl(ENDPOINTS.AUTH.SIGNUP), async ({ request }) => {
        signupBody = await request.json();

        return ok({
          isSuccess: true,
          result: {
            memberId: 3,
            email: signupBody.email,
            nickname: signupBody.nickname,
            createdAt: '2026-09-27T00:00:00',
          },
        });
      }),
      http.post(apiUrl(ENDPOINTS.AUTH.LOGIN), () =>
        ok({
          isSuccess: true,
          result: { accessToken: TOKENS.NEW_USER, memberId: 3, nickname: '새내기' },
        }),
      ),
    );

    const { user } = renderApp(ROUTES.SIGNUP);

    await user.type(await screen.findByLabelText('이메일'), 'new@hyeja.kr');
    await user.type(screen.getByLabelText('비밀번호', { exact: true }), 'hyeja1234!');
    await user.type(screen.getByLabelText('비밀번호 확인'), 'hyeja1234!');
    await user.type(screen.getByLabelText('닉네임'), '새내기');
    await user.type(screen.getByLabelText('생년월일'), '2000-03-15');
    await chooseOption(user, '시도 선택', '서울특별시');
    await chooseOption(user, '시군구 선택', '마포구');
    await user.click(screen.getByRole('radio', { name: '재직자' }));
    await user.click(screen.getByRole('radio', { name: '예, 무주택이에요' }));
    await user.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => expect(window.location.pathname).toBe(ROUTES.HOME));
    expect(signupBody).toEqual({
      email: 'new@hyeja.kr',
      password: 'hyeja1234!',
      nickname: '새내기',
      profile: {
        birth: '2000-03-15',
        regionCode: '11440',
        employmentCode: 'EMPLOYED',
        houselessYn: true,
        marriageCode: null,
        incomeRangeCode: null,
        educationCode: null,
        housingType: null,
      },
    });
    expect(tokenStorage.getAccessToken()).toBe(TOKENS.NEW_USER);
    expect(screen.getByText('가입이 완료됐어요')).toBeInTheDocument();
  }, 15000);
});
