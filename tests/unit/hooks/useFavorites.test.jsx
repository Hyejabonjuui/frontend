import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFavorites } from '@/hooks/useFavorites';

const mocks = vi.hoisted(() => ({
  auth: { isAuthenticated: true, user: { id: 1 } },
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  requireLogin: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

vi.mock('@/api/favoriteApi', () => ({
  getFavorites: mocks.getFavorites,
  addFavorite: mocks.addFavorite,
  removeFavorite: mocks.removeFavorite,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mocks.auth,
}));

vi.mock('@/hooks/useLoginDialog', () => ({
  useLoginDialog: () => ({ requireLogin: mocks.requireLogin }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showSuccess: mocks.showSuccess, showError: mocks.showError }),
}));

beforeEach(() => {
  mocks.auth = { isAuthenticated: true, user: { id: 1 } };
  vi.clearAllMocks();
  mocks.addFavorite.mockResolvedValue();
  mocks.removeFavorite.mockResolvedValue();
});

describe('useFavorites', () => {
  it('사용자가 바뀌면 토큰으로 새 목록을 조회하고 이전 사용자의 관심 상태를 숨긴다', async () => {
    mocks.getFavorites
      .mockResolvedValueOnce({ content: [{ policyId: 100 }] })
      .mockResolvedValueOnce({ content: [] });

    const { result, rerender } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.isFavorite(100)).toBe(true));

    mocks.auth = { isAuthenticated: true, user: { id: 2 } };
    rerender();

    expect(result.current.isFavorite(100)).toBe(false);
    await waitFor(() => expect(mocks.getFavorites).toHaveBeenCalledTimes(2));

    await act(async () => {
      await result.current.toggleFavorite(100);
    });

    expect(mocks.addFavorite).toHaveBeenCalledWith(100);
    expect(mocks.removeFavorite).not.toHaveBeenCalled();
  });
});
