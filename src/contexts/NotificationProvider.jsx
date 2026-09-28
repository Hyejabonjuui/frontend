import { useCallback, useEffect, useMemo, useState } from 'react';

import * as notificationApi from '@/api/notificationApi';
import { TOAST_MESSAGES } from '@/constants/messages';
import { NotificationContext } from '@/contexts/NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/getErrorMessage';

/**
 * 헤더 알림창과 마이페이지 알림 탭이 같은 알림을 본다.
 * 화면마다 따로 조회하면 같은 요청이 여러 번 나가므로, 로그인한 동안 이곳에서 한 번만 불러온다.
 */
function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const memberId = user?.id;
  const { showSuccess, showError } = useToast();
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({
    memberId: null,
    notifications: [],
    isLoading: isAuthenticated,
    errorMessage: '',
  });

  useEffect(() => {
    if (!isAuthenticated || memberId == null) {
      return;
    }

    let isActive = true;

    const loadNotifications = async () => {
      try {
        const data = await notificationApi.getNotifications();

        if (isActive) {
          setState({
            memberId,
            notifications: data.content ?? [],
            isLoading: false,
            errorMessage: '',
          });
        }
      } catch (error) {
        if (isActive) {
          setState({
            memberId,
            notifications: [],
            isLoading: false,
            errorMessage: getErrorMessage(error),
          });
        }
      }
    };

    loadNotifications();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, memberId, reloadToken]);

  const isCurrentMember = isAuthenticated && state.memberId === memberId;

  const notifications = useMemo(
    () => (isCurrentMember ? state.notifications : []),
    [isCurrentMember, state.notifications],
  );

  /** 설계서 S-09: 헤더 알림창에는 안 읽은 알림만 보여 준다. */
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isRead),
    [notifications],
  );

  const unreadCount = unreadNotifications.length;

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationApi.markNotificationAsRead(notificationId);
      setState((previous) => ({
        ...previous,
        notifications: previous.notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification,
        ),
      }));
    } catch (error) {
      setState((previous) => ({ ...previous, errorMessage: getErrorMessage(error) }));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const results = await Promise.allSettled(
      unreadNotifications.map((notification) =>
        notificationApi.markNotificationAsRead(notification.id),
      ),
    );
    const readNotificationIds = new Set(
      results.flatMap((result, index) =>
        result.status === 'fulfilled' ? [unreadNotifications[index].id] : [],
      ),
    );
    const failedResult = results.find((result) => result.status === 'rejected');

    if (readNotificationIds.size > 0) {
      setState((previous) => ({
        ...previous,
        notifications: previous.notifications.map((notification) =>
          readNotificationIds.has(notification.id)
            ? { ...notification, isRead: true }
            : notification,
        ),
        errorMessage: failedResult ? getErrorMessage(failedResult.reason) : '',
      }));
    } else if (failedResult) {
      setState((previous) => ({
        ...previous,
        errorMessage: getErrorMessage(failedResult.reason),
      }));
    }
  }, [unreadNotifications]);

  const removeNotification = useCallback(
    async (notificationId) => {
      try {
        await notificationApi.deleteNotification(notificationId);
        setState((previous) => ({
          ...previous,
          notifications: previous.notifications.filter(
            (notification) => notification.id !== notificationId,
          ),
        }));
        showSuccess(TOAST_MESSAGES.NOTIFICATION_DELETED);
      } catch (error) {
        showError(getErrorMessage(error));
      }
    },
    [showError, showSuccess],
  );

  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true, errorMessage: '' }));
    setReloadToken((previous) => previous + 1);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadNotifications,
      isLoading: isAuthenticated && (!isCurrentMember || state.isLoading),
      errorMessage: isCurrentMember ? state.errorMessage : '',
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      refetch,
    }),
    [
      notifications,
      unreadNotifications,
      isAuthenticated,
      isCurrentMember,
      state.isLoading,
      state.errorMessage,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      refetch,
    ],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export default NotificationProvider;
