/**
 * I-5 조건 등록 폼 (S-04)
 *
 * notice: 실제 백엔드 없이 MSW가 선택지(/api/codes)와 조건 저장(PUT /api/me/profile)에 응답한다.
 *         선택지는 목 데이터(src/mocks/data/codes.js)라서, 실제 코드 테이블이 들어오면 옵션 이름이 바뀔 수 있다.
 *         그때는 이 파일의 옵션 이름(서울특별시, 마포구, 구직 중)만 fixture 값으로 맞춘다.
 */
import { screen, waitFor, within } from '@testing-library/react';
import { http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';
import { TOAST_MESSAGES, VALIDATION_MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';

import { renderApp, signInAs } from '../../helpers/renderApp';
import { TOKENS } from '../../msw/fixtures';
import { apiUrl, ok } from '../../msw/respond';
import { server } from '../../msw/server';

const SUBMIT_LABEL = '저장하고 시작하기';

const findBirthDateInput = () => screen.findByLabelText('생년월일');

const chooseOption = async (user, comboboxName, optionName) => {
  await user.click(screen.getByRole('combobox', { name: comboboxName }));
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: optionName }));
};

beforeEach(() => {
  // 가입 직후처럼 조건이 하나도 없는 회원으로 시작한다.
  server.use(http.get(apiUrl(ENDPOINTS.USER.PROFILE), () => ok({})));
  signInAs(TOKENS.NEW_USER);
});

describe('조건 등록 폼', () => {
  it('필수값을 비우고 저장하면 필드마다 오류를 보여 주고 서버에 보내지 않는다', async () => {
    let saveRequestCount = 0;
    server.use(
      http.put(apiUrl(ENDPOINTS.USER.PROFILE), () => {
        saveRequestCount += 1;
        return ok();
      }),
    );
    const { user } = renderApp(ROUTES.CONDITION_SETUP);
    await findBirthDateInput();

    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    // 생년월일 · 거주지 · 취업 상태 · 무주택 여부 네 곳에 ⚠ 문구가 뜬다.
    expect(screen.getAllByText(VALIDATION_MESSAGES.REQUIRED_FIELD)).toHaveLength(4);
    expect(await findBirthDateInput()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(TOAST_MESSAGES.CONDITION_REQUIRED)).toBeInTheDocument();
    expect(saveRequestCount).toBe(0);
  });

  it('시/군/구 "전체"는 고를 수 없게 막혀 있다', async () => {
    const { user } = renderApp(ROUTES.CONDITION_SETUP);
    await findBirthDateInput();

    await chooseOption(user, '시도 선택', '서울특별시');
    await user.click(screen.getByRole('combobox', { name: '시군구 선택' }));

    const wholeRegionOption = within(screen.getByRole('listbox')).getByRole('option', {
      name: /서울 전체/,
    });
    expect(wholeRegionOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('필수값을 채워 저장하면 입력값을 보내고 홈으로 이동한다', async () => {
    let savedConditions = null;
    server.use(
      http.put(apiUrl(ENDPOINTS.USER.PROFILE), async ({ request }) => {
        savedConditions = await request.json();
        return ok(savedConditions);
      }),
    );
    const { user } = renderApp(ROUTES.CONDITION_SETUP);

    await user.type(await findBirthDateInput(), '1999-03-12');
    await chooseOption(user, '시도 선택', '서울특별시');
    await chooseOption(user, '시군구 선택', '마포구');
    await user.click(screen.getByRole('radio', { name: '구직 중' }));
    await user.click(screen.getByRole('radio', { name: '예, 무주택이에요' }));
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    await waitFor(() => expect(window.location.pathname).toBe(ROUTES.HOME));
    expect(savedConditions).toMatchObject({
      birthDate: '1999-03-12',
      sidoCode: '11',
      regionCode: '11440',
      employmentCode: 'JOB_SEEKING',
      houseless: true,
    });
    expect(screen.getByText(TOAST_MESSAGES.CONDITION_SAVED)).toBeInTheDocument();
  });

  it('저장하지 않고 나갔다가 다시 오면 입력하던 내용을 불러온다', async () => {
    const { user, unmount } = renderApp(ROUTES.CONDITION_SETUP);
    await user.type(await findBirthDateInput(), '1999-03-12');
    await user.click(screen.getByRole('radio', { name: '아니요, 집이 있어요' }));
    unmount();

    renderApp(ROUTES.CONDITION_SETUP);

    expect(await findBirthDateInput()).toHaveValue('1999-03-12');
    expect(screen.getByRole('radio', { name: '아니요, 집이 있어요' })).toBeChecked();
    // 안내 문구가 화면 안내(Alert)와 토스트에 한 번씩 나온다.
    expect(screen.getAllByText(TOAST_MESSAGES.CONDITION_DRAFT_LOADED)).toHaveLength(2);
  });
});
