import { ENDPOINTS } from './endpoints';
import httpClient from './httpClient';

const unwrapResult = (response) => response?.result ?? response;

const toNotification = (notification) => ({
  ...notification,
  id: notification.id ?? notification.notification_id,
  policyId: notification.policyId ?? notification.policy_id,
  isRead: notification.isRead ?? notification.read_yn,
  applyEndDate: notification.applyEndDate ?? notification.apply_end_date,
  createdAt: notification.createdAt ?? notification.created_at,
});

export const getNotifications = async (params) => {
  const response = await httpClient.get(ENDPOINTS.NOTIFICATION.LIST, { params });
  const result = unwrapResult(response) ?? {};

  return {
    content: (result.notifications ?? result.content ?? []).map(toNotification),
    page: result.page ?? 0,
    size: result.size ?? 0,
    totalCount: result.totalElements ?? result.totalCount ?? 0,
    totalPages: result.totalPages ?? 0,
    hasNext: result.hasNext ?? false,
  };
};

export const markNotificationAsRead = (notificationId) =>
  httpClient.patch(ENDPOINTS.NOTIFICATION.READ(notificationId));

export const deleteNotification = (notificationId) =>
  httpClient.delete(ENDPOINTS.NOTIFICATION.DETAIL(notificationId));
