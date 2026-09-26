/**
 * E-5 역할별 접근: 관리자만 정책 수집 화면을 쓴다
 *
 * notice: 목 모드 빌드에서 돈다. 관리자 판별은 프론트 가정값(role === 'ADMIN')이고,
 *         수집 실행은 목 서버가 즉시 성공 결과를 돌려준다. 실서버에서는 수집에 시간이 걸리므로
 *         결과 대기 시간을 늘리거나 상태 조회(COLLECT_STATUS) 폴링을 기다리도록 바꾼다.
 */
import { expect, test } from '@playwright/test';

import { ADMIN, MEMBER } from './support/accounts.js';
import { loginFromHeader } from './support/actions.js';

const ADMIN_HEADING = '관리 · 정책 수집';

test('관리자는 정책 수집 화면에서 수집을 실행하고 결과를 본다', async ({ page }) => {
  await page.goto('/');
  await loginFromHeader(page, ADMIN);

  // 새로고침으로 들어가도 세션이 복구된 뒤 관리자 화면이 열린다.
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: ADMIN_HEADING })).toBeVisible();

  await page.getByRole('button', { name: '지금 수집 실행' }).click();

  await expect(page.getByText('정책 수집을 마쳤어요')).toBeVisible();
  await expect(page.getByText('마지막 수집 결과')).toBeVisible();
  await expect(page.getByText('성공 (SUCCESS)')).toBeVisible();
});

test('일반 회원은 관리자 화면 주소로 들어가도 홈으로 돌아간다', async ({ page }) => {
  await page.goto('/');
  await loginFromHeader(page, MEMBER);

  await page.goto('/admin');

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: ADMIN_HEADING })).toBeHidden();
});
