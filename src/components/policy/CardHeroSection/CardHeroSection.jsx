import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DdayBadge from '@/components/common/DdayBadge';
import ErrorState from '@/components/common/ErrorState';
import LoadingSpinner from '@/components/common/LoadingSpinner';

function CardHeroSection({ cardNewsList, isLoading, errorMessage, onSelect }) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />;
  }

  if (cardNewsList.length === 0) {
    return null;
  }

  const [featured, ...others] = cardNewsList;

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'stretch' }}>
      <Card variant="outlined" sx={{ flex: 1, minHeight: 240 }}>
        <CardActionArea
          onClick={() => onSelect(featured)}
          sx={{
            height: '100%',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            1 / {featured.cardCount} · 무슨 정책인가요
          </Typography>

          <Typography variant="h1" sx={{ mt: 1 }}>
            {featured.title}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {featured.summary}
          </Typography>

          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              mt: 'auto',
              pt: 3,
            }}
          >
            <DdayBadge
              applyPeriodType={featured.applyPeriodType}
              applyEndDate={featured.applyEndDate}
            />
            <Typography variant="caption" color="text.secondary">
              눌러서 카드뉴스 {featured.cardCount}장 보기
            </Typography>
          </Stack>
        </CardActionArea>
      </Card>

      <Stack spacing={1.5} sx={{ flex: 1 }}>
        {others.map((cardNews) => (
          <Card key={cardNews.policyId} variant="outlined" sx={{ flex: 1 }}>
            <CardActionArea
              onClick={() => onSelect(cardNews)}
              sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: 1,
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" color="text.disabled">
                  1 / {cardNews.cardCount}
                </Typography>
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">{cardNews.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {cardNews.summary}
                </Typography>
              </Box>

              <DdayBadge
                applyPeriodType={cardNews.applyPeriodType}
                applyEndDate={cardNews.applyEndDate}
              />
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

export default CardHeroSection;
