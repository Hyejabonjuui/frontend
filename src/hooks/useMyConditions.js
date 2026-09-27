import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as userApi from '@/api/userApi';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const useMyConditions = () => {
  const navigate = useNavigate();
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
        const data = await userApi.getMyConditions();

        if (isActive) {
          setState({ memberId, conditions: data, isLoading: false, errorMessage: '' });
        }
      } catch (error) {
        if (error?.response?.data?.code === 'PROFILE_001') {
          navigate(ROUTES.CONDITION_SETUP, { replace: true });
          return;
        }

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
  }, [isAuthenticated, memberId, navigate, reloadToken]);

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
