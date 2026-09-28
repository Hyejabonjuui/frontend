import { useCallback, useEffect, useState } from 'react';

import * as policyApi from '@/api/policyApi';
import { RECOMMENDATION_GROUP } from '@/constants/policy';
import { getErrorMessage, isCanceledError } from '@/utils/getErrorMessage';

const EMPTY_GROUPS = {
  [RECOMMENDATION_GROUP.POSSIBLE]: [],
  [RECOMMENDATION_GROUP.NEED_CHECK]: [],
  [RECOMMENDATION_GROUP.IMPOSSIBLE]: [],
};

const INITIAL_STATE = {
  groups: EMPTY_GROUPS,
  query: null,
  isAiFailed: false,
  isLoading: true,
  errorMessage: '',
};

export const usePolicySearch = (params = {}) => {
  const paramsKey = JSON.stringify(params);
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    let isActive = true;

    const loadSearchResult = async () => {
      try {
        const data = await policyApi.searchPolicies(JSON.parse(paramsKey));

        if (isActive) {
          setState({
            groups: { ...EMPTY_GROUPS, ...(data.groups ?? {}) },
            query: data.query ?? null,
            isAiFailed: data.isAiFailed ?? false,
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
  }, [paramsKey, reloadToken]);

  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true, errorMessage: '' }));
    setReloadToken((previous) => previous + 1);
  }, []);

  const groupCounts = Object.entries(state.groups).reduce(
    (counts, [group, policies]) => ({ ...counts, [group]: policies.length }),
    {},
  );
  const totalCount = Object.values(groupCounts).reduce((sum, count) => sum + count, 0);

  return { ...state, groupCounts, totalCount, refetch };
};
