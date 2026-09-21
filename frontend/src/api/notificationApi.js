import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

export const getNotifications = (params) => httpClient.get(ENDPOINTS.NOTIFICATION.LIST, { params });

export const markNotificationAsRead = (notificationId) =>
  httpClient.patch(ENDPOINTS.NOTIFICATION.READ(notificationId));

export const markAllNotificationsAsRead = () => httpClient.patch(ENDPOINTS.NOTIFICATION.READ_ALL);

export const deleteNotification = (notificationId) =>
  httpClient.delete(ENDPOINTS.NOTIFICATION.DETAIL(notificationId));
