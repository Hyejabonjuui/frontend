import { useState } from 'react';
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
import { buildMyPagePath, MY_PAGE_TABS, ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useLoginDialog } from '@/hooks/useLoginDialog';
import { usePolicyDetail } from '@/hooks/usePolicies';
import { useTerms } from '@/hooks/useTerms';
import { useToast } from '@/hooks/useToast';
import { formatDateRange } from '@/utils/formatDate';

function JudgementCard({ judgements, summary }) {
  return (
    <Card variant="outlined" sx={{ p: 2, flex: 1, backgroundColor: 'grey.100' }}>
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
        <AppIcon name="check" size={12} /> 충족 · <AppIcon name="cross" size={12} /> 미충족 · <AppIcon name="question" size={12} /> 확인 필요 — 나이·지역·소득·취업은 코드로, 무주택·추가 자격은 AI가
        판정해요
      </Typography>

      <Link
        component={RouterLink}
        to={buildMyPagePath(MY_PAGE_TABS.CONDITION)}
        variant="body1"
        sx={{ mt: 1.5 }}
      >
        내 조건 수정 <AppIcon name="arrow-right" size={16} />
      </Link>
    </Card>
  );
}

function RawConditionsCard({ conditions, onLogin }) {
  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        minWidth: 0,
        height: { xs: 'auto', sm: '100%' },
        p: 3,
        alignSelf: { xs: 'flex-start', sm: 'stretch' },
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'grey.100',
      }}
    >
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        신청 조건 (공고 원문)
      </Typography>

      <Stack
        divider={<Divider flexItem />}
        sx={{ minWidth: 0, flexGrow: { xs: 0, sm: 1 } }}
      >
        {conditions.map((condition) => (
          <Stack
            key={condition.key}
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: { xs: 'flex-start', sm: 'center' },
              flex: { xs: '0 0 auto', sm: '1 1 0' },
              py: 1,
              minWidth: 0,
            }}
          >
            <Typography variant="body2" sx={{ width: 72, flexShrink: 0 }}>
              {condition.label}
            </Typography>
            <Typography
              variant="body1"
              sx={{ flex: 1, minWidth: 0, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
            >
              {condition.value}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Stack
        spacing={1.25}
        sx={{
          mt: 1.5,
          p: 1.75,
          border: 1,
          borderColor: 'grey.500',
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="body2" align="center">
          로그인하고 1초만에 확인하기
        </Typography>
        <Button variant="contained" fullWidth onClick={onLogin}>
          로그인하고 확인하기
        </Button>
      </Stack>
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
  const { openLoginDialog } = useLoginDialog();
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
      <Breadcrumbs separator={<AppIcon name="chevron-right" size={14} />}>
        <Link component={RouterLink} to={ROUTES.HOME} variant="caption" color="text.secondary">
          주거 정책
        </Link>
        <Typography variant="caption" color="text.secondary">
          {policy.subtypeName}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 3, sm: 3, md: 4 }}
        sx={{ alignItems: 'stretch', minWidth: 0 }}
      >
        <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
          <Stack component="header" spacing={1.5}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip label={policy.subtypeName} variant="outlined" size="small" />
              <Typography variant="h1" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                {policy.title}
              </Typography>
              <DdayBadge applyPeriodType={policy.applyPeriodType} applyEndDate={policy.applyEndDate} />
            </Stack>

            <Typography variant="body1" color="text.secondary">
              {policy.organization} · {policy.regionName}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<AppIcon name={saved ? 'heart' : 'heart-outline'} size={20} />}
                onClick={() => toggleFavorite(policy.id)}
                sx={{ '& .MuiButton-startIcon': { color: saved ? 'favorite.main' : 'inherit' } }}
              >
                {saved ? '관심 해제' : '관심 저장'}
              </Button>

              <Button variant="outlined" onClick={() => setIsCardNewsOpen(true)}>
                카드뉴스로 보기
              </Button>

              <Button variant="contained" onClick={handleApplyClick}>
                신청하러 가기 <AppIcon name="arrow-up-right" size={16} />
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={3} sx={{ flex: 1, justifyContent: { sm: 'space-between' } }}>
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
        </Stack>

        {(!isAuthenticated || policy.judgements?.length > 0) && (
          <Box sx={{ width: { xs: '100%', sm: 'clamp(260px, 30vw, 340px)', md: 340 }, flexShrink: 0, display: 'flex' }}>
            {isAuthenticated ? (
              <JudgementCard judgements={policy.judgements} summary={policy.judgementSummary} />
            ) : (
              <RawConditionsCard
                conditions={policy.rawConditions ?? []}
                onLogin={openLoginDialog}
              />
            )}
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
