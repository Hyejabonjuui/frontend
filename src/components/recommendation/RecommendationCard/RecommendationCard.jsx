import { Link as RouterLink } from 'react-router-dom';
import AppIcon from '@/components/common/AppIcon';
import Box from '@mui/material/Box';
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

/** 설계서 S-05: 정책마다 "왜?" 한 문장과 조건별 판정을 함께 보여준다. */
function RecommendationCard({ policy, group, isFavorite = false, onToggleFavorite }) {
  const isImpossible = group === RECOMMENDATION_GROUP.IMPOSSIBLE;
  const reasonLabel = isImpossible ? '이유' : '왜?';

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        backgroundColor: isImpossible ? 'grey.100' : 'background.paper',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}
      >
        <Chip label={policy.subtypeName} variant="outlined" size="small" sx={{ flexShrink: 0 }} />

        <Typography
          variant="body2"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            width: { xs: 'calc(100% - 110px)', sm: 'auto' },
            overflowWrap: 'anywhere',
          }}
        >
          {policy.title}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', flexShrink: 0, ml: { xs: 'auto', sm: 0 } }}
        >
          <DdayBadge applyPeriodType={policy.applyPeriodType} applyEndDate={policy.applyEndDate} />
          <IconButton
            size="small"
            aria-label={isFavorite ? '관심 정책 해제' : '관심 정책 저장'}
            onClick={() => onToggleFavorite?.(policy.id)}
            sx={{ color: isFavorite ? 'favorite.main' : 'text.disabled' }}
          >
            <AppIcon name={isFavorite ? 'heart' : 'heart-outline'} size={20} />
          </IconButton>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mt: 1.5 }}>
        <Typography variant="body2" sx={{ flexShrink: 0 }}>
          {reasonLabel}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {policy.reason}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'center', mt: 1.5 }}
      >
        {(policy.judgements ?? []).map((judgement) => (
          <JudgeChip
            key={judgement.conditionKey}
            result={judgement.result}
            label={judgement.conditionName}
          />
        ))}

        <Box sx={{ flexGrow: 1 }} />

        <Link
          component={RouterLink}
          to={buildPolicyDetailPath(policy.id)}
          variant="body1"
          sx={{ flexShrink: 0 }}
        >
          상세 보기 <AppIcon name="arrow-right" size={16} />
        </Link>
      </Stack>
    </Card>
  );
}

export default RecommendationCard;
