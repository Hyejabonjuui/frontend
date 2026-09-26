import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import CardHeroSection from '@/components/policy/CardHeroSection';
import CardNewsDialog from '@/components/policy/CardNewsDialog';
import PolicyFilterTabs from '@/components/policy/PolicyFilterTabs';
import PolicyList from '@/components/policy/PolicyList';
import PolicySearchBar from '@/components/policy/PolicySearchBar';
import { ERROR_MESSAGES, LOGIN_NOTICE, VALIDATION_MESSAGES } from '@/constants/messages';
import { POLICY_PAGE_SIZE, POLICY_SORT_OPTIONS, POLICY_SUBTYPES } from '@/constants/policy';
import { buildMyPagePath, MY_PAGE_TABS, ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useCardNews, usePolicies } from '@/hooks/usePolicies';
import { useFavorites } from '@/hooks/useFavorites';
import { useLoginDialog } from '@/hooks/useLoginDialog';
import { useToast } from '@/hooks/useToast';

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { openLoginDialog, openLoginNotice } = useLoginDialog();
  const { showError } = useToast();
  const [keyword, setKeyword] = useState('');
  const [subtype, setSubtype] = useState(POLICY_SUBTYPES[0].value);
  const [sort, setSort] = useState(POLICY_SORT_OPTIONS[0].value);
  const [onlyMatched, setOnlyMatched] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCardNews, setSelectedCardNews] = useState(null);
  const [searchError, setSearchError] = useState('');

  const cardNewsState = useCardNews();
  const { policies, totalCount, totalPages, isLoading, errorMessage, refetch } = usePolicies({
    subtype,
    sort,
    onlyMatched,
    page,
    size: POLICY_PAGE_SIZE,
  });
  const { isFavorite, toggleFavorite } = useFavorites();

  // 설계서 S-01: 목록이나 카드뉴스를 못 불러오면 오류 toast로 알린다.
  useEffect(() => {
    if (errorMessage || cardNewsState.errorMessage) {
      showError(ERROR_MESSAGES.POLICY_LOAD_FAILED);
    }
  }, [errorMessage, cardNewsState.errorMessage, showError]);

  const handleSearch = (searchKeyword) => {
    if (!isAuthenticated) {
      openLoginNotice(LOGIN_NOTICE.SEARCH);
      return;
    }

    if (!searchKeyword.trim()) {
      setSearchError(VALIDATION_MESSAGES.REQUIRED_SEARCH_KEYWORD);
      return;
    }

    setSearchError('');
    navigate(`${ROUTES.RECOMMENDATION}?keyword=${encodeURIComponent(searchKeyword)}`);
  };

  /** 목록 조건이 바뀌면 항상 첫 페이지부터 다시 본다. */
  const changeListOption = (apply) => {
    apply();
    setPage(1);
  };

  return (
    <Stack spacing={{ xs: 4, sm: 5, md: 6 }}>
      <Stack component="section" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="h1" sx={{ textAlign: 'center' }}>
          받을 수 있는 주거 혜택, 한 번에 찾아요
        </Typography>

        <PolicySearchBar
          keyword={keyword}
          onKeywordChange={(value) => {
            setKeyword(value);
            if (searchError) {
              setSearchError('');
            }
          }}
          onSubmit={handleSearch}
          errorMessage={searchError}
          onRequestLogin={isAuthenticated ? undefined : () => openLoginNotice(LOGIN_NOTICE.SEARCH)}
        />

        {isAuthenticated ? (
          user.conditionSummary && (
            <Typography variant="caption" color="text.secondary">
              {user.conditionSummary} 기준으로 찾아요{' '}
              <Link component={RouterLink} to={buildMyPagePath(MY_PAGE_TABS.CONDITION)}>
                조건 수정
              </Link>
            </Typography>
          )
        ) : (
          <Typography variant="caption" color="text.secondary">
            로그인하면 내 조건으로 판정해드려요{' '}
            <Link component="button" type="button" onClick={() => openLoginDialog()}>
              로그인
            </Link>
          </Typography>
        )}
      </Stack>

      <Box component="section">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { xs: 'flex-start', sm: 'baseline' }, mb: 2 }}
        >
          <Typography variant="h2">혜자가 추천해요</Typography>
          <Typography variant="caption" color="text.secondary">
            마감이 가깝고 많이 본 정책이에요 · 누르면 카드뉴스 4장을 한 번에 보여드려요
          </Typography>
        </Stack>

        <CardHeroSection
          cardNewsList={cardNewsState.cardNewsList}
          isLoading={cardNewsState.isLoading}
          errorMessage={cardNewsState.errorMessage}
          onSelect={setSelectedCardNews}
        />
      </Box>

      <Box component="section">
        <Typography variant="h2" sx={{ mb: 2 }}>
          주거 정책
        </Typography>

        <PolicyFilterTabs
          subtype={subtype}
          onSubtypeChange={(nextSubtype) => changeListOption(() => setSubtype(nextSubtype))}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Select
              value={sort}
              size="small"
              onChange={(event) => changeListOption(() => setSort(event.target.value))}
              aria-label="정렬 기준"
            >
              {POLICY_SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>

            {!isLoading && !errorMessage && (
              <Typography variant="body1" color="text.secondary">
                신청 중 {totalCount}건
              </Typography>
            )}
          </Stack>

          {isAuthenticated && (
            <FormControlLabel
              control={
                <Switch
                  checked={onlyMatched}
                  onChange={(event) => changeListOption(() => setOnlyMatched(event.target.checked))}
                />
              }
              label={<Typography variant="body1">나에게 맞는 것만</Typography>}
              labelPlacement="start"
            />
          )}
        </Stack>

        <PolicyList
          policies={policies}
          isLoading={isLoading}
          errorMessage={errorMessage}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onRetry={refetch}
        />
      </Box>

      <CardNewsDialog
        cardNews={selectedCardNews}
        onClose={() => setSelectedCardNews(null)}
        isFavorite={selectedCardNews ? isFavorite(selectedCardNews.policyId) : false}
        onToggleFavorite={toggleFavorite}
      />
    </Stack>
  );
}

export default HomePage;
