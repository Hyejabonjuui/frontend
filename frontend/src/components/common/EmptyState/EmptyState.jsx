import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { RADIUS } from '@/styles/theme';

/** isFramed는 설계서 S-05 "후보 0건"의 점선 테두리 박스를 쓴다는 뜻이다. */
function EmptyState({ title, description, action, caption, isFramed = false }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: isFramed ? 7 : 6,
        px: 2,
        ...(isFramed && {
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: `${RADIUS.card}px`,
        }),
      }}
    >
      <Typography variant={isFramed ? 'h2' : 'body2'} color="text.primary">
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 1, wordBreak: 'keep-all', overflowWrap: 'break-word' }}
        >
          {description}
        </Typography>
      )}

      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}

      {caption && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2 }}>
          {caption}
        </Typography>
      )}
    </Box>
  );
}

export default EmptyState;
