import { createElement } from 'react';
import { createTheme } from '@mui/material/styles';

import AppIcon from '@/components/common/AppIcon';

const svgIcon = (name, size = 20) => createElement(AppIcon, { name, size });
const SelectChevron = (props) =>
  createElement(AppIcon, { ...props, name: 'chevron-down', size: 24 });
const PagePrevious = (props) =>
  createElement(AppIcon, { ...props, name: 'chevron-left', size: 20 });
const PageNext = (props) => createElement(AppIcon, { ...props, name: 'chevron-right', size: 20 });
const PageFirst = (props) => createElement(AppIcon, { ...props, name: 'first-page', size: 20 });
const PageLast = (props) => createElement(AppIcon, { ...props, name: 'last-page', size: 20 });
const AlertClose = (props) => createElement(AppIcon, { ...props, name: 'close', size: 20 });

const designTokens = {
  accent: '#5cb8ff',
  accentDark: '#0065ad',
  accentInk: '#0b1626',
  text: '#1e2227',
  text2: '#565d66',
  text3: '#8a9099',
  canvas: '#ffffff',
  fill: '#e3e6ea',
  fill2: '#f4f5f7',
  line: '#d2d6db',
  line2: '#a8aeb6',
  stateOk: '#00A845',
  stateWarn: '#A38F20',
  stateErr: '#FF1C1C',
  favorite: '#e5484d',
};

const SPACING_UNIT = 8;
const CONTENT_WIDTH = 1120;
const PAGE_GUTTER = { xs: 2, sm: 3, md: 4 };

export const LAYOUT = {
  contentWidth: CONTENT_WIDTH,
  headerHeight: 64,
  pageGutter: PAGE_GUTTER,
  // 헤더·본문·푸터 공통 틀. 좌우 여백을 뺀 안쪽 폭이 설계서 콘텐츠 폭(1120)이 되게 여백만큼 넓힌다.
  containerMaxWidth: Object.fromEntries(
    Object.entries(PAGE_GUTTER).map(([breakpoint, gutter]) => [
      breakpoint,
      CONTENT_WIDTH + gutter * SPACING_UNIT * 2,
    ]),
  ),
  // 설계서 Search/Main(홈·추천 결과 공통 큰 검색창) 폭
  searchBarWidth: 600,
};

export const RADIUS = {
  control: 4,
  dday: 12,
  chip: 16,
  card: 12,
  toast: 8,
};

const fontFamily = "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif";
const mobileText = '@media (max-width:767.98px)';
/**
 * 콘텐츠 폭이 설계서(1120)보다 좁아지는 구간에서만 제목·버튼 글자를 줄인다.
 * 1168px(1120 + 좌우 여백 24 × 2)부터는 배치가 1440 설계서와 같으므로 글자도 설계서 크기를 쓴다.
 */
const tabletText = '@media (min-width:768px) and (max-width:1167.98px)';

