import { useCallback, useEffect, useMemo, useState } from 'react';

import * as notificationApi from '@/api/notificationApi';
import { TOAST_MESSAGES } from '@/constants/messages';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/getErrorMessage';

const NOTIFICATIONS_UPDATED_EVENT = 'hyeja:notifications-updated';
const notifyNotificationsUpdated = () => window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({
    notifications: [],
    isLoading: isAuthenticated,
    errorMessage: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isActive = true;

    const loadNotifications = async () => {
      try {
        const data = await notificationApi.getNotifications();

        if (isActive) {
          setState({ notifications: data.content ?? [], isLoading: false, errorMessage: '' });
        }
      } catch (error) {
        if (isActive) {
          setState({ notifications: [], isLoading: false, errorMessage: getErrorMessage(error) });
        }
      }
    };

    loadNotifications();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, reloadToken]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleNotificationsUpdated = () => setReloadToken((previous) => previous + 1);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);

    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);
  }, [isAuthenticated]);

  const notifications = useMemo(
    () => (isAuthenticated ? state.notifications : []),
    [isAuthenticated, state.notifications],
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
      notifyNotificationsUpdated();
    } catch (error) {
      setState((previous) => ({ ...previous, errorMessage: getErrorMessage(error) }));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllNotificationsAsRead();
      setState((previous) => ({
        ...previous,
        notifications: previous.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      }));
      notifyNotificationsUpdated();
    } catch (error) {
      setState((previous) => ({ ...previous, errorMessage: getErrorMessage(error) }));
    }
  }, []);

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
        notifyNotificationsUpdated();
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

  return {
    notifications,
    unreadNotifications,
    isLoading: isAuthenticated && state.isLoading,
    errorMessage: isAuthenticated ? state.errorMessage : '',
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refetch,
  };
};
