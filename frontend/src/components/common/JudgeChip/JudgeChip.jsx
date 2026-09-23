import Chip from '@mui/material/Chip';

import JudgeIcon from '@/components/common/JudgeIcon';
import { JUDGE_RESULT_COLOR, JUDGE_RESULT_LABEL } from '@/constants/policy';


function JudgeChip({ result, label }) {
  return (
    <Chip
      variant="outlined"
      icon={<JudgeIcon result={result} size={20} />}
      label={label ?? JUDGE_RESULT_LABEL[result]}
      sx={{
        height: 28,
        pl: 0.5,
        borderColor: JUDGE_RESULT_COLOR[result],
        fontSize: 12,
        fontWeight: 700,
        '& .MuiChip-icon': { ml: 0, mr: 0.75 },
      }}
    />
  );
}

export default JudgeChip;
