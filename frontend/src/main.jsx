import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import App from '@/App';
import theme from '@/styles/theme';
import '@/styles/global.css';

// [notiice] 테스트용 코드입니다. 백엔드가 없을 때 화면을 확인하려고 목 API를 붙입니다.
// [notiice] VITE_USE_MOCK 이 'true' 일 때만 실행되며, 이 블록을 지우면 실제 서버로만 요청합니다.
if (import.meta.env.VITE_USE_MOCK === 'true') {
  const [{ enableMockApi }, { default: httpClient }] = await Promise.all([
    import('@/mocks'),
    import('@/api/httpClient'),
  ]);

  enableMockApi(httpClient);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
