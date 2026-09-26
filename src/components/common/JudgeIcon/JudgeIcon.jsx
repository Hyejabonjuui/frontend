import Box from '@mui/material/Box';

import AppIcon from '@/components/common/AppIcon';
import { JUDGE_RESULT, JUDGE_RESULT_COLOR, JUDGE_RESULT_LABEL } from '@/constants/policy';

const ICON_STYLE_BY_RESULT = {
  [JUDGE_RESULT.MET]: {
    icon: 'check',
    sx: { backgroundColor: JUDGE_RESULT_COLOR[JUDGE_RESULT.MET], color: 'common.white' },
  },
  [JUDGE_RESULT.NOT_MET]: {
    icon: 'cross',
    sx: { backgroundColor: JUDGE_RESULT_COLOR[JUDGE_RESULT.NOT_MET], color: 'common.white' },
  },
  [JUDGE_RESULT.NEED_CHECK]: {
    icon: 'question',
    sx: { backgroundColor: JUDGE_RESULT_COLOR[JUDGE_RESULT.NEED_CHECK], color: 'common.white' },
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
        ...iconStyle.sx,
      }}
    >
      <AppIcon name={iconStyle.icon} size={size * 0.6} />
    </Box>
  );
}

export default JudgeIcon;
