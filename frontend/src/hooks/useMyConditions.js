import { useCallback, useEffect, useState } from 'react';

import * as userApi from '@/api/userApi';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const useMyConditions = () => {
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({ conditions: null, isLoading: true, errorMessage: '' });

  useEffect(() => {
    let isActive = true;

    const loadConditions = async () => {
      try {
        const data = await userApi.getMyConditions();

        if (isActive) {
          setState({ conditions: data, isLoading: false, errorMessage: '' });
        }
      } catch (error) {
        if (isActive) {
          setState({ conditions: null, isLoading: false, errorMessage: getErrorMessage(error) });
        }
      }
    };

    loadConditions();

    return () => {
      isActive = false;
    };
  }, [reloadToken]);

  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true, errorMessage: '' }));
    setReloadToken((previous) => previous + 1);
  }, []);

  return { ...state, refetch };
};
