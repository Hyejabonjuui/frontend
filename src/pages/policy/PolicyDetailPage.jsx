import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import AppIcon from '@/components/common/AppIcon';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DdayBadge from '@/components/common/DdayBadge';
import ErrorState from '@/components/common/ErrorState';
import JudgeIcon from '@/components/common/JudgeIcon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CardNewsDialog from '@/components/policy/CardNewsDialog';
import TermText from '@/components/policy/TermText';
import { TOAST_MESSAGES } from '@/constants/messages';
import { ELIGIBILITY_CONDITION_LABELS, JUDGE_RESULT_BY_GROUP } from '@/constants/policy';
import { buildMyPagePath, MY_PAGE_TABS, ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { useLoginDialog } from '@/hooks/useLoginDialog';
import { useCardNewsDetail, usePolicyDetail } from '@/hooks/usePolicies';
import { useTerms } from '@/hooks/useTerms';
import { useToast } from '@/hooks/useToast';
import { RADIUS } from '@/styles/theme';
import { formatDateRange } from '@/utils/formatDate';

/** 설계서 S-06 오른쪽 카드 폭 */
const DETAIL_ASIDE_WIDTH = 380;
/** 본문과 카드를 나란히 둘 만큼 넓은 화면. 더 좁으면 카드가 본문 아래로 내려간다. */
const SIDE_BY_SIDE = '@media (min-width:1024px)';

/** 설계서 S-06 오른쪽 카드 공통 틀: 폭 380 · 여백 24 · 회색 바탕 */
const ASIDE_CARD_SX = { width: '100%', minWidth: 0, p: 3, backgroundColor: 'grey.100' };

/** 설계서 S-06 로그인: 종합 판정과 조건별 판정을 보여 준다. */
function JudgementCard({ judgements, summary, group }) {
  return (
    <Card variant="outlined" sx={ASIDE_CARD_SX}>
      <Stack spacing={1.75}>
        <Typography variant="subtitle1">내 조건으로 확인해 봤어요</Typography>

        {summary && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              px: 1.5,
              py: 1.25,
              border: 1,
              borderColor: 'grey.500',
              borderRadius: `${RADIUS.toast}px`,
              backgroundColor: 'background.paper',
            }}
          >
            {/* 옆 문장이 판정을 말해 주므로 아이콘은 화면 낭독기에 읽히지 않게 둔다. */}
            {group && (
              <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex' }}>
                <JudgeIcon result={JUDGE_RESULT_BY_GROUP[group]} size={24} />
              </Box>
            )}
            <Typography variant="body2">{summary}</Typography>
          </Stack>
        )}

        <Stack divider={<Divider />} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {judgements.map((judgement) => (
            <Stack
              key={judgement.conditionKey}
              direction="row"
              spacing={1.25}
              sx={{ alignItems: 'center', py: 1.25 }}
            >
              <JudgeIcon result={judgement.result} size={24} />
              <Typography variant="body2" sx={{ width: 52, flexShrink: 0 }}>
                {judgement.conditionName}
              </Typography>
              <Stack
                spacing={0.25}
                sx={{ flexGrow: 1, minWidth: 0, wordBreak: 'keep-all', overflowWrap: 'anywhere' }}
              >
                <Typography variant="caption" color="text.secondary">
                  조건: {judgement.requirement}
                </Typography>
                <Typography variant="caption">내 정보: {judgement.myValue}</Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>

        <Typography variant="caption" color="text.disabled">
          <AppIcon name="check" size={12} /> 충족 · <AppIcon name="cross" size={12} /> 미충족 ·{' '}
          <AppIcon name="question" size={12} /> 확인 필요 — 나이·지역·소득·취업은 코드로,
          무주택·추가 자격은 AI가 판정해요
        </Typography>

        <Link
          component={RouterLink}
          to={buildMyPagePath(MY_PAGE_TABS.CONDITION)}
          variant="body2"
          color="text.primary"
          underline="always"
          sx={{ alignSelf: 'flex-start' }}
        >
          내 조건 수정 <AppIcon name="arrow-right" size={16} />
        </Link>
      </Stack>
    </Card>
  );
}

/**
 * 설계서 S-06 비로그인. 비로그인 상세 응답에는 조건별 원문이 없다(conditions가 빈 목록).
 * 없는 값은 채우지 않고, 로그인하면 판정해 주는 조건만 설계서와 같은 표로 보여 준다.
 */
function GuestConditionsCard({ onLogin }) {
  return (
    <Card variant="outlined" sx={ASIDE_CARD_SX}>
      <Stack spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">신청 조건</Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
          >
            로그인하면 내 조건과 비교한 신청 가능 여부를 확인할 수 있어요.
          </Typography>
        </Stack>

        {Object.entries(ELIGIBILITY_CONDITION_LABELS).map(([conditionKey, conditionName]) => (
          <Stack
            key={conditionKey}
            direction="row"
            spacing={1.5}
            sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography variant="body2" sx={{ width: 72, flexShrink: 0 }}>
              {conditionName}
            </Typography>
            <Typography variant="body1" color="text.disabled">
              로그인 후 확인
            </Typography>
          </Stack>
        ))}

        <Stack
          spacing={1.25}
          sx={{
            p: 1.75,
            border: 1,
            borderColor: 'grey.500',
            borderRadius: `${RADIUS.toast}px`,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="body2" align="center">
            로그인하고 1초만에 확인하기
          </Typography>
          <Button variant="contained" fullWidth onClick={() => onLogin()}>
            로그인하고 확인하기
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

/** 설계서 S-06 본문 블록: 제목 15/22 굵게, 내용과 8px 간격 */
function DetailSection({ label, children }) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1">{label}</Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
        {children}
      </Typography>
    </Stack>
  );
}

function PolicyDetailPage() {
  const { policyId } = useParams();
  const { isAuthenticated } = useAuth();
  const { openLoginDialog } = useLoginDialog();
  const { showError } = useToast();
  const { policy, isLoading, errorMessage, refetch } = usePolicyDetail(policyId);
  const { isFavorite, toggleFavorite } = useFavoriteToggle();
  const terms = useTerms();
  const wasAuthenticatedRef = useRef(isAuthenticated);
  const [cardNewsPolicyId, setCardNewsPolicyId] = useState(null);
  // 다른 정책 상세로 옮겨 가면 열어 둔 카드뉴스는 닫힌 것으로 본다.
  const requestedCardNewsId = cardNewsPolicyId === policyId ? policyId : null;
  const cardNewsState = useCardNewsDetail(requestedCardNewsId);

  useEffect(() => {
    if (!wasAuthenticatedRef.current && isAuthenticated) {
      refetch();
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, refetch]);

  // 카드뉴스를 못 불러오면 팝업 대신 오류 토스트로 알린다.
  useEffect(() => {
    if (cardNewsState.errorMessage) {
      showError(cardNewsState.errorMessage);
    }
  }, [cardNewsState.errorMessage, showError]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={refetch} />;
  }

  if (!policy) {
    return null;
  }

  const handleApplyClick = () => {
    if (!policy.applyUrl) {
      showError(TOAST_MESSAGES.APPLY_LINK_MISSING);
      return;
    }

    window.open(policy.applyUrl, '_blank', 'noopener');
  };

  const handleCardNewsClick = () => {
    if (requestedCardNewsId && cardNewsState.errorMessage) {
      cardNewsState.refetch();
      return;
    }

    setCardNewsPolicyId(policyId);
  };

  const saved = isFavorite(policy.id, policy.isFavorite);

  return (
    <Stack spacing={4}>
      <Stack component="header" spacing={1.5}>
        <Breadcrumbs separator={<AppIcon name="chevron-right" size={14} />}>
          <Link
            component={RouterLink}
            to={ROUTES.HOME}
            variant="caption"
            color="text.secondary"
            underline="hover"
          >
            주거 정책
          </Link>
          <Typography variant="caption" color="text.secondary">
            {policy.subtypeName}
          </Typography>
        </Breadcrumbs>

        <Stack
          direction="row"
          spacing={1.5}
          useFlexGap
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Chip label={policy.subtypeName} variant="outlined" size="small" />
          <Typography variant="h1" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            {policy.title}
          </Typography>
          <DdayBadge applyPeriodType={policy.applyPeriodType} applyEndDate={policy.applyEndDate} />
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', pt: 0.5 }}>
          <Button
            variant="outlined"
            startIcon={<AppIcon name={saved ? 'heart' : 'heart-outline'} size={20} />}
            onClick={() => toggleFavorite(policy.id, saved)}
            sx={{ '& .MuiButton-startIcon': { color: saved ? 'favorite.main' : 'inherit' } }}
          >
            {saved ? '관심 해제' : '관심 저장'}
          </Button>

          <Button
            variant="outlined"
            loading={Boolean(requestedCardNewsId) && cardNewsState.isLoading}
            onClick={handleCardNewsClick}
          >
            카드뉴스로 보기
          </Button>

          <Button variant="contained" onClick={handleApplyClick}>
            신청하러 가기 <AppIcon name="arrow-up-right" size={16} />
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          minWidth: 0,
          [SIDE_BY_SIDE]: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
        }}
      >
        <Stack spacing={3.5} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <DetailSection label="어떤 정책인가요">{policy.description}</DetailSection>
          <DetailSection label="지원 내용">{policy.benefit}</DetailSection>
          <DetailSection label="신청 기간">
            {formatDateRange(policy.applyStartDate, policy.applyEndDate)}
          </DetailSection>
          <DetailSection label="신청 방법">{policy.applyMethod}</DetailSection>
          {policy.extraQualification && (
            <Stack spacing={1}>
              <Typography variant="subtitle1">추가 자격</Typography>
              <TermText text={policy.extraQualification} terms={terms} />
              <Typography variant="caption" color="text.disabled">
                밑줄 친 단어에 마우스를 올리면 쉬운 설명이 나와요
              </Typography>
            </Stack>
          )}
        </Stack>

        {(!isAuthenticated || policy.judgements?.length > 0) && (
          <Box
            sx={{
              width: '100%',
              flexShrink: 0,
              [SIDE_BY_SIDE]: { width: `min(${DETAIL_ASIDE_WIDTH}px, 36vw)` },
            }}
          >
            {isAuthenticated ? (
              <JudgementCard
                judgements={policy.judgements}
                summary={policy.judgementSummary}
                group={policy.judgementGroup}
              />
            ) : (
              <GuestConditionsCard onLogin={openLoginDialog} />
            )}
          </Box>
        )}
      </Box>

      <CardNewsDialog
        cardNews={cardNewsState.cardNews}
        onClose={() => setCardNewsPolicyId(null)}
        isFavorite={saved}
        onToggleFavorite={() => toggleFavorite(policy.id, saved)}
        isOpenedFromDetail
      />
    </Stack>
  );
}

export default PolicyDetailPage;
