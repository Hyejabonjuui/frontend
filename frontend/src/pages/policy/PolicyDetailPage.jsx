import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
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
import { buildMyPagePath, MY_PAGE_TABS, ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { usePolicyDetail } from '@/hooks/usePolicies';
import { useTerms } from '@/hooks/useTerms';
import { useToast } from '@/hooks/useToast';
import { formatDateRange } from '@/utils/formatDate';

function JudgementCard({ judgements, summary }) {
  return (
    <Card variant="outlined" sx={{ p: 2, backgroundColor: 'grey.100' }}>
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        내 조건으로 확인해 봤어요
      </Typography>

      {summary && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            p: 1.5,
            mb: 1.5,
            borderRadius: 1,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="body1">{summary}</Typography>
        </Stack>
      )}

      <Stack divider={<Divider />}>
        {judgements.map((judgement) => (
          <Stack
            key={judgement.conditionKey}
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', py: 1.5 }}
          >
            <JudgeIcon result={judgement.result} size={22} />
            <Typography variant="body2" sx={{ width: 56 }}>
              {judgement.conditionName}
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" component="div">
                조건: {judgement.requirement}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                내 정보: {judgement.myValue}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        ✓ 충족 · ✗ 미충족 · ? 확인 필요 — 나이·지역·소득·취업은 코드로, 무주택·추가 자격은 AI가
        판정해요
      </Typography>

      <Link
        component={RouterLink}
        to={buildMyPagePath(MY_PAGE_TABS.CONDITION)}
        variant="body1"
        sx={{ mt: 1.5 }}
      >
        내 조건 수정 →
      </Link>
    </Card>
  );
}

function DetailSection({ label, children }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
        {children}
      </Typography>
    </Stack>
  );
}

function PolicyDetailPage() {
  const { policyId } = useParams();
  const { isAuthenticated } = useAuth();
  const { showError } = useToast();
  const { policy, isLoading, errorMessage, refetch } = usePolicyDetail(policyId);
  const { isFavorite, toggleFavorite } = useFavorites();
  const terms = useTerms();
  const [isCardNewsOpen, setIsCardNewsOpen] = useState(false);

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

  const saved = isFavorite(policy.id);

  return (
    <Stack spacing={3}>
      <Breadcrumbs separator="›">
        <Link component={RouterLink} to={ROUTES.HOME} variant="caption" color="text.secondary">
          주거 정책
        </Link>
        <Typography variant="caption" color="text.secondary">
          {policy.subtypeName}
        </Typography>
      </Breadcrumbs>

      <Stack component="header" spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip label={policy.subtypeName} variant="outlined" size="small" />
          <Typography variant="h1">{policy.title}</Typography>
          <DdayBadge applyPeriodType={policy.applyPeriodType} applyEndDate={policy.applyEndDate} />
        </Stack>

        <Typography variant="body1" color="text.secondary">
          {policy.organization} · {policy.regionName}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Icon icon={saved ? 'mdi:heart' : 'mdi:heart-outline'} width={20} />}
            onClick={() => toggleFavorite(policy.id)}
            sx={{ '& .MuiButton-startIcon': { color: saved ? 'favorite.main' : 'inherit' } }}
          >
            {saved ? '관심 해제' : '관심 저장'}
          </Button>

          <Button variant="outlined" onClick={() => setIsCardNewsOpen(true)}>
            카드뉴스로 보기
          </Button>

          <Button variant="contained" onClick={handleApplyClick}>
            신청하러 가기 ↗
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: 'flex-start' }}>
        <Stack spacing={3} sx={{ flex: 1 }}>
          <DetailSection label="어떤 정책인가요">{policy.description}</DetailSection>
          <DetailSection label="지원 내용">{policy.benefit}</DetailSection>
          <DetailSection label="신청 기간">
            {formatDateRange(policy.applyStartDate, policy.applyEndDate)}
          </DetailSection>
          <DetailSection label="신청 방법">{policy.applyMethod}</DetailSection>
          {policy.extraQualification && (
            <Stack spacing={0.5}>
              <Typography variant="body2">추가 자격</Typography>
              <TermText text={policy.extraQualification} terms={terms} />
              <Typography variant="caption" color="text.disabled">
                밑줄 친 단어에 마우스를 올리면 쉬운 설명이 나와요
              </Typography>
            </Stack>
          )}
        </Stack>

        {isAuthenticated && policy.judgements?.length > 0 && (
          <Box sx={{ width: { xs: '100%', md: 340 }, flexShrink: 0 }}>
            <JudgementCard judgements={policy.judgements} summary={policy.judgementSummary} />
          </Box>
        )}
      </Stack>

      <CardNewsDialog
        cardNews={isCardNewsOpen ? policy.cardNews : null}
        onClose={() => setIsCardNewsOpen(false)}
        isFavorite={saved}
        onToggleFavorite={toggleFavorite}
      />
    </Stack>
  );
}

export default PolicyDetailPage;
