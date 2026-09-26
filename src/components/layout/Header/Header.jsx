import { useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import AppIcon from '@/components/common/AppIcon';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import NotificationPopover from '@/components/notification/NotificationPopover';
import { TOAST_MESSAGES } from '@/constants/messages';
import { MY_PAGE_TABS, ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useLoginDialog } from '@/hooks/useLoginDialog';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/useToast';
import { LAYOUT } from '@/styles/theme';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { openLoginDialog } = useLoginDialog();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const { unreadNotifications, unreadCount, isLoading, errorMessage, markAsRead, markAllAsRead } =
    useNotifications();
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);

  const navItems = isAuthenticated
    ? [
        { label: '주거 정책', to: ROUTES.HOME },
        { label: '관심 정책', to: ROUTES.FAVORITE },
      ]
    : [{ label: '주거 정책', to: ROUTES.HOME }];

  const handleLogout = async () => {
    setAccountAnchorEl(null);
    await logout();
    showSuccess(TOAST_MESSAGES.LOGOUT_DONE);
    navigate(ROUTES.HOME);
  };

  const goToMyPage = (tab) => {
    setAccountAnchorEl(null);
    navigate(`${ROUTES.MY_PAGE}?tab=${tab}`);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Toolbar
        sx={{
          width: '100%',
          maxWidth: LAYOUT.contentWidth,
          mx: 'auto',
          px: LAYOUT.pageGutter,
          minHeight: `${LAYOUT.headerHeight}px !important`,
          gap: { xs: 0.5, sm: 2, md: 3 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          py: { xs: 0.5, sm: 0 },
        }}
      >
        <Typography
          component={RouterLink}
          to={ROUTES.HOME}
          variant="h2"
          sx={{ color: 'text.primary', textDecoration: 'none', flexShrink: 0 }}
        >
          혜자.
        </Typography>

        <Stack
          direction="row"
          spacing={{ xs: 0, sm: 1, md: 2 }}
          sx={{ flexShrink: 0, order: { xs: 3, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}
        >
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              variant="text"
              end
              size="small"
              sx={{
                color: 'text.secondary',
                '&.active': {
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 0,
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          spacing={{ xs: 0, sm: 1 }}
          sx={{ alignItems: 'center', flexShrink: 0 }}
        >
          {isAuthenticated ? (
            <>
              <IconButton
                aria-label="알림 열기"
                onClick={(event) => setNotificationAnchorEl(event.currentTarget)}
              >
                <Badge badgeContent={unreadCount} color="primary">
                  <AppIcon name="bell-outline" size={24} />
                </Badge>
              </IconButton>

              <Button
                variant="text"
                onClick={(event) => setAccountAnchorEl(event.currentTarget)}
                endIcon={<AppIcon name="chevron-down" size={20} />}
                sx={{ color: 'text.primary', maxWidth: { xs: 132, sm: 180 }, overflow: 'hidden' }}
              >
                {user.nickname}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="text"
                onClick={() => openLoginDialog()}
                sx={{ color: 'text.secondary' }}
              >
                로그인
              </Button>
              <Button component={RouterLink} to={ROUTES.SIGNUP} variant="contained" size="small">
                회원가입
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>

      <NotificationPopover
        anchorEl={notificationAnchorEl}
        onClose={() => setNotificationAnchorEl(null)}
        notifications={unreadNotifications}
        isLoading={isLoading}
        errorMessage={errorMessage}
        unreadCount={unreadCount}
        onRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />

      <Menu
        anchorEl={accountAnchorEl}
        open={Boolean(accountAnchorEl)}
        onClose={() => setAccountAnchorEl(null)}
      >
        <MenuItem onClick={() => goToMyPage(MY_PAGE_TABS.CONDITION)}>마이페이지</MenuItem>
        <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
      </Menu>
    </AppBar>
  );
}

export default Header;
