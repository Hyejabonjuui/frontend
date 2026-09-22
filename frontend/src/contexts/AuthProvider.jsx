import { useCallback, useEffect, useMemo, useState } from 'react';

import * as authApi from '@/api/authApi';
import * as userApi from '@/api/userApi';
import { AuthContext } from '@/contexts/AuthContext';
import { tokenStorage } from '@/utils/tokenStorage';

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(tokenStorage.getAccessToken()));

  useEffect(() => {
    if (!tokenStorage.getAccessToken()) {
      return;
    }

    const restoreSession = async () => {
      try {
        const profile = await userApi.getMyProfile();
        setUser(profile);
      } catch (error) {
        // 서버에 닿지 못한 것뿐이라면 토큰을 지우지 않는다. 인증이 거절된 경우에만 정리한다.
        if (error?.response?.status === 401) {
          tokenStorage.clear();
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);

    window.addEventListener('hyeja:unauthorized', handleUnauthorized);

    return () => window.removeEventListener('hyeja:unauthorized', handleUnauthorized);
  }, []);

  const applySession = useCallback(async ({ accessToken, refreshToken, user: sessionUser }) => {
    tokenStorage.setTokens({ accessToken, refreshToken });
    setUser(sessionUser ?? (await userApi.getMyProfile()));
  }, []);

  const login = useCallback(
    async (credentials) => {
      const session = await authApi.login(credentials);
      await applySession(session);
    },
    [applySession],
  );

  /** 설계서 F-01: 가입이 끝나면 곧바로 로그인 상태로 조건 등록까지 이어진다. */
  const signup = useCallback(
    async (signupForm) => {
      const session = await authApi.signup(signupForm);
      await applySession(session);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const withdraw = useCallback(async () => {
    await userApi.deleteAccount();
    tokenStorage.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await userApi.getMyProfile();
    setUser(profile);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      isLoading,
      login,
      signup,
      logout,
      withdraw,
      refreshUser,
    }),
    [user, isLoading, login, signup, logout, withdraw, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
