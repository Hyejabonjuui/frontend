import { createTheme } from '@mui/material/styles';

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
  stateOk: '#1f8a4c',
  stateWarn: '#c77700',
  stateErr: '#d14343',
  favorite: '#e5484d',
};

export const LAYOUT = {
  contentWidth: 1120,
  headerHeight: 64,
  pageGutter: { xs: 2, md: 4 },
};

export const RADIUS = {
  control: 4,
  dday: 12,
  chip: 16,
  card: 12,
  toast: 8,
};

const fontFamily = "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif";

const theme = createTheme({
  cssVariables: true,
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
    h1: { fontSize: 26, lineHeight: '35px', fontWeight: 700 },
    h2: { fontSize: 20, lineHeight: '28px', fontWeight: 700 },
    body1: { fontSize: 14, lineHeight: '20px', fontWeight: 400 },
    body2: { fontSize: 14, lineHeight: '20px', fontWeight: 500 },
    caption: { fontSize: 12, lineHeight: '16px', fontWeight: 400 },
    button: { fontSize: 14, lineHeight: '20px', fontWeight: 500, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { height: 36, paddingInline: 14, borderRadius: RADIUS.control },
        sizeSmall: { height: 30, paddingInline: 10, fontSize: 12, fontWeight: 700 },
        // 설계서에서 파란색은 채움 버튼만 쓴다. 보조 버튼은 회색 테두리에 검은 글자다.
        outlined: {
          color: designTokens.text,
          borderColor: designTokens.line,
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
      },
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