const theme = createTheme({
  cssVariables: true,
  breakpoints: {
    values: { xs: 0, sm: 768, md: 1440, lg: 1920, xl: 2560 },
  },
  palette: {
    primary: {
      main: designTokens.accent,
      dark: designTokens.accentDark,
      contrastText: designTokens.accentInk,
    },
    success: { main: designTokens.stateOk },
    warning: { main: designTokens.stateWarn },
    error: { main: designTokens.stateErr },
    // 관심(하트)은 채워졌을 때만 빨갛게 보여 준다.
    favorite: { main: designTokens.favorite },
    text: {
      primary: designTokens.text,
      secondary: designTokens.text2,
      disabled: designTokens.text3,
    },
    background: { default: designTokens.canvas, paper: designTokens.canvas },
    divider: designTokens.line,
    grey: {
      100: designTokens.fill2,
      200: designTokens.fill,
      400: designTokens.line,
      500: designTokens.line2,
      600: designTokens.text3,
    },
  },
  shape: { borderRadius: RADIUS.control },
  typography: {
    fontFamily,
    h1: {
      fontSize: 26,
      lineHeight: '35px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      [mobileText]: { fontSize: 22, lineHeight: '30px' },
      [tabletText]: { fontSize: 24, lineHeight: '33px' },
    },
    h2: {
      fontSize: 20,
      lineHeight: '28px',
      fontWeight: 700,
      letterSpacing: '-0.015em',
      [mobileText]: { fontSize: 18, lineHeight: '26px' },
      [tabletText]: { fontSize: 19, lineHeight: '26px' },
    },
    // 설계서 텍스트 스타일: body/md 15/22 굵게(블록 제목·카드 제목), body/sm 14/20, body/sm-strong 14/20, caption 12/16
    subtitle1: { fontSize: 15, lineHeight: '22px', fontWeight: 700 },
    body1: { fontSize: 14, lineHeight: '20px', fontWeight: 400 },
    body2: { fontSize: 14, lineHeight: '20px', fontWeight: 500 },
    caption: { fontSize: 12, lineHeight: '16px', fontWeight: 400 },
    button: {
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 500,
      textTransform: 'none',
      [tabletText]: { fontSize: 13 },
    },
  },
  components: {
    // MUI가 기본으로 그리던 조작 아이콘도 public/icons의 SVG를 사용한다.
    MuiSelect: { defaultProps: { IconComponent: SelectChevron } },
    MuiRadio: {
      defaultProps: { icon: svgIcon('radio-unchecked'), checkedIcon: svgIcon('radio-checked') },
    },
    MuiPaginationItem: {
      defaultProps: {
        slots: { previous: PagePrevious, next: PageNext, first: PageFirst, last: PageLast },
      },
    },
    MuiAlert: {
      defaultProps: {
        iconMapping: {
          success: svgIcon('check-circle', 24),
          error: svgIcon('cross-circle', 24),
          warning: svgIcon('warning', 24),
          info: svgIcon('info-circle', 24),
        },
        slots: { closeIcon: AlertClose },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 36, paddingInline: 14, borderRadius: RADIUS.control },
        // 설계서 공통 규칙: 버튼 기본 높이 36, 작게 30
        sizeSmall: { minHeight: 30, paddingInline: 10, fontSize: 12, fontWeight: 700 },
        // 설계서에서 파란색은 채움 버튼만 쓴다. 보조 버튼은 회색(line-2) 테두리에 검은 글자다.
        outlined: {
          color: designTokens.text,
          borderColor: designTokens.line2,
          '&:hover': { borderColor: designTokens.line2, backgroundColor: designTokens.fill2 },
        },
        text: {
          color: designTokens.text,
          '&:hover': { backgroundColor: designTokens.fill2 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: RADIUS.chip },
        outlined: { borderColor: designTokens.line2 },
        // 설계서 Chip/SubtypeSmall: 높이 22 · 글자 12/16 · 좌우 8
        sizeSmall: { height: 22, fontSize: 12, lineHeight: '16px' },
        labelSmall: { paddingInline: 8 },
      },
      variants: [
        {
          props: { variant: 'outlined', size: 'small' },
          style: { color: designTokens.text2 },
        },
      ],
    },
    MuiLink: {
      styleOverrides: {
        root: { color: designTokens.accentDark },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': { color: designTokens.accentDark },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.control,
          // 설계서 공통 규칙 3: 입력 오류는 테두리 2px + 빨강 + 안내 문구로 함께 알린다.
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderWidth: 2 },
        },
      },
    },
    MuiDialog: {
      // 설계서 Backdrop: 뒤 화면은 blur 20에 22%만큼 어둡게 깔아 둔다.
      defaultProps: {
        slotProps: {
          backdrop: {
            sx: {
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(0, 0, 0, 0.22)',
            },
          },
        },
      },
      styleOverrides: {
        paper: { borderRadius: RADIUS.card },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: RADIUS.card },
      },
    },
  },
});

export default theme;
