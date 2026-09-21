import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { LAYOUT } from '@/styles/theme';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'grey.100',
      }}
    >
      <Box sx={{ maxWidth: LAYOUT.contentWidth, mx: 'auto', px: LAYOUT.pageGutter, py: 3 }}>
        <Typography variant="body2">혜자 · 청년 주거 정책 추천 서비스</Typography>
        <Typography variant="caption" color="text.secondary">
          정책 정보는 각 기관 공고를 기준으로 하며, 신청 전 원문 확인이 필요해요
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
