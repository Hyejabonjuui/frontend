import { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import PolicySearchBar from '@/components/policy/PolicySearchBar';
import SearchResultGroup from '@/components/search/SearchResultGroup';
import SearchResultSkeleton from '@/components/search/SearchResultSkeleton';
import { EMPTY_MESSAGES, LOGIN_NOTICE, TOAST_MESSAGES } from '@/constants/messages';
import { RECOMMENDATION_GROUP, RECOMMENDATION_GROUP_LABEL } from '@/constants/policy';
import { buildMyPagePath, MY_PAGE_TABS, ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useLoginDialog } from '@/hooks/useLoginDialog';
import { usePolicySearch } from '@/hooks/usePolicySearch';
import { useToast } from '@/hooks/useToast';
import { withDirectionParticle } from '@/utils/koreanParticle';

const GROUP_ORDER = [
  RECOMMENDATION_GROUP.POSSIBLE,
  RECOMMENDATION_GROUP.NEED_CHECK,
  RECOMMENDATION_GROUP.IMPOSSIBLE,
];

function PolicySearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('query') ?? '';
  const { isAuthenticated } = useAuth();
  const { openLoginNotice } = useLoginDialog();
  const { showInfo, showSuccess } = useToast();
  const [searchKeyword, setSearchKeyword] = useState(searchQuery);
  const {
    groups,
    groupCounts,
    totalCount,
    query,
    isAiFailed,
    isIdle,
    isLoading,
    errorMessage,
    refetch,
  } = usePolicySearch({ query: searchQuery });
  const { isFavorite, toggleFavorite } = useFavorites();

  // 설계서 S-05: 후보가 없으면 안내 toast를 함께 띄운다.
  useEffect(() => {
    if (!isIdle && !isLoading && !errorMessage && totalCount === 0) {
      showInfo(TOAST_MESSAGES.NO_CANDIDATE);
    }
  }, [isIdle, isLoading, errorMessage, totalCount, showInfo]);

  const handleSearch = (nextKeyword) => {
    const nextQuery = nextKeyword.trim();

    if (!nextQuery) {
      return;
    }

    // 같은 검색어는 URL이 그대로라 요청이 나가지 않는다. 실패했던 검색만 다시 요청한다.
    if (nextQuery === searchQuery) {
      if (errorMessage) {
        refetch();
      } else {
        showSuccess(`${withDirectionParticle(nextQuery)} ${TOAST_MESSAGES.SEARCHED}`);
      }
      return;
    }

    setSearchParams({ query: nextQuery });
  };

  return (
    <Stack spacing={4}>
      <Stack component="section" spacing={2} sx={{ alignItems: 'center' }}>
        <PolicySearchBar
          keyword={searchKeyword}
          onKeywordChange={setSearchKeyword}
          onSubmit={handleSearch}
          onRequestLogin={isAuthenticated ? undefined : () => openLoginNotice(LOGIN_NOTICE.SEARCH)}
        />
      </Stack>

      {/* 설계서 S-05 로딩: AI 응답을 기다리는 동안 결과와 같은 뼈대를 보여 준다. */}
      {isLoading && <SearchResultSkeleton />}

      {!isLoading && errorMessage && <ErrorState message={errorMessage} onRetry={refetch} />}

      {isIdle && !isAuthenticated && (
        <Typography variant="body1" color="text.secondary">
          로그인하면 내 조건으로 판정해드려요
        </Typography>
      )}

      {!isIdle && !isLoading && !errorMessage && (
        <>
          <Stack component="section" spacing={1.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {query?.matchedSubtypeName && (
                <Chip
                  label={`'${query.matchedSubtypeName}' 유형으로 찾았어요`}
                  size="small"
                  variant="outlined"
                />
              )}
              {query?.conditionSummary && (
                <Typography variant="body1" color="text.secondary">
                  적용된 내 조건: {query.conditionSummary}{' '}
                  <Link component={RouterLink} to={buildMyPagePath(MY_PAGE_TABS.CONDITION)}>
                    조건 수정
                  </Link>
                </Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {GROUP_ORDER.map((group) => (
                <Typography key={group} variant="body2">
                  {RECOMMENDATION_GROUP_LABEL[group]}{' '}
                  <Typography component="span" variant="body1" color="text.secondary">
                    {groupCounts[group] ?? 0}건
                  </Typography>
                </Typography>
              ))}
            </Stack>
          </Stack>

          {isAiFailed && <Alert severity="warning">{TOAST_MESSAGES.AI_FAILED}</Alert>}

          {totalCount === 0 ? (
            <EmptyState
              isFramed
              title={EMPTY_MESSAGES.SEARCH}
              description={EMPTY_MESSAGES.SEARCH_DESCRIPTION}
              caption={EMPTY_MESSAGES.SEARCH_CAPTION}
              action={
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                  <Button
                    component={RouterLink}
                    to={buildMyPagePath(MY_PAGE_TABS.CONDITION)}
                    variant="outlined"
                  >
                    내 조건 수정
                  </Button>
                  <Button component={RouterLink} to={ROUTES.HOME} variant="text">
                    전체 정책 보기
                  </Button>
                </Stack>
              }
            />
          ) : (
            GROUP_ORDER.map((group) => (
              <SearchResultGroup
                key={group}
                group={group}
                policies={groups[group]}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            ))
          )}
        </>
      )}
    </Stack>
  );
}

export default PolicySearchPage;
