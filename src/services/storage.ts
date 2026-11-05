import { User } from '../types';

const CURRENT_USER_KEY = 'civicai_active_user_v1';

export const saveCurrentUser = (user: User) => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed storing cached user profile', error);
  }
};

export const clearStoredCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
