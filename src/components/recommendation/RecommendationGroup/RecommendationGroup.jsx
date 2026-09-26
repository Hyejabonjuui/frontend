import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import JudgeIcon from '@/components/common/JudgeIcon';
import RecommendationCard from '@/components/recommendation/RecommendationCard';
import {
  JUDGE_RESULT,
  RECOMMENDATION_GROUP,
  RECOMMENDATION_GROUP_DESCRIPTION,
  RECOMMENDATION_GROUP_LABEL,
} from '@/constants/policy';

const JUDGE_RESULT_BY_GROUP = {
  [RECOMMENDATION_GROUP.POSSIBLE]: JUDGE_RESULT.MET,
  [RECOMMENDATION_GROUP.NEED_CHECK]: JUDGE_RESULT.NEED_CHECK,
  [RECOMMENDATION_GROUP.IMPOSSIBLE]: JUDGE_RESULT.NOT_MET,
};

function RecommendationGroup({ group, policies = [], isFavorite, onToggleFavorite }) {
  return (
    <Box component="section">
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
        <JudgeIcon result={JUDGE_RESULT_BY_GROUP[group]} size={20} />
        <Typography variant="h2">
          {RECOMMENDATION_GROUP_LABEL[group]} · {policies.length}건
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {RECOMMENDATION_GROUP_DESCRIPTION[group]}
        </Typography>
      </Stack>

      {policies.length === 0 ? (
        <Typography variant="body1" color="text.disabled" sx={{ py: 2 }}>
          해당하는 정책이 없어요
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {policies.map((policy) => (
            <RecommendationCard
              key={policy.id}
              policy={policy}
              group={group}
              isFavorite={isFavorite?.(policy.id) ?? false}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default RecommendationGroup;
