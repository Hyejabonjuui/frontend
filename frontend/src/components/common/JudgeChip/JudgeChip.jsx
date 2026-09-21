import Chip from '@mui/material/Chip';

import JudgeIcon from '@/components/common/JudgeIcon';
import { JUDGE_RESULT, JUDGE_RESULT_LABEL } from '@/constants/policy';

const BORDER_COLOR_BY_RESULT = {
  [JUDGE_RESULT.MET]: 'success.main',
  [JUDGE_RESULT.NOT_MET]: 'error.main',
  [JUDGE_RESULT.NEED_CHECK]: 'warning.main',
};

function JudgeChip({ result, label }) {
  return (
    <Chip
      variant="outlined"
      icon={<JudgeIcon result={result} size={20} />}
      label={label ?? JUDGE_RESULT_LABEL[result]}
      sx={{
        height: 28,
        pl: 0.5,
        borderColor: BORDER_COLOR_BY_RESULT[result],
        fontSize: 12,
        fontWeight: 700,
        '& .MuiChip-icon': { ml: 0, mr: 0.75 },
      }}
    />
  );
}

export default JudgeChip;
