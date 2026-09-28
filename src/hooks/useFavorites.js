import { useCallback, useEffect, useMemo, useState } from 'react';

import * as favoriteApi from '@/api/favoriteApi';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/getErrorMessage';

/** 관심 정책 화면(S-14)의 목록. 하트 상태 판단에는 쓰지 않는다(useFavoriteToggle). */
export const useFavorites = () => {
  const { isAuthenticated, user } = useAuth();
  const memberId = user?.id;
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
        const data = await favoriteApi.getFavorites();

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

  /** 해제한 뒤처럼 화면을 비우지 않고 목록만 다시 받는다. */
  const reload = useCallback(() => setReloadToken((previous) => previous + 1), []);

  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true, errorMessage: '' }));
    reload();
  }, [reload]);

  return {
    favorites,
    isLoading: isAuthenticated && (state.memberId !== memberId || state.isLoading),
    errorMessage: isAuthenticated && state.memberId === memberId ? state.errorMessage : '',
    reload,
    refetch,
  };
};
