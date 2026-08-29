import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStore } from '@/lib/auth/token-store';

describe('Token Store & Auth Helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves JWT token securely', () => {
    expect(tokenStore.getToken()).toBeNull();
    tokenStore.setToken('test_jwt_token_123');
    expect(tokenStore.getToken()).toBe('test_jwt_token_123');
  });

  it('clears stored token and user data on logout', () => {
    tokenStore.setToken('token_abc');
    tokenStore.setUser({
      id: 1,
      uuid: 'uuid-1',
      name: 'Budi Santoso',
      phone: '081234567890',
      status: 'ACTIVE' as any,
      roles: ['CUSTOMER'],
    });

    expect(tokenStore.getToken()).toBe('token_abc');
    expect(tokenStore.getUser()?.name).toBe('Budi Santoso');

    tokenStore.clear();
    expect(tokenStore.getToken()).toBeNull();
    expect(tokenStore.getUser()).toBeNull();
  });
});
