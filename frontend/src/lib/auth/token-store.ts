/**
 * Token Storage & Client Auth Helpers
 */

import { UserModel } from '@/types/api.generated';

const TOKEN_KEY = 'beresin_auth_token';
const USER_KEY = 'beresin_auth_user';

export const tokenStore = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Error saving token to localStorage:', e);
    }
  },

  getUser(): UserModel | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user: UserModel) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user to localStorage:', e);
    }
  },

  clear() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error clearing auth from localStorage:', e);
    }
  },
};
