# 혜자 · 청년 주거 정책 추천 (Frontend)

Vite + React 19 + MUI 기반 SPA입니다. 화면 설계서(Figma `화면 전체 (v2)`, node `230-2`)를 기준으로 구성했습니다.

## 실행

Node 24 LTS를 사용합니다. (`.nvmrc`, nvm 사용 시 `nvm use`)

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
npm run format   # Prettier 포맷팅
npm run format:check  # Prettier 포맷 검사 (CI와 동일)
```

환경 변수는 `.env.example`을 복사해 사용합니다. (`VITE_API_BASE_URL`, `VITE_USE_MOCK`)

## 테스트

```bash
npm test                  # Vitest watch (단위 + 통합)
npm run test:unit         # 단위 테스트
npm run test:integration  # 통합 테스트 (MSW)
npm run test:coverage     # 단위 + 통합 커버리지 → coverage/index.html
npx playwright install chromium   # E2E 브라우저 (처음 한 번)
npm run test:e2e          # E2E (목 모드로 빌드 후 실행)
```

- 지금은 세 층 모두 **실제 백엔드 없이** 돕니다. 통합은 MSW, E2E는 목 모드 빌드(`VITE_USE_MOCK=true`)를 씁니다.
- 층별 역할, 목 기반으로 검증하는 범위, 백엔드 확정 후 바꿀 곳은 [`tests/README.md`](tests/README.md)에 있습니다.
- PR마다 CI가 `verify`(lint → format → 단위 → 통합 → 커버리지 → build)와 `e2e`를 병렬로 돌립니다.
  커버리지 리포트는 `verify` 실행의 Summary와 `coverage-report` artifact에서 봅니다.

## 백엔드 없이 화면 테스트하기

`VITE_USE_MOCK=true`이면 axios 어댑터가 `src/mocks`의 목 API로 바뀝니다.
로그인·조건 저장·관심 정책·알림까지 실제 화면 흐름을 그대로 확인할 수 있습니다.

| 계정             | 비밀번호     | 역할                                        |
| ---------------- | ------------ | ------------------------------------------- |
| `minji@hyeja.kr` | `hyeja1234!` | 일반 회원 (조건·관심 정책·알림 채워져 있음) |
| `admin@hyeja.kr` | `hyeja1234!` | 관리자 (정책 수집 화면 접근)                |

- 저장한 내용은 브라우저 `localStorage`에 남습니다. `window.hyejaMock.reset()`은 목 데이터, 로그인 토큰, 작성 중인 조건을 초기화합니다.
- 검색어에 `AI실패`를 넣으면 추천 결과의 AI 실패 안내를 확인할 수 있습니다.
- 목 관련 코드는 전부 `src/mocks/`에 있고, 연결부와 더미 데이터 설정은 `notice:` 주석으로 표시했습니다.
  (`src/main.jsx`의 조건부 블록, `.env.*`의 `VITE_USE_MOCK`)
- 배포 빌드에는 `.env.production`의 `VITE_USE_MOCK=false`가 적용됩니다. 로컬에서 더미 데이터로 확인할 때는 `.env`에 `VITE_USE_MOCK=true`를 둡니다.
- 실제 배포 시에는 `VITE_API_BASE_URL`을 배포된 API 주소로 지정해야 합니다. `.env.example`의 `localhost:8080`은 로컬 개발용입니다.
- 문자열 길이별 화면 점검 방법과 확인 범위는 `STRING_LENGTH_UI_TEST.md`에 있습니다.

## 화면 구성

| 설계서               | 경로                                           | 접근     |
| -------------------- | ---------------------------------------------- | -------- |
| S-01 홈              | `/`                                            | 공개     |
| S-02 로그인          | 모달 (전역)                                    | 비로그인 |
| S-03 회원가입        | `/signup`                                      | 비로그인 |
| S-04 내 조건 등록    | `/conditions`                                  | 로그인   |
| S-05 추천 결과       | `/recommendations`                             | 공개     |
| S-06 정책 상세       | `/policies/:policyId`                          | 공개     |
| S-08 마이페이지      | `/mypage?tab=condition\|account\|notification` | 로그인   |
| S-09 알림함          | `/notifications`                               | 로그인   |
| S-10 정책 관리       | `/admin`                                       | 관리자   |
| S-14 관심 정책       | `/favorites`                                   | 로그인   |
| S-15 이메일 찾기     | `/find-email`                                  | 비로그인 |
| S-16 비밀번호 재발급 | `/reset-password`                              | 비로그인 |

## 디렉터리 구조

```
public/
├── icons/          화면 아이콘 SVG 파일 (아이콘 하나당 한 파일)
├── favicon.svg    브라우저 탭 아이콘
src/
├── api/            서버 통신 계층 (axios 인스턴스, 도메인별 API 함수)
├── components/
│   ├── auth/       로그인 모달
│   ├── common/     디자인 시스템 조각 (D-day·칩·판정 아이콘·빈 상태·에러·로딩)
│   ├── layout/     Header / Footer / MainLayout
│   ├── notification/ 알림 아이템 · 목록 · 헤더 팝오버
│   ├── policy/     검색바 · 분류 탭 · 정책 행 · 목록 · 카드뉴스
│   └── recommendation/ 가능·확인필요·불가 그룹
├── constants/      라우트·메시지·정책 옵션·조건 필드
├── contexts/       인증 · 토스트 · 로그인 모달
├── hooks/          데이터 조회와 재사용 로직
├── pages/          URL과 1:1로 연결되는 화면
├── routes/         라우팅 테이블과 접근 제어
├── styles/         MUI 테마(디자인 토큰 단일 소스)
└── utils/          React와 무관한 순수 함수
```

화면 아이콘은 `public/icons/*.svg`에 보관하고 `src/components/common/AppIcon`의 `name`으로 사용합니다.
아이콘 색은 주변 글자색을 따르므로 SVG 파일에는 단색 도형만 넣습니다. 판정 아이콘은 `JudgeIcon`, 입력 오류 아이콘은 `FieldError`에서 공통으로 표시합니다.

## 작성 규칙

- **import 경로는 `@/` alias를 사용한다.**
- **스타일 값은 `src/styles/theme.js`의 토큰을 통해서만 쓴다.** 색·radius·타이포 하드코딩 금지.
  - 색: `primary(#5cb8ff)` / `success(#1f8a4c)` / `warning(#c77700)` / `error(#d14343)`
  - radius: 버튼·입력칸 4 · D-day 12 · 칩 16 · 카드 12 · 토스트 8
  - 글꼴: 현재 Noto Sans KR → Pretendard 교체 시 `theme.js`의 `fontFamily` 한 줄만 수정
- **MUI v9는 `alignItems` 같은 system prop을 직접 받지 않는다.** 전부 `sx`에 넣는다.
- **예외·완료 안내는 모두 토스트로 처리한다.** (`useToast`의 `showSuccess / showError / showInfo`)
  화면 아래 가운데, 3초, ✕로 즉시 닫기, 한 번에 1개.
- **조건 판정은 색만으로 구분하지 않는다.** `JudgeIcon`이 ✓ / ✗ / ? 기호를 함께 쓴다.
- **입력 오류는 테두리 2px + `⚠` 문구를 함께 표시한다.**
- **API URL은 `src/api/endpoints.js`에만 존재한다.**
- **컴포넌트는 axios를 직접 호출하지 않는다.** `pages → hooks → api` 순서로 내려간다.
- **데이터 조회는 effect 내부에서 수행하고 `isActive` 플래그로 정리한다.**
  (ESLint `react-hooks/set-state-in-effect` 준수, 응답 순서 꼬임 방지)

## 아이콘

화면 아이콘은 `public/icons/*.svg`에 보관하고 `AppIcon`의 `name`으로 사용합니다.
예: `search` · `bell-outline` · `account-outline` · `lock-outline` · `heart-outline` / `heart` · `close` · `chevron-down`

## API 계약

설계서 주석에 적힌 경로는 그대로 따랐습니다.

| 기능                | 경로                                                |
| ------------------- | --------------------------------------------------- |
| F-01 회원가입       | `POST /api/auth/signup` → 자동 로그인 후 조건 등록  |
| F-03 조건 저장      | `PUT /api/me/profile` · 선택지 `GET /api/codes`     |
| F-05 회원 탈퇴      | `DELETE /api/me`                                    |
| F-09 정책 수집      | `POST /api/admin/collect`                           |
| F-11 정책 상세      | `GET /api/policies/{id}` (로그인 시 조건 판정 포함) |
| F-13 용어 풀이      | `GET /api/terms`                                    |
| F-14 추천           | `POST /api/recommendations` body `{ query }`        |
| F-16 관심 저장·해제 | `POST` / `DELETE /api/me/favorites/{policyId}`      |
| F-17 준비 상태 변경 | `PATCH /api/me/favorites/{policyId}`                |
| F-18 관심 목록      | `GET /api/me/favorites`                             |

## 아직 확정되지 않은 것

- 설계서에 경로가 없는 기능(로그인·로그아웃·이메일 찾기·비밀번호 재발급·정책 목록·카드뉴스·알림)은
  같은 규칙(`/api` 접두사 + 리소스 중심)으로 맞춘 가정값입니다.
- 응답 봉투(`content` / `totalCount` / `totalPages`)와 정렬 옵션 "최신순"은 가정값입니다.
- 토큰 재발급 흐름은 설계서에 없어 만들지 않았습니다. 지금은 401이면 로그아웃됩니다.
- 관리자 판별은 `user.role === 'ADMIN'`으로 가정했습니다.
