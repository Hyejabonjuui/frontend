import Box from '@mui/material/Box';

import { JUDGE_RESULT, JUDGE_RESULT_LABEL } from '@/constants/policy';

const ICON_STYLE_BY_RESULT = {
  [JUDGE_RESULT.MET]: {
    symbol: '✓',
    sx: { backgroundColor: 'success.main', color: 'common.white' },
  },
  [JUDGE_RESULT.NOT_MET]: {
    symbol: '✗',
    sx: {
      backgroundColor: 'common.white',
      color: 'error.main',
      border: '1.5px solid',
      borderColor: 'error.main',
    },
  },
  [JUDGE_RESULT.NEED_CHECK]: {
    symbol: '?',
    sx: { backgroundColor: 'warning.main', color: 'common.white' },
  },
};

function JudgeIcon({ result, size = 24 }) {
  const iconStyle = ICON_STYLE_BY_RESULT[result];

  if (!iconStyle) {
    return null;
  }

  return (
    <Box
      component="span"
      role="img"
      aria-label={JUDGE_RESULT_LABEL[result]}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
        ...iconStyle.sx,
      }}
    >
      {iconStyle.symbol}
    </Box>
  );
}

export default JudgeIcon;
