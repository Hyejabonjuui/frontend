import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppIcon from '@/components/common/AppIcon';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DdayBadge from '@/components/common/DdayBadge';
import { TOAST_MESSAGES } from '@/constants/messages';
import { buildPolicyDetailPath } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { RADIUS } from '@/styles/theme';

function CardNewsPanel({ card, cardCount, children }) {
  const headingParts = card.heading?.split(/(\([^)]*\))/) ?? [];

  return (
    <Stack
      sx={{
        p: { xs: 2, sm: 2.5, md: 2 },
        minHeight: { xs: 0, sm: 260, md: 0 },
        minWidth: 0,
        borderRadius: `${RADIUS.card}px`,
        backgroundColor: 'grey.100',
      }}
    >
      {/* 본문이 남은 높이를 모두 차지해, 액션은 카드 맨 아래에 붙는다. */}
      <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {card.order} / {cardCount} · {card.label}
        </Typography>

        {card.heading && (
          <Typography
            variant="h2"
            sx={{ wordBreak: 'keep-all', overflowWrap: 'break-word', textWrap: 'balance' }}
          >
            {headingParts.map((part) =>
              part.startsWith('(') ? (
                <Box
                  key={part}
                  component="span"
                  sx={{ whiteSpace: { xs: 'normal', md: 'nowrap' }, overflowWrap: 'anywhere' }}
                >
                  {part}
                </Box>
              ) : (
                part
              ),
            )}
          </Typography>
        )}

        {card.tags?.length > 0 && (
          <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {card.tags.map((tag) => (
              <Chip
                key={tag}
                label={<Typography variant="h2">{tag}</Typography>}
                variant="outlined"
                sx={{
                  height: 'auto',
                  maxWidth: '100%',
                  '& .MuiChip-label': { py: 0.5, whiteSpace: 'normal' },
                }}
              />
            ))}
          </Stack>
        )}

        {card.body && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              whiteSpace: 'pre-line',
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              textWrap: 'pretty',
            }}
          >
            {card.body}
          </Typography>
        )}
      </Stack>

      {children && <Box sx={{ pt: 3 }}>{children}</Box>}
    </Stack>
  );
}

function CardNewsDialog({ cardNews, onClose, isFavorite = false, onToggleFavorite }) {
  const navigate = useNavigate();
  const { showError } = useToast();

  if (!cardNews) {
    return null;
  }

  const cards = cardNews.cards ?? [];
  const cardCount = cardNews.cardCount ?? cards.length;

  const handleApplyClick = () => {
    if (cardNews.applyUrl) {
      window.open(cardNews.applyUrl, '_blank', 'noopener');
      return;
    }

    // 신청 링크가 없어도 막다른 길이 되지 않게, 신청 방법이 적힌 정책 상세로 보낸다.
    showError(TOAST_MESSAGES.APPLY_LINK_MISSING);
    onClose();
    navigate(buildPolicyDetailPath(cardNews.policyId));
  };

  // 설계서 S-01: 마지막 장에서 바로 신청하거나 상세로 넘어갈 수 있어야 한다.
  const renderCardActions = (card) => {
    if (card.order !== cardCount) {
      return null;
    }

    return (
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Button variant="contained" fullWidth onClick={handleApplyClick}>
          이 정책 신청하기 <AppIcon name="arrow-up-right" size={16} />
        </Button>
        <Link
          component={RouterLink}
          to={buildPolicyDetailPath(cardNews.policyId)}
          onClick={onClose}
          variant="body1"
        >
          정책 상세 보기 <AppIcon name="arrow-right" size={16} />
        </Link>
      </Stack>
    );
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width: {
              xs: 'calc(100vw - 24px)',
              sm: 'min(900px, calc(100vw - 48px))',
              md: 'min(1440px, calc(100vw - 48px))',
            },
            maxHeight: { xs: 'calc(100dvh - 24px)', sm: 'calc(100dvh - 48px)' },
            minHeight: { xs: 0, md: 'min(680px, calc(100dvh - 48px))' },
            m: { xs: 1.5, sm: 3 },
          },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          alignItems: 'center',
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          px: { xs: 2, sm: 3 },
          pt: 2.5,
          pb: 0.5,
        }}
      >
        <Chip label={cardNews.subtypeName} variant="outlined" size="small" sx={{ flexShrink: 0 }} />

        <Typography variant="h2" sx={{ flexGrow: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
          {cardNews.title}
        </Typography>

        <DdayBadge
          applyPeriodType={cardNews.applyPeriodType}
          applyEndDate={cardNews.applyEndDate}
        />

        {onToggleFavorite && (
          <IconButton
            aria-label={isFavorite ? '관심 정책 해제' : '관심 정책 저장'}
            onClick={() => onToggleFavorite(cardNews.policyId)}
            sx={{ color: isFavorite ? 'favorite.main' : 'text.disabled' }}
          >
            <AppIcon name={isFavorite ? 'heart' : 'heart-outline'} size={20} />
          </IconButton>
        )}

        <IconButton onClick={onClose} aria-label="닫기">
          <AppIcon name="close" size={20} />
        </IconButton>
      </Stack>

      <DialogContent sx={{ display: 'flex', px: { xs: 2, sm: 3 }, pb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            // 설명이 길어져도 그리드 행이 내용보다 작아지지 않게 한다.
            gridAutoRows: 'minmax(max-content, 1fr)',
            gap: { xs: 1.5, sm: 2 },
            flex: 1,
            minWidth: 0,
          }}
        >
          {cards.map((card) => (
            <CardNewsPanel key={card.order} card={card} cardCount={cardCount}>
              {renderCardActions(card)}
            </CardNewsPanel>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default CardNewsDialog;
