import { Link as RouterLink } from 'react-router-dom';
import AppIcon from '@/components/common/AppIcon';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DdayBadge from '@/components/common/DdayBadge';
import JudgeChip from '@/components/common/JudgeChip';
import { RECOMMENDATION_GROUP } from '@/constants/policy';
import { buildPolicyDetailPath } from '@/constants/routes';

/**
 * 설계서 S-05 Card/ResultItem: 정책마다 "왜?" 한 문장과 조건별 판정을 함께 보여준다.
 * 왼쪽에 제목·이유·판정을, 오른쪽에 D-day·관심·상세 보기를 둔다.
 */
function SearchResultCard({ policy, group, isFavorite = false, onToggleFavorite }) {
  const isImpossible = group === RECOMMENDATION_GROUP.IMPOSSIBLE;
  const reasonLabel = isImpossible ? '이유' : '왜?';

  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        gap: { xs: 1.5, sm: 3 },
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        backgroundColor: isImpossible ? 'grey.100' : 'background.paper',
      }}
    >
      <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Chip label={policy.subtypeName} variant="outlined" size="small" sx={{ flexShrink: 0 }} />
          <Typography
            variant="subtitle1"
            color={isImpossible ? 'text.secondary' : 'text.primary'}
            sx={{ minWidth: 0, wordBreak: 'keep-all', overflowWrap: 'anywhere' }}
          >
            {policy.title}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" sx={{ flexShrink: 0 }}>
            {reasonLabel}
          </Typography>
          <Typography
            variant="body1"
            sx={{ pt: '1px', minWidth: 0, wordBreak: 'keep-all', overflowWrap: 'anywhere' }}
          >
            {policy.reason}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {(policy.judgements ?? []).map((judgement) => (
            <JudgeChip
              key={judgement.conditionKey}
              result={judgement.result}
              label={judgement.conditionName}
            />
          ))}
        </Stack>
      </Stack>

      <Stack spacing={1.5} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <DdayBadge applyPeriodType={policy.applyPeriodType} applyEndDate={policy.applyEndDate} />
          <IconButton
            aria-label={isFavorite ? '관심 정책 해제' : '관심 정책 저장'}
            onClick={() => onToggleFavorite?.(policy.id)}
            sx={{
              width: 36,
              height: 36,
              color: isFavorite ? 'favorite.main' : 'text.secondary',
            }}
          >
            <AppIcon name={isFavorite ? 'heart' : 'heart-outline'} size={20} />
          </IconButton>
        </Stack>

        <Link
          component={RouterLink}
          to={buildPolicyDetailPath(policy.id)}
          variant="body2"
          color="text.primary"
          underline="hover"
          sx={{ whiteSpace: 'nowrap' }}
        >
          상세 보기 <AppIcon name="arrow-right" size={16} />
        </Link>
      </Stack>
    </Card>
  );
}

export default SearchResultCard;
