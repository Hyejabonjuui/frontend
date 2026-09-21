import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import ErrorState from '@/components/common/ErrorState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NotificationList from '@/components/notification/NotificationList';
import { TOAST_MESSAGES } from '@/constants/messages';
import { MY_PAGE_TABS, ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useMyConditions } from '@/hooks/useMyConditions';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/useToast';
import ConditionEditor from '@/pages/onboarding/ConditionEditor';
import { getErrorMessage } from '@/utils/getErrorMessage';

function ConditionTab() {
  const { conditions, isLoading, errorMessage, refetch } = useMyConditions();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={refetch} />;
  }

  return (
    <Box sx={{ maxWidth: 620 }}>
      <ConditionEditor initialConditions={conditions} submitLabel="저장" onSaved={refetch} />
    </Box>
  );
}

function AccountTab() {
  const { user, withdraw } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleWithdraw = async () => {
    setIsConfirmOpen(false);

    try {
      await withdraw();
      showSuccess(TOAST_MESSAGES.ACCOUNT_DELETED);
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const rows = [
    { label: '이메일', value: user.email },
    { label: '닉네임', value: user.nickname },
    { label: '가입일', value: user.joinedAt },
  ];

  return (
    <Stack spacing={3} sx={{ maxWidth: 620 }}>
      <Card variant="outlined">
        <Stack divider={<Divider />}>
          {rows.map((row) => (
            <Stack key={row.label} direction="row" spacing={2} sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body1" color="text.secondary" sx={{ width: 96 }}>
                {row.label}
              </Typography>
              <Typography variant="body2">{row.value}</Typography>
            </Stack>
          ))}
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 2, backgroundColor: 'grey.100' }}>
        <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Typography variant="body2">회원 탈퇴</Typography>
          <Typography variant="body1" color="text.secondary">
            탈퇴하면 내 조건, 관심 정책, 알림이 모두 지워지고 되돌릴 수 없어요.
          </Typography>
          <Button variant="outlined" onClick={() => setIsConfirmOpen(true)}>
            회원 탈퇴
          </Button>
        </Stack>
      </Card>

      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ typography: 'h2' }}>정말 탈퇴하시겠어요?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            내 조건, 관심 정책, 알림이 모두 지워지고 되돌릴 수 없어요.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setIsConfirmOpen(false)}>
            취소
          </Button>
          <Button variant="contained" color="error" onClick={handleWithdraw}>
            탈퇴할게요
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function NotificationTab() {
  const {
    notifications,
    unreadCount,
    isLoading,
    errorMessage,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refetch,
  } = useNotifications();

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body1" color="text.secondary">
          [마감 7일 이하] 알림 / 안 읽음 ({unreadCount})
        </Typography>
        {unreadCount > 0 && (
          <Button variant="text" size="small" onClick={markAllAsRead}>
            모두 읽음
          </Button>
        )}
      </Stack>

      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onRead={markAsRead}
        onDelete={removeNotification}
        onRetry={refetch}
      />
    </Stack>
  );
}

const TAB_CONTENT = {
  [MY_PAGE_TABS.CONDITION]: ConditionTab,
  [MY_PAGE_TABS.ACCOUNT]: AccountTab,
  [MY_PAGE_TABS.NOTIFICATION]: NotificationTab,
};

function MyPage() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  // 모르는 탭 값이 와도 탭 표시와 내용이 어긋나지 않게 기본 탭으로 맞춘다.
  const currentTab = useMemo(
    () => (TAB_CONTENT[requestedTab] ? requestedTab : MY_PAGE_TABS.CONDITION),
    [requestedTab],
  );
  const TabContent = TAB_CONTENT[currentTab];

  const tabItems = [
    { value: MY_PAGE_TABS.CONDITION, label: '내 조건 수정' },
    { value: MY_PAGE_TABS.ACCOUNT, label: '계정' },
    {
      value: MY_PAGE_TABS.NOTIFICATION,
      label: unreadCount > 0 ? `알림 목록 ${unreadCount}` : '알림 목록',
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h1">마이페이지</Typography>
        <Typography variant="body1" color="text.secondary">
          {user.nickname} · {user.email}
        </Typography>
      </Stack>

      <Tabs
        value={currentTab}
        onChange={(event, value) => setSearchParams({ tab: value })}
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {tabItems.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      <Box>
        <TabContent />
      </Box>
    </Stack>
  );
}

export default MyPage;
