import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
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
        flex: 1,
        p: 2,
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
                <Box key={part} component="span" sx={{ whiteSpace: 'nowrap' }}>
                  {part}
                </Box>
              ) : (
                part
              ),
            )}
          </Typography>
        )}

        {card.tags?.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {card.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
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
          이 정책 신청하기 ↗
        </Button>
        <Link
          component={RouterLink}
          to={buildPolicyDetailPath(cardNews.policyId)}
          onClick={onClose}
          variant="body1"
        >
          정책 상세 보기 →
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
            width: 'min(1440px, calc(100vw - 48px))',
            maxHeight: 'calc(100vh - 48px)',
            minHeight: 'min(680px, calc(100vh - 48px))',
          },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', px: 3, pt: 2.5, pb: 0.5 }}
      >
        <Chip label={cardNews.subtypeName} variant="outlined" size="small" sx={{ flexShrink: 0 }} />

        <Typography variant="h2" sx={{ flexGrow: 1, minWidth: 0 }}>
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
            <Icon
              icon={isFavorite ? 'mdi:heart' : 'mdi:heart-outline'}
              width={20}
              color="currentColor"
            />
          </IconButton>
        )}

        <IconButton onClick={onClose} aria-label="닫기">
          <Icon icon="mdi:close" width={20} />
        </IconButton>
      </Stack>

      <DialogContent sx={{ display: 'flex', pb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: 'stretch', flex: 1 }}
        >
          {cards.map((card) => (
            <CardNewsPanel key={card.order} card={card} cardCount={cardCount}>
              {renderCardActions(card)}
            </CardNewsPanel>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default CardNewsDialog;
