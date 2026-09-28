import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NotificationProvider from '@/contexts/NotificationProvider';
import { useNotifications } from '@/hooks/useNotifications';

const mocks = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  showError: vi.fn(),
  showSuccess: vi.fn(),
}));

vi.mock('@/api/notificationApi', () => ({
  getNotifications: mocks.getNotifications,
  markNotificationAsRead: mocks.markNotificationAsRead,
  deleteNotification: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: 1 } }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showError: mocks.showError, showSuccess: mocks.showSuccess }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useNotifications', () => {
  it('모두 읽음 요청이 부분 성공하면 성공한 알림만 읽음으로 반영한다', async () => {
    mocks.getNotifications
      .mockResolvedValueOnce({
        content: [
          { id: 1, isRead: false },
          { id: 2, isRead: false },
          { id: 3, isRead: true },
        ],
      })
      .mockImplementation(() => new Promise(() => {}));
    mocks.markNotificationAsRead.mockImplementation((notificationId) =>
      notificationId === 1 ? Promise.resolve() : Promise.reject(new Error('읽음 처리 실패')),
    );

    const { result } = renderHook(() => useNotifications(), { wrapper: NotificationProvider });

    await waitFor(() => expect(result.current.unreadCount).toBe(2));

    await act(() => result.current.markAllAsRead());

    expect(result.current.notifications).toEqual([
      { id: 1, isRead: true },
      { id: 2, isRead: false },
      { id: 3, isRead: true },
    ]);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.errorMessage).toBe(
      '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요',
    );
    expect(mocks.markNotificationAsRead).toHaveBeenCalledTimes(2);
  });
});
