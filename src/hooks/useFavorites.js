import { useCallback, useEffect, useMemo, useState } from 'react';

import * as favoriteApi from '@/api/favoriteApi';
import { TOAST_MESSAGES } from '@/constants/messages';
import { useAuth } from '@/hooks/useAuth';
import { useLoginDialog } from '@/hooks/useLoginDialog';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const useFavorites = () => {
  const { isAuthenticated, user } = useAuth();
  const memberId = user?.id;
  const { requireLogin } = useLoginDialog();
  const { showSuccess, showError } = useToast();
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({
    memberId: null,
    favorites: [],
    isLoading: isAuthenticated,
    errorMessage: '',
  });

  useEffect(() => {
    if (!isAuthenticated || memberId == null) {
      return;
    }

    let isActive = true;

    const loadFavorites = async () => {
      try {
        const data = await favoriteApi.getFavorites({ memberId });

        if (isActive) {
          setState({
            memberId,
            favorites: data.content ?? [],
            isLoading: false,
            errorMessage: '',
          });
        }
      } catch (error) {
        if (isActive) {
          setState({
            memberId,
            favorites: [],
            isLoading: false,
            errorMessage: getErrorMessage(error),
          });
        }
      }
    };

    loadFavorites();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, memberId, reloadToken]);

  const favorites = useMemo(
    () => (isAuthenticated && state.memberId === memberId ? state.favorites : []),
    [isAuthenticated, memberId, state.favorites, state.memberId],
  );

  const isFavorite = useCallback(
    (policyId) => favorites.some((favorite) => favorite.policyId === policyId),
    [favorites],
  );

  const reload = useCallback(() => setReloadToken((previous) => previous + 1), []);

  const saveFavorite = useCallback(
    async (policyId, authenticatedMemberId = memberId) => {
      try {
        await favoriteApi.addFavorite(policyId, authenticatedMemberId);
        reload();
        showSuccess(TOAST_MESSAGES.FAVORITE_ADDED);
      } catch (error) {
        showError(getErrorMessage(error));
      }
    },
    [memberId, reload, showError, showSuccess],
  );

  const toggleFavorite = useCallback(
    async (policyId) => {
      if (!isAuthenticated) {
        // 설계서 S-01: 비로그인 ♡는 안내 toast와 로그인 모달을 함께 띄우고,
        // 로그인에 성공하면 누르려던 저장을 이어서 실행한다.
        requireLogin((authenticatedUser) => saveFavorite(policyId, authenticatedUser.id));
        return;
      }

      if (!isFavorite(policyId)) {
        await saveFavorite(policyId);
        return;
      }

      try {
        await favoriteApi.removeFavorite(policyId, memberId);
        reload();
        showSuccess(TOAST_MESSAGES.FAVORITE_REMOVED);
      } catch (error) {
        showError(getErrorMessage(error));
      }
    },
    [
      isAuthenticated,
      isFavorite,
      requireLogin,
      reload,
      saveFavorite,
      showError,
      showSuccess,
      memberId,
    ],
  );

  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true, errorMessage: '' }));
    reload();
  }, [reload]);

  return {
    favorites,
    isLoading: isAuthenticated && (state.memberId !== memberId || state.isLoading),
    errorMessage: isAuthenticated && state.memberId === memberId ? state.errorMessage : '',
    isFavorite,
    toggleFavorite,
    refetch,
  };
};
