import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DdayBadge from '@/components/common/DdayBadge';
import { buildPolicyDetailPath } from '@/constants/routes';
import { formatRelativeTime } from '@/utils/formatDate';

/** 설계서 S-09: 안 읽은 알림은 점과 배경으로 구분하고, 행을 누르면 정책 상세로 간다. */
function NotificationItem({ notification, onRead, onDelete }) {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead?.(notification.id);

    if (notification.policyId) {
      navigate(buildPolicyDetailPath(notification.policyId));
    }
  };

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        px: 2,
        py: 1.5,
        borderRadius: 1,
        backgroundColor: notification.isRead ? 'transparent' : 'grey.100',
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          flexShrink: 0,
          borderRadius: '50%',
          backgroundColor: notification.isRead ? 'transparent' : 'primary.main',
        }}
      />

      <Box
        component="button"
        type="button"
        onClick={handleClick}
        sx={{
          flexGrow: 1,
          textAlign: 'left',
          border: 0,
          background: 'none',
          p: 0,
          cursor: 'pointer',
        }}
      >
        <Typography variant="body2">{notification.title}</Typography>
        <Typography variant="body1" color="text.secondary">
          {notification.body}
        </Typography>
      </Box>

      <DdayBadge
        applyPeriodType={notification.applyPeriodType}
        applyEndDate={notification.applyEndDate}
      />

      <Typography variant="caption" color="text.disabled" sx={{ width: 68, textAlign: 'right' }}>
        {formatRelativeTime(notification.createdAt)}
      </Typography>

      {onDelete && (
        <IconButton size="small" aria-label="알림 삭제" onClick={() => onDelete(notification.id)}>
          <Icon icon="mdi:close" width={16} />
        </IconButton>
      )}
    </Stack>
  );
}

export default NotificationItem;
