import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { RADIUS } from '@/styles/theme';

/**
 * isFramed는 설계서 S-05 "후보 0건"의 점선 박스를 쓴다는 뜻이다.
 * 점선 line-2 · 모서리 12 · 여백 48/32 · 제목 15/22 굵게 · 제목과 설명 사이 10
 */
function EmptyState({ title, description, action, isFramed = false }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 6,
        px: isFramed ? 4 : 2,
        ...(isFramed && {
          border: '1px dashed',
          borderColor: 'grey.500',
          borderRadius: `${RADIUS.card}px`,
        }),
      }}
    >
      <Typography variant={isFramed ? 'subtitle1' : 'body2'} color="text.primary">
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: isFramed ? 1.25 : 1, wordBreak: 'keep-all', overflowWrap: 'break-word' }}
        >
          {description}
        </Typography>
      )}

      {action && <Box sx={{ mt: isFramed ? 2.25 : 2.5 }}>{action}</Box>}
    </Box>
  );
}

export default EmptyState;
