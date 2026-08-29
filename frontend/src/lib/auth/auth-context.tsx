'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { UserModel } from '@/types/api.generated';
import { tokenStore } from './token-store';

interface AuthContextType {
  user: UserModel | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
  hasRole: (role: string | string[]) => boolean;
  isCustomer: boolean;
  isMitra: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isMarketing: boolean;
  isCustomerService: boolean;
  isStaff: boolean;
  login: (user: UserModel, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserModel | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate on mount
  useEffect(() => {
    try {
      const storedToken = tokenStore.getToken();
      const storedUser = tokenStore.getUser();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newUser: UserModel, newToken: string) => {
    tokenStore.setToken(newToken);
    tokenStore.setUser(newUser);
    setUser(newUser);
    setToken(newToken);
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
    setToken(null);
  };

  const roles = useMemo(() => user?.roles || [], [user]);

  const hasRole = (roleQuery: string | string[]) => {
    if (!user || !user.roles) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;
    if (Array.isArray(roleQuery)) {
      return roleQuery.some((r) => user.roles.includes(r));
    }
    return user.roles.includes(roleQuery);
  };

  const isCustomer = hasRole('CUSTOMER');
  const isMitra = hasRole('MITRA_SERVICE');
  const isAdmin = hasRole('ADMIN');
  const isSuperAdmin = hasRole('SUPER_ADMIN');
  const isMarketing = hasRole('MARKETING');
  const isCustomerService = hasRole('CUSTOMER_SERVICE');
  const isStaff = hasRole(['ADMIN', 'SUPER_ADMIN', 'MARKETING', 'CUSTOMER_SERVICE']);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    roles,
    hasRole,
    isCustomer,
    isMitra,
    isAdmin,
    isSuperAdmin,
    isMarketing,
    isCustomerService,
    isStaff,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
