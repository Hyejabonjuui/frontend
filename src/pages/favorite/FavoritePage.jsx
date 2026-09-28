import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AppIcon from '@/components/common/AppIcon';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import ListPagination from '@/components/common/ListPagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FavoriteRow from '@/components/policy/FavoriteRow';
import PolicySearchField from '@/components/policy/PolicySearchField';
import { EMPTY_MESSAGES } from '@/constants/messages';
import { POLICY_PAGE_SIZE } from '@/constants/policy';
import { ROUTES } from '@/constants/routes';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { useFavorites } from '@/hooks/useFavorites';

function FavoritePage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const { favorites, totalCount, totalPages, isLoading, errorMessage, reload, refetch } =
    useFavorites({ keyword, page, size: POLICY_PAGE_SIZE });
  const { toggleFavorite } = useFavoriteToggle();
  // 해제로 마지막 페이지가 비면 남아 있는 마지막 페이지를 보여 준다.
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  if (currentPage !== page) {
    setPage(currentPage);
  }

  const handleSearch = (nextKeyword) => {
    setKeyword(nextKeyword);
    setPage(1);
  };

  const handleRemove = async (policyId) => {
    await toggleFavorite(policyId, true);
    reload();
  };

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h1">관심 정책</Typography>
        <Typography variant="body1" color="text.secondary">
          <AppIcon name="heart-outline" size={14} /> 저장한 정책을 모아 두는 곳이에요.
        </Typography>
      </Stack>

      <Stack sx={{ alignItems: 'flex-end' }}>
        <PolicySearchField placeholder="관심 정책 검색" onSearch={handleSearch} />
      </Stack>

      {isLoading && <LoadingSpinner />}

      {!isLoading && errorMessage && <ErrorState message={errorMessage} onRetry={refetch} />}

      {!isLoading && !errorMessage && favorites.length === 0 && keyword && (
        <EmptyState
          isFramed
          title={EMPTY_MESSAGES.FAVORITE_SEARCH}
          description={EMPTY_MESSAGES.FAVORITE_SEARCH_DESCRIPTION}
        />
      )}

      {!isLoading && !errorMessage && favorites.length === 0 && !keyword && (
        <EmptyState
          isFramed
          title={EMPTY_MESSAGES.FAVORITE}
          description={
            <>
              정책 옆{' '}
              <Box component="span" role="img" aria-label="하트" sx={{ color: 'text.primary' }}>
                <AppIcon name="heart-outline" size={14} />
              </Box>
              를 누르면 여기 모이고, 마감 7일 전에 알려드려요
            </>
          }
          action={
            <Button component={RouterLink} to={ROUTES.HOME} variant="outlined" size="small">
              주거 정책 보러 가기
            </Button>
          }
        />
      )}

      {!isLoading && !errorMessage && favorites.length > 0 && (
        <Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', pb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {keyword ? `'${keyword}' 검색 결과 ${totalCount}건` : `${totalCount}건`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              최근 저장순
            </Typography>
          </Stack>

          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {favorites.map((favorite) => (
              <FavoriteRow key={favorite.policyId} favorite={favorite} onRemove={handleRemove} />
            ))}
          </Box>

          <ListPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </Box>
      )}
    </Stack>
  );
}

export default FavoritePage;
