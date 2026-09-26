import { Link as RouterLink } from 'react-router-dom';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ROUTES } from '@/constants/routes';

function NotFoundPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Typography variant="h1" color="primary.main">
        404
      </Typography>
      <Typography variant="body2">페이지를 찾을 수 없어요</Typography>
      <Button component={RouterLink} to={ROUTES.HOME} variant="contained">
        홈으로 가기
      </Button>
    </Stack>
  );
}

export default NotFoundPage;
