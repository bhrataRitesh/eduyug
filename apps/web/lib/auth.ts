'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { UserProfileResponse, AuthTokens } from '@eduyug/shared-types';

export const AUTH_CHANGE_EVENT = 'eduyug:auth-change';

export function getStoredUser(): UserProfileResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('eduyug_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(user: UserProfileResponse, tokens: AuthTokens) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('eduyug_token', tokens.accessToken);
  localStorage.setItem('eduyug_refreshToken', tokens.refreshToken);
  localStorage.setItem('eduyug_user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: user }));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('eduyug_token');
  localStorage.removeItem('eduyug_refreshToken');
  localStorage.removeItem('eduyug_user');
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: null }));
}

export function useAuth() {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // 1. Initial sync
    setUser(getStoredUser());
    setLoading(false);

    // 2. Listen to custom auth events
    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfileResponse | null>;
      setUser(customEvent.detail ?? getStoredUser());
    };

    // 3. Listen to cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eduyug_user' || e.key === 'eduyug_token') {
        setUser(getStoredUser());
      }
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isInstructor: user?.role === 'instructor' || user?.role === 'admin',
    logout: () => {
      clearSession();
      window.location.href = '/';
    },
  };
}
