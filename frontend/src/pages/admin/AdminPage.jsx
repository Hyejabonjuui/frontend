import { useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import * as adminApi from '@/api/adminApi';
import AppIcon from '@/components/common/AppIcon';
import { TOAST_MESSAGES } from '@/constants/messages';
import { useToast } from '@/hooks/useToast';
import { formatDateTimeRange } from '@/utils/formatDate';
import { getErrorMessage } from '@/utils/getErrorMessage';

const STATUS_LABEL = { SUCCESS: '성공 (SUCCESS)', FAILED: '실패 (FAILED)' };

function AdminPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const [collectionStatus, setCollectionStatus] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);

  const handleCollect = async () => {
    setIsCollecting(true);
    showInfo(TOAST_MESSAGES.ADMIN_COLLECT_STARTED);

    try {
      const data = await adminApi.startPolicyCollection();
      setCollectionStatus(data);
      showSuccess(TOAST_MESSAGES.ADMIN_COLLECT_DONE);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsCollecting(false);
    }
  };

  const rows = collectionStatus
    ? [
        { label: '상태', value: STATUS_LABEL[collectionStatus.status] ?? collectionStatus.status },
        {
          label: '시각',
          value: formatDateTimeRange(collectionStatus.startedAt, collectionStatus.finishedAt),
        },
        {
          label: '건수',
          value: `가져옴 ${collectionStatus.fetchedCount} · 신규 ${collectionStatus.newCount} · 변경 ${collectionStatus.updatedCount} · 숨김 ${collectionStatus.closedCount}`,
        },
      ]
    : [];

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h1">관리 · 정책 수집</Typography>
        <Typography variant="body1" color="text.secondary">
          매일 새벽 3시에 자동으로 모아요. 시연·테스트 때는 아래 버튼으로 바로 실행할 수 있어요.
          (role = ADMIN만 접근)
        </Typography>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Button
            variant="contained"
            onClick={handleCollect}
            disabled={isCollecting}
            sx={{ flexShrink: 0 }}
          >
            지금 수집 실행
          </Button>
          <Typography variant="body1" color="text.secondary">
            온통청년 API <AppIcon name="arrow-right" size={14} /> 주거 정책 저장 <AppIcon name="arrow-right" size={14} /> 하위 유형 분류 <AppIcon name="arrow-right" size={14} /> 카드뉴스 생성 <AppIcon name="arrow-right" size={14} /> D-7 알림
          </Typography>
        </Stack>
      </Card>

      {collectionStatus && (
        <Card variant="outlined" sx={{ backgroundColor: 'grey.100' }}>
          <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>
            마지막 수집 결과
          </Typography>
          <Stack divider={<Divider />}>
            {rows.map((row) => (
              <Stack key={row.label} direction="row" spacing={2} sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body1" color="text.secondary" sx={{ width: 64 }}>
                  {row.label}
                </Typography>
                <Typography variant="body1">{row.value}</Typography>
              </Stack>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

export default AdminPage;
