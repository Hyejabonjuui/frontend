import { useCallback, useEffect, useState } from 'react';

import * as policyApi from '@/api/policyApi';
import { getErrorMessage } from '@/utils/getErrorMessage';

const INITIAL_LIST_STATE = {
  policies: [],
  totalCount: 0,
  totalPages: 0,
  isLoading: true,
  errorMessage: '',
};

export const usePolicies = (params = {}) => {
  const paramsKey = JSON.stringify(params);
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState(INITIAL_LIST_STATE);

  useEffect(() => {
    let isActive = true;

    const loadPolicies = async () => {
      try {
        const data = await policyApi.getPolicies(JSON.parse(paramsKey));

        if (isActive) {
          setState({
            policies: data.content ?? [],
            totalCount: data.totalCount ?? 0,
            totalPages: data.totalPages ?? 0,
            isLoading: false,
            errorMessage: '',
          });
        }
      } catch (error) {
        if (isActive) {
          setState({
            ...INITIAL_LIST_STATE,
            isLoading: false,
            errorMessage: getErrorMessage(error),
          });
        }
      }
    };

    loadPolicies();

    return () => {
      isActive = false;
    };
  }, [paramsKey, reloadToken]);

  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true, errorMessage: '' }));
    setReloadToken((previous) => previous + 1);
  }, []);

  return { ...state, refetch };
};

export const usePolicyDetail = (policyId) => {
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({ policy: null, isLoading: true, errorMessage: '' });

  useEffect(() => {
    if (!policyId) {
      return;
    }

    let isActive = true;

    const loadPolicyDetail = async () => {
      try {
        const data = await policyApi.getPolicyDetail(policyId);

        if (isActive) {
          setState({ policy: data, isLoading: false, errorMessage: '' });
        }
      } catch (error) {
        if (isActive) {
          setState({ policy: null, isLoading: false, errorMessage: getErrorMessage(error) });
        }
      }
    };

    loadPolicyDetail();

    return () => {
      isActive = false;
    };
  }, [policyId, reloadToken]);

  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true, errorMessage: '' }));
    setReloadToken((previous) => previous + 1);
  }, []);

  return { ...state, refetch };
};

export const useCardNews = () => {
  const [state, setState] = useState({ cardNewsList: [], isLoading: true, errorMessage: '' });

  useEffect(() => {
    let isActive = true;

    const loadCardNews = async () => {
      try {
        const data = await policyApi.getCardNews();

        if (isActive) {
          setState({ cardNewsList: data.content ?? [], isLoading: false, errorMessage: '' });
        }
      } catch (error) {
        if (isActive) {
          setState({ cardNewsList: [], isLoading: false, errorMessage: getErrorMessage(error) });
        }
      }
    };

    loadCardNews();

    return () => {
      isActive = false;
    };
  }, []);

  return state;
};
