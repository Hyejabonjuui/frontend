import { useCallback, useEffect, useState } from 'react';

import * as policyApi from '@/api/policyApi';
import { RECOMMENDATION_GROUP } from '@/constants/policy';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage, isCanceledError } from '@/utils/getErrorMessage';

const EMPTY_GROUPS = {
  [RECOMMENDATION_GROUP.POSSIBLE]: [],
  [RECOMMENDATION_GROUP.NEED_CHECK]: [],
  [RECOMMENDATION_GROUP.IMPOSSIBLE]: [],
};

const INITIAL_STATE = {
  groups: EMPTY_GROUPS,
  isLoading: true,
  errorMessage: '',
};

const IDLE_STATE = { ...INITIAL_STATE, isLoading: false };

/** 검색은 로그인이 필요하다. 비로그인이거나 검색어가 비어 있으면 요청하지 않고 isIdle로 알린다. */
export const usePolicySearch = (params = {}) => {
  const paramsKey = JSON.stringify(params);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const hasQuery = Boolean(params.query?.trim());
  const isIdle = !hasQuery || (!isAuthLoading && !isAuthenticated);
  const canSearch = !isIdle && !isAuthLoading;
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    if (!canSearch) {
      return undefined;
    }

    let isActive = true;

    const loadSearchResult = async () => {
      setState((previous) => ({ ...previous, isLoading: true, errorMessage: '' }));

      try {
        const data = await policyApi.searchPolicies(JSON.parse(paramsKey));

        if (isActive) {
          setState({
            groups: { ...EMPTY_GROUPS, ...(data.groups ?? {}) },
            isLoading: false,
            errorMessage: '',
          });
        }
      } catch (error) {
        if (isActive && !isCanceledError(error)) {
          setState({ ...INITIAL_STATE, isLoading: false, errorMessage: getErrorMessage(error) });
        }
      }
    };

    loadSearchResult();

    return () => {
      isActive = false;
    };
  }, [paramsKey, reloadToken, canSearch]);

  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true, errorMessage: '' }));
    setReloadToken((previous) => previous + 1);
  }, []);

  const currentState = isIdle ? IDLE_STATE : state;
  const groupCounts = Object.entries(currentState.groups).reduce(
    (counts, [group, policies]) => ({ ...counts, [group]: policies.length }),
    {},
  );
  const totalCount = Object.values(groupCounts).reduce((sum, count) => sum + count, 0);

  return { ...currentState, isIdle, groupCounts, totalCount, refetch };
};
