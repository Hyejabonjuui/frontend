import { FAVORITE_STATUS } from '@/constants/policy';
import { NOTIFICATIONS } from '@/mocks/data/notifications';
import { USERS } from '@/mocks/data/users';

const STORAGE_KEY = 'hyejaMockStore';

const buildInitialState = () => ({
  users: USERS.map((user) => ({ ...user, profile: { ...user.profile } })),
  favorites: {
    1: [
      { policyId: 2, status: FAVORITE_STATUS.PREPARING, savedAt: '2026-09-19' },
      { policyId: 1, status: FAVORITE_STATUS.INTEREST, savedAt: '2026-09-19' },
      { policyId: 4, status: FAVORITE_STATUS.INTEREST, savedAt: '2026-09-18' },
      { policyId: 8, status: FAVORITE_STATUS.APPLIED, savedAt: '2026-09-17' },
      { policyId: 3, status: FAVORITE_STATUS.INTEREST, savedAt: '2026-09-16' },
    ],
    2: [],
  },
  notifications: { 1: NOTIFICATIONS.map((item) => ({ ...item })), 2: [] },
  collectLog: {
    status: 'SUCCESS',
    startedAt: '2026-09-18T03:00:02+09:00',
    finishedAt: '2026-09-18T03:01:47+09:00',
    fetchedCount: 142,
    newCount: 3,
    updatedCount: 5,
    closedCount: 2,
  },
  lastUserId: 2,
  lastNotificationId: 3,
});

const readState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved ? JSON.parse(saved) : buildInitialState();
  } catch {
    return buildInitialState();
  }
};

let state = readState();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장 공간을 못 쓰면 이번 세션 동안만 상태를 유지한다.
  }
};

export const mockStore = {
  getState() {
    return state;
  },

  update(updater) {
    state = updater(state) ?? state;
    persist();

    return state;
  },

  reset() {
    state = buildInitialState();
    persist();

    return state;
  },
};

export const buildAccessToken = (userId) => `mock-access-token-${userId}`;

export const findUserByToken = (authorization) => {
  const token = authorization?.replace('Bearer ', '');
  const userId = Number(token?.replace('mock-access-token-', ''));

  return state.users.find((user) => user.id === userId) ?? null;
};
