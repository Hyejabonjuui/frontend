import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import PolicySearchBar from '@/components/policy/PolicySearchBar';
import SearchCriteriaSummary from '@/components/search/SearchCriteriaSummary';
import SearchResultGroup from '@/components/search/SearchResultGroup';
import SearchResultSkeleton from '@/components/search/SearchResultSkeleton';
import { EMPTY_MESSAGES, LOGIN_NOTICE, TOAST_MESSAGES } from '@/constants/messages';
import {
  POLICY_SEARCH_HASHTAGS,
  RECOMMENDATION_GROUP,
  RECOMMENDATION_GROUP_LABEL,
} from '@/constants/policy';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { useLoginDialog } from '@/hooks/useLoginDialog';
import { useMyConditions } from '@/hooks/useMyConditions';
import { usePolicySearch } from '@/hooks/usePolicySearch';
import { useToast } from '@/hooks/useToast';
import ConditionEditDialog from '@/pages/search/ConditionEditDialog';
import { LAYOUT } from '@/styles/theme';
import { withDirectionParticle } from '@/utils/koreanParticle';

const GROUP_ORDER = [
  RECOMMENDATION_GROUP.POSSIBLE,
  RECOMMENDATION_GROUP.NEED_CHECK,
  RECOMMENDATION_GROUP.IMPOSSIBLE,
];

/**
 * 백엔드는 "#월세"처럼 해시태그 그대로인 검색어만 AI 없이 그 유형으로 찾는다.
 * 이때만 검색 유형을 확실히 알 수 있다. 자유 문장은 AI가 고른 유형을 응답에 주지 않는다.
 */
const findSearchedHashtag = (query) =>
  POLICY_SEARCH_HASHTAGS.find((hashtag) => query.trim() === `#${hashtag}`);

function PolicySearchPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('query') ?? '';
  const { isAuthenticated } = useAuth();
  const { openLoginNotice } = useLoginDialog();
  const { showInfo, showSuccess } = useToast();
  const [searchKeyword, setSearchKeyword] = useState(searchQuery);
  const [syncedQuery, setSyncedQuery] = useState(searchQuery);
  const [isConditionDialogOpen, setIsConditionDialogOpen] = useState(false);
  const { groups, groupCounts, totalCount, isIdle, isLoading, errorMessage, refetch } =
    usePolicySearch({ query: searchQuery }, { historyKey: location.key });
  const { isFavorite, toggleFavorite } = useFavoriteToggle();
  // 검색 API는 서버에 저장된 내 조건으로 판정한다. 요약·칩·조건 수정 기본값 모두 이 한 곳을 본다.
  const {
    conditions,
    appliedConditions,
    refetch: refetchConditions,
  } = useMyConditions({ redirectOnMissingProfile: false });

  // 뒤로·앞으로 가기로 주소의 검색어가 바뀌면 검색창도 그 검색어로 맞춘다.
  if (syncedQuery !== searchQuery) {
    setSyncedQuery(searchQuery);
    setSearchKeyword(searchQuery);
  }

  const isSearchedPolicyFavorite = (policyId) =>
    isFavorite(
      policyId,
      GROUP_ORDER.flatMap((group) => groups[group]).find(
        (policy) => String(policy.id) === String(policyId),
      )?.isFavorite,
    );

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

  const openConditionDialog = () => setIsConditionDialogOpen(true);

  /** 바뀐 내 조건으로 같은 검색어를 다시 묻는다. 이전 조건으로 저장해 둔 결과는 조건 저장 때 이미 지웠다. */
  const handleConditionSaved = () => {
    setIsConditionDialogOpen(false);
    refetchConditions();
    refetch();
  };

  const searchedHashtag = findSearchedHashtag(searchQuery);
  const hasResult = !isIdle && !isLoading && !errorMessage;
  const canEditConditions = Boolean(conditions);

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: LAYOUT.searchColumnWidth, mx: 'auto' }}>
      <Stack component="section" spacing={1}>
        <PolicySearchBar
          keyword={searchKeyword}
          onKeywordChange={setSearchKeyword}
          onSubmit={handleSearch}
          onRequestLogin={isAuthenticated ? undefined : () => openLoginNotice(LOGIN_NOTICE.SEARCH)}
          isCompact
        />

        {!isIdle && !errorMessage && (
          <SearchCriteriaSummary
            typeLabel={searchedHashtag ? `${searchedHashtag} 유형으로 찾았어요` : ''}
            conditions={appliedConditions}
            action={
              hasResult &&
              totalCount > 0 &&
              canEditConditions && (
                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  onClick={openConditionDialog}
                >
                  조건 수정
                </Link>
              )
            }
          />
        )}
      </Stack>

      {/* 설계서 S-05 로딩: AI 응답을 기다리는 동안 결과와 같은 뼈대를 보여 준다. */}
      {isLoading && <SearchResultSkeleton />}

      {!isLoading && errorMessage && <ErrorState message={errorMessage} onRetry={refetch} />}

      {isIdle && !isAuthenticated && (
        <Typography variant="body1" color="text.secondary">
          로그인하면 내 조건으로 판정해드려요
        </Typography>
      )}

      {hasResult && totalCount === 0 && (
        <EmptyState
          isFramed
          title={EMPTY_MESSAGES.SEARCH}
          description={EMPTY_MESSAGES.SEARCH_DESCRIPTION}
          action={
            <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
              {appliedConditions.length > 0 && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  useFlexGap
                  aria-label="적용된 내 조건"
                  sx={{ justifyContent: 'center', flexWrap: 'wrap' }}
                >
                  {appliedConditions.map((condition) => (
                    <Chip key={condition} label={condition} variant="outlined" size="small" />
                  ))}
                </Stack>
              )}

              <Button
                variant="outlined"
                disabled={!canEditConditions}
                onClick={openConditionDialog}
              >
                조건 수정
              </Button>
              <Typography variant="caption" color="text.secondary">
                수정한 조건은 내 정보에도 반영돼요.
              </Typography>
            </Stack>
          }
        />
      )}

      {hasResult && totalCount > 0 && (
        <>
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

          {GROUP_ORDER.map((group) => (
            <SearchResultGroup
              key={group}
              group={group}
              policies={groups[group]}
              isFavorite={isSearchedPolicyFavorite}
              onToggleFavorite={(policyId) =>
                toggleFavorite(policyId, isSearchedPolicyFavorite(policyId))
              }
            />
          ))}
        </>
      )}

      <ConditionEditDialog
        isOpen={isConditionDialogOpen}
        conditions={conditions}
        onClose={() => setIsConditionDialogOpen(false)}
        onSaved={handleConditionSaved}
      />
    </Stack>
  );
}

export default PolicySearchPage;
