import { Link as RouterLink } from 'react-router-dom';
import AppIcon from '@/components/common/AppIcon';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DdayBadge from '@/components/common/DdayBadge';
import { buildPolicyDetailPath } from '@/constants/routes';
import { isApplyClosed } from '@/utils/formatDate';

/** 설계서 S-14: 행을 누르면 정책 상세(S-06)로 가고, ♥만 관심 해제로 동작한다. */
function FavoriteRow({ favorite, onRemove }) {
  const { policy } = favorite;
  const isClosed = isApplyClosed(policy);

  const handleRemoveClick = (event) => {
    event.preventDefault();
    onRemove(policy.id);
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
        // 설계서 S-14: 마감된 정책도 목록에는 남기되 흐리게 둔다.
        backgroundColor: isClosed ? 'grey.100' : 'transparent',
        '&:hover': { backgroundColor: 'grey.100' },
      }}
    >
      <Chip label={policy.subtypeName} variant="outlined" size="small" sx={{ flexShrink: 0 }} />

      <Typography
        variant="body2"
        color={isClosed ? 'text.disabled' : 'text.primary'}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: 'calc(100% - 110px)', sm: 'auto' },
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
        }}
      >
        {policy.title}
        {isClosed && (
          <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1 }}>
            신청 기간이 끝났어요
          </Typography>
        )}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ display: { xs: 'none', sm: 'block' }, width: 100, textAlign: 'right' }}
      >
        {policy.regionName}
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
          aria-label="관심 정책 해제"
          onClick={handleRemoveClick}
          sx={{ color: 'favorite.main' }}
        >
          <AppIcon name="heart" size={20} />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default FavoriteRow;
