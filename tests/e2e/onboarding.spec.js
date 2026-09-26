/**
 * E-3 회원가입 → 조건 등록 → 검색 → 추천 결과
 *
 * notice: 목 모드 빌드에서 돈다. 가입한 계정은 목 서버(localStorage)에만 생기고,
 *         추천 결과는 목 서버의 판정 로직(src/mocks/judge.js)이 만든다.
 *         그래서 그룹별 건수는 검증하지 않고 "세 그룹이 보인다"까지만 본다.
 * notice: 실서버로 돌리면 가입 계정이 실제 DB에 남는다. 그때는 테스트마다 고유한 이메일을 쓰고
 *         테스트 후 회원 탈퇴(DELETE /api/me)로 정리하는 단계를 추가한다.
 */
import { expect, test } from '@playwright/test';

const NEW_ACCOUNT = {
  email: 'e2e-onboarding@hyeja.kr',
  password: 'hyeja1234!',
  nickname: '새내기',
};

const chooseOption = async (page, comboboxName, optionName) => {
  await page.getByRole('combobox', { name: comboboxName }).click();
  await page.getByRole('option', { name: optionName, exact: true }).click();
};

test('가입하면 조건 등록으로 이어지고, 저장 후 검색하면 추천 결과를 본다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('banner').getByRole('link', { name: '회원가입' }).click();

  await page.getByLabel('이메일').fill(NEW_ACCOUNT.email);
  await page.getByLabel('비밀번호', { exact: true }).fill(NEW_ACCOUNT.password);
  await page.getByLabel('비밀번호 확인').fill(NEW_ACCOUNT.password);
  await page.getByLabel('닉네임').fill(NEW_ACCOUNT.nickname);
  await page.getByRole('button', { name: '가입하고 내 조건 등록하기' }).click();

  // 조건이 없는 새 회원은 조건 등록(S-04)으로 이동한다.
  await expect(page).toHaveURL('/conditions');
  await page.getByLabel('생년월일').fill('1999-03-12');
  await chooseOption(page, '시도 선택', '서울특별시');
  await chooseOption(page, '시군구 선택', '마포구');
  await page.getByRole('radio', { name: '구직 중' }).check();
  await page.getByRole('radio', { name: '예, 무주택이에요' }).check();
  await page.getByRole('button', { name: '저장하고 시작하기' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('내 조건을 저장했어요')).toBeVisible();

  await page.getByRole('textbox', { name: '정책 검색' }).fill('월세');
  await page.getByRole('button', { name: '검색', exact: true }).click();

  await expect(page).toHaveURL(/\/recommendations\?keyword=/);
  for (const groupLabel of ['받을 수 있어요', '확인이 필요해요', '아쉽게 안 돼요']) {
    await expect(
      page.getByRole('heading', { name: new RegExp(`^${groupLabel} · \\d+건$`) }),
    ).toBeVisible();
  }
});
