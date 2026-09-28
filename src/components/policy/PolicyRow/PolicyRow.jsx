import { Link as RouterLink } from 'react-router-dom';
import AppIcon from '@/components/common/AppIcon';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DdayBadge from '@/components/common/DdayBadge';
import { buildPolicyDetailPath } from '@/constants/routes';
import { useIsTextTruncated } from '@/hooks/useIsTextTruncated';
import { summarizePolicyRegions } from '@/utils/summarizePolicyRegions';

const VISUALLY_HIDDEN_SX = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

function PolicyRow({ policy, isFavorite = false, onToggleFavorite, memberRegionCode = null }) {
  const regionSummary = summarizePolicyRegions({
    regions: policy.regions,
    nationwide: policy.nationwide,
    memberRegionCode,
  });
  const isRegionSummarized = regionSummary.regionLabels.length > 1;
  const { elementRef: regionRef, isTruncated: isRegionTruncated } = useIsTextTruncated(
    regionSummary.label,
  );

  const handleFavoriteClick = (event) => {
    event.preventDefault();
    onToggleFavorite?.(policy.id);
  };

  return (
    <Box
      component={RouterLink}
      to={buildPolicyDetailPath(policy.id)}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '80px minmax(0, 1fr) auto',
          sm: '96px minmax(0, 1fr) 200px 110px',
        },
        alignItems: 'center',
        columnGap: { xs: 1, sm: 2 },
        rowGap: 1,
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'inherit',
        textDecoration: 'none',
        '&:hover': { backgroundColor: 'grey.100' },
      }}
    >
      <Chip
        label={policy.subtypeName}
        variant="outlined"
        size="small"
        sx={{ width: '100%', minWidth: 0, justifySelf: 'center' }}
      />

      <Typography
        variant="body2"
        sx={{
          minWidth: 0,
          overflowWrap: 'anywhere',
        }}
      >
        {policy.title}
      </Typography>

      <Tooltip
        arrow
        describeChild
        title={regionSummary.label}
        disableHoverListener={!isRegionTruncated}
        disableFocusListener={!isRegionTruncated}
        disableTouchListener={!isRegionTruncated}
      >
        <Typography
          ref={regionRef}
          variant="body1"
          color="text.secondary"
          noWrap
          tabIndex={isRegionTruncated ? 0 : undefined}
          sx={{
            gridColumn: { xs: '1 / 3', sm: 'auto' },
            width: '100%',
            textAlign: { xs: 'left', sm: 'right' },
          }}
        >
          {regionSummary.label}
          {isRegionSummarized && (
            <Box component="span" sx={VISUALLY_HIDDEN_SX}>
              대상 지역 전체: {regionSummary.regionLabels.join(', ')}
            </Box>
          )}
        </Typography>
      </Tooltip>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          width: '100%',
          justifyContent: 'flex-end',
        }}
      >
        <DdayBadge applyPeriodType={policy.applyPeriodType} applyEndDate={policy.applyEndDate} />

        <IconButton
          size="small"
          aria-label={isFavorite ? '관심 정책 해제' : '관심 정책 저장'}
          onClick={handleFavoriteClick}
          sx={{ color: isFavorite ? 'favorite.main' : 'text.disabled' }}
        >
          <AppIcon name={isFavorite ? 'heart' : 'heart-outline'} size={20} />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default PolicyRow;
