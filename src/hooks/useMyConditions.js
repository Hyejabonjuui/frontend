import { useCallback, useEffect, useState } from 'react';

import * as userApi from '@/api/userApi';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const useMyConditions = () => {
  const { isAuthenticated, user } = useAuth();
  const memberId = user?.id ?? user?.memberId;
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({
    memberId: null,
    conditions: null,
    isLoading: isAuthenticated,
    errorMessage: '',
  });

  useEffect(() => {
    if (!isAuthenticated || memberId == null) {
      return;
    }

    let isActive = true;

    const loadConditions = async () => {
      try {
        const data = await userApi.getMyConditions(memberId);

        if (isActive) {
          setState({ memberId, conditions: data, isLoading: false, errorMessage: '' });
        }
      } catch (error) {
        if (isActive) {
          setState({
            memberId,
            conditions: null,
            isLoading: false,
            errorMessage: getErrorMessage(error),
          });
        }
      }
    };

    loadConditions();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, memberId, reloadToken]);

  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true, errorMessage: '' }));
    setReloadToken((previous) => previous + 1);
  }, []);

  const isCurrentMember = isAuthenticated && state.memberId === memberId;

  return {
    conditions: isCurrentMember ? state.conditions : null,
    isLoading: isAuthenticated && (!isCurrentMember || state.isLoading),
    errorMessage: isCurrentMember ? state.errorMessage : '',
    refetch,
  };
};
