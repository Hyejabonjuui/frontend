import Chip from '@mui/material/Chip';

import JudgeIcon from '@/components/common/JudgeIcon';
import { JUDGE_RESULT_COLOR, JUDGE_RESULT_LABEL } from '@/constants/policy';

const SIZE_STYLES = {
  medium: { height: 28, iconSize: 20 },
  // 추천 결과 카드처럼 조건 다섯 개를 한 줄에 놓는 곳
  small: { height: 24, iconSize: 16 },
};

function JudgeChip({ result, label, size = 'medium' }) {
  const { height, iconSize } = SIZE_STYLES[size];

  return (
    <Chip
      variant="outlined"
      icon={<JudgeIcon result={result} size={iconSize} />}
      label={label ?? JUDGE_RESULT_LABEL[result]}
      sx={{
        height,
        pl: 0.5,
        borderColor: JUDGE_RESULT_COLOR[result],
        fontSize: 12,
        fontWeight: 700,
        '& .MuiChip-icon': { ml: 0, mr: size === 'small' ? 0.5 : 0.75 },
      }}
    />
  );
}

export default JudgeChip;
