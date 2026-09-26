import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AppIcon from '@/components/common/AppIcon';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FavoriteRow from '@/components/policy/FavoriteRow';
import PolicySearchField from '@/components/policy/PolicySearchField';
import { EMPTY_MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { useFavorites } from '@/hooks/useFavorites';
import { compareByDeadline } from '@/utils/formatDate';

function FavoritePage() {
  const { favorites, isLoading, errorMessage, toggleFavorite, refetch } = useFavorites();

  // 설계서 S-14: 목록은 마감 임박순으로 보여 준다.
  const visibleFavorites = useMemo(
    () =>
      favorites
        .filter((favorite) => favorite.policy)
        .sort((a, b) => compareByDeadline(a.policy, b.policy)),
    [favorites],
  );

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h1">관심 정책</Typography>
        <Typography variant="body1" color="text.secondary">
          <AppIcon name="heart-outline" size={14} /> 저장한 정책을 모아 두고, 마감 7일 전에 알려드려요.
        </Typography>
      </Stack>

      <Stack sx={{ alignItems: 'flex-end' }}>
        <PolicySearchField />
      </Stack>

      {isLoading && <LoadingSpinner />}

      {!isLoading && errorMessage && <ErrorState message={errorMessage} onRetry={refetch} />}

      {!isLoading && !errorMessage && visibleFavorites.length === 0 && (
        <EmptyState
          isFramed
          title={EMPTY_MESSAGES.FAVORITE}
          description={EMPTY_MESSAGES.FAVORITE_DESCRIPTION}
          action={
            <Button component={RouterLink} to={ROUTES.HOME} variant="outlined">
              주거 정책 보러 가기
            </Button>
          }
        />
      )}

      {!isLoading && !errorMessage && visibleFavorites.length > 0 && (
        <Box>
          <Stack direction="row" sx={{ justifyContent: 'flex-end', pb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              마감 임박순
            </Typography>
          </Stack>

          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {visibleFavorites.map((favorite) => (
              <FavoriteRow key={favorite.policyId} favorite={favorite} onRemove={toggleFavorite} />
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}

export default FavoritePage;
