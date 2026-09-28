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

function PolicyRow({
  policy,
  isFavorite = false,
  onToggleFavorite,
  memberRegionCode = null,
  sidoRegions = [],
}) {
  const regionSummary = summarizePolicyRegions({
    regions: policy.regions,
    nationwide: policy.nationwide,
    memberRegionCode,
    sidoRegions,
  });
  const isRegionSummarized = regionSummary.regionLabels.length > 1;

  const handleFavoriteClick = (event) => {
    event.preventDefault();
    onToggleFavorite?.(policy.id);
  };

  return (
    <Box
      component={RouterLink}
      to={buildPolicyDetailPath(policy.id)}
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: 2,
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'inherit',
        textDecoration: 'none',
        '&:hover': { backgroundColor: 'grey.100' },
      }}
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

      <Typography
        variant="body1"
        color="text.secondary"
        noWrap
        sx={{
          flex: { xs: '1 1 0', sm: '0 0 200px' },
          minWidth: 0,
          textAlign: { xs: 'left', sm: 'right' },
          ml: { xs: 0, sm: 'auto' },
        }}
      >
        {isRegionSummarized ? (
          <>
            <Tooltip
              arrow
              describeChild
              title={regionSummary.regionLabels.join('\n')}
              slotProps={{ tooltip: { sx: { whiteSpace: 'pre-line' } } }}
            >
              <Box component="span" tabIndex={0}>
                {regionSummary.label}
              </Box>
            </Tooltip>
            <Box component="span" sx={VISUALLY_HIDDEN_SX}>
              대상 지역 전체: {regionSummary.regionLabels.join(', ')}
            </Box>
          </>
        ) : (
          regionSummary.label
        )}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          width: { xs: 'auto', sm: 110 },
          ml: { xs: 'auto', sm: 0 },
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
