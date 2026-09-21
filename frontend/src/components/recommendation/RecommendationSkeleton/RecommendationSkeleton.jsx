import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RADIUS } from '@/styles/theme';

/** 실제 결과가 채워질 자리와 같은 모양이라, 응답이 와도 화면이 덜컹거리지 않는다. */
const GROUP_SHAPES = [
  { key: 'POSSIBLE', titleWidth: 180, cardCount: 3 },
  { key: 'NEED_CHECK', titleWidth: 210, cardCount: 2 },
  { key: 'IMPOSSIBLE', titleWidth: 190, cardCount: 1 },
];

function CardSkeleton() {
  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Skeleton variant="rounded" width={41} height={22} sx={{ borderRadius: `${RADIUS.chip}px` }} />
        <Skeleton variant="text" sx={{ flexGrow: 1, maxWidth: 260 }} />
        <Skeleton variant="rounded" width={39} height={24} sx={{ borderRadius: `${RADIUS.dday}px` }} />
        <Skeleton variant="circular" width={24} height={24} />
      </Stack>

      <Skeleton variant="text" sx={{ mt: 1.5, maxWidth: 520 }} />

      <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center' }}>
        {['나이', '지역', '소득', '취업', '무주택'].map((condition) => (
          <Skeleton
            key={condition}
            variant="rounded"
            width={62}
            height={24}
            sx={{ borderRadius: `${RADIUS.chip}px` }}
          />
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Skeleton variant="text" width={64} />
      </Stack>
    </Card>
  );
}

/** 설계서 S-05 로딩: AI 판정이 오는 동안 결과와 같은 뼈대를 먼저 보여 준다. */
function RecommendationSkeleton() {
  return (
    <Stack spacing={4} aria-busy="true" aria-live="polite">
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
        AI가 내 조건으로 정책을 확인하고 있어요
      </Typography>

      <Stack component="section" spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Skeleton variant="rounded" width={150} height={24} sx={{ borderRadius: `${RADIUS.chip}px` }} />
          <Skeleton variant="text" width={320} />
        </Stack>

        <Stack direction="row" spacing={3}>
          {GROUP_SHAPES.map((group) => (
            <Skeleton key={group.key} variant="text" width={110} />
          ))}
        </Stack>
      </Stack>

      {GROUP_SHAPES.map((group) => (
        <Box key={group.key} component="section">
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={group.titleWidth} height={28} />
          </Stack>

          <Stack spacing={1.5}>
            {Array.from({ length: group.cardCount }, (unused, index) => (
              <CardSkeleton key={`${group.key}-${index}`} />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export default RecommendationSkeleton;
