import Chip from '@mui/material/Chip';

import { APPLY_PERIOD_TYPE, DDAY_IMMINENT_THRESHOLD } from '@/constants/policy';
import { RADIUS } from '@/styles/theme';
import { getRemainingDays } from '@/utils/formatDate';

function DdayBadge({ applyPeriodType, applyEndDate }) {
  if (applyPeriodType === APPLY_PERIOD_TYPE.ALWAYS) {
    return (
      <Chip
        label="상시"
        size="small"
        variant="outlined"
        sx={{ borderRadius: `${RADIUS.dday}px`, fontWeight: 700 }}
      />
    );
  }

  const remainingDays = getRemainingDays(applyEndDate);

  if (remainingDays === null) {
    return null;
  }

  if (remainingDays < 0) {
    return (
      <Chip
        label="마감"
        size="small"
        variant="outlined"
        sx={{ borderRadius: `${RADIUS.dday}px`, fontWeight: 700, color: 'text.disabled' }}
      />
    );
  }

  const isImminent = remainingDays <= DDAY_IMMINENT_THRESHOLD;

  return (
    <Chip
      label={`D-${remainingDays}`}
      size="small"
      color={isImminent ? 'primary' : 'default'}
      variant={isImminent ? 'filled' : 'outlined'}
      sx={{ borderRadius: `${RADIUS.dday}px`, fontWeight: 700 }}
    />
  );
}

export default DdayBadge;
