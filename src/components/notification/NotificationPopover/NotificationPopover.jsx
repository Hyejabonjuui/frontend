import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import NotificationList from '@/components/notification/NotificationList';
import { EMPTY_MESSAGES } from '@/constants/messages';
import { MY_PAGE_TABS, ROUTES } from '@/constants/routes';

/** 제목이 두 줄로 접히는 알림 한 줄(84px) 기준으로 4개까지 담고, 나머지는 스크롤한다. */
const VISIBLE_ITEM_COUNT = 4;
const ITEM_HEIGHT = 84;
const ITEM_GAP = 8;
const LIST_MAX_HEIGHT = VISIBLE_ITEM_COUNT * ITEM_HEIGHT + (VISIBLE_ITEM_COUNT - 1) * ITEM_GAP;

/** 설계서 S-09: 헤더 알림창은 안 읽은 알림만 보여 주고, 읽은 알림은 알림함에서 본다. */
function NotificationPopover({
  anchorEl,
  onClose,
  notifications,
  isLoading,
  errorMessage,
  unreadCount,
  onRead,
  onMarkAllAsRead,
}) {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: { sx: { width: 'min(380px, calc(100vw - 32px))', maxWidth: 'calc(100vw - 32px)' } },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}
      >
        <Typography variant="body2">[마감 7일 이하] 알림 / 안 읽음 ({unreadCount})</Typography>
        {unreadCount > 0 && (
          <Button size="small" variant="text" onClick={onMarkAllAsRead}>
            모두 읽음
          </Button>
        )}
      </Stack>

      <Divider />

      <Box sx={{ maxHeight: LIST_MAX_HEIGHT, overflowY: 'auto', p: 1 }}>
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          errorMessage={errorMessage}
          emptyMessage={EMPTY_MESSAGES.NOTIFICATION_UNREAD}
          onRead={onRead}
        />
      </Box>

      <Divider />

      <Box sx={{ p: 1, textAlign: 'center' }}>
        <Button
          component={RouterLink}
          to={`${ROUTES.MY_PAGE}?tab=${MY_PAGE_TABS.NOTIFICATION}`}
          variant="text"
          onClick={onClose}
        >
          알림함 전체 보기
        </Button>
      </Box>
    </Popover>
  );
}

export default NotificationPopover;
