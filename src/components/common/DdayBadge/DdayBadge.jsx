import Chip from '@mui/material/Chip';

import { APPLY_PERIOD_TYPE, DDAY_IMMINENT_THRESHOLD } from '@/constants/policy';
import { RADIUS } from '@/styles/theme';
import { getRemainingDays } from '@/utils/formatDate';

/** 설계서 Badge/Dday: 높이 24 · 좌우 9 · 글자 12/16 굵게 */
const BADGE_SX = {
  height: 24,
  borderRadius: `${RADIUS.dday}px`,
  fontWeight: 700,
  '& .MuiChip-label': { paddingInline: '9px' },
};

/** 상시·마감은 테두리만, 임박(D-7 이하)은 파란 채움, 나머지는 회색 채움으로 보여 준다. */
function DdayBadge({ applyPeriodType, applyEndDate, remainingDays: providedRemainingDays }) {
  if (applyPeriodType === APPLY_PERIOD_TYPE.ALWAYS) {
    return <Chip label="상시" size="small" variant="outlined" sx={BADGE_SX} />;
  }

  const remainingDays =
    providedRemainingDays === undefined ? getRemainingDays(applyEndDate) : providedRemainingDays;

  if (applyPeriodType !== APPLY_PERIOD_TYPE.CLOSED && remainingDays === null) {
    return null;
  }

  if (applyPeriodType === APPLY_PERIOD_TYPE.CLOSED || remainingDays < 0) {
    return <Chip label="마감" size="small" variant="outlined" sx={BADGE_SX} />;
  }

  if (remainingDays <= DDAY_IMMINENT_THRESHOLD) {
    return <Chip label={`D-${remainingDays}`} size="small" color="primary" sx={BADGE_SX} />;
  }

  return (
    <Chip
      label={`D-${remainingDays}`}
      size="small"
      sx={{ ...BADGE_SX, backgroundColor: 'grey.200', color: 'text.primary' }}
    />
  );
}

export default DdayBadge;
