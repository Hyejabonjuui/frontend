import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ErrorState from '@/components/common/ErrorState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ROUTES } from '@/constants/routes';
import { useMyConditions } from '@/hooks/useMyConditions';
import ConditionEditor from '@/pages/onboarding/ConditionEditor';
import { conditionDraft } from '@/utils/conditionDraft';

function ConditionSetupPage() {
  const navigate = useNavigate();
  const { conditions, isLoading, errorMessage, refetch } = useMyConditions();
  // 폼을 만들기 전에 한 번만 읽어, 저장하지 않고 나갔던 입력을 이어서 쓴다.
  const draft = useMemo(() => conditionDraft.read(), []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={refetch} />;
  }

  return (
    <Stack sx={{ alignItems: 'center' }}>
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 620, p: 4 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h1">내 조건 등록</Typography>
          <Typography variant="body1" color="text.secondary">
            한 번만 등록하면 검색할 때마다 자동으로 AI가 반영해요. 선택 항목을 비워 두면 그 조건은
            &ldquo;확인이 필요해요&rdquo;로 알려드려요.
          </Typography>
        </Stack>

        <ConditionEditor
          initialConditions={conditions}
          draft={draft}
          submitLabel="저장하고 시작하기"
          onSaved={() => navigate(ROUTES.HOME)}
        />
      </Card>
    </Stack>
  );
}

export default ConditionSetupPage;
