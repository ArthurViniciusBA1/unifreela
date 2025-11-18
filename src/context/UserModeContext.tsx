'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type UserMode = 'FREELANCER' | 'CLIENTE';

interface UserModeContextValue {
  currentMode: UserMode;
  setMode: (mode: UserMode) => void;
  isReady: boolean;
}

const STORAGE_KEY = 'univagas:user-mode';
const DEFAULT_MODE: UserMode = 'FREELANCER';

const UserModeContext = createContext<UserModeContextValue | undefined>(undefined);

export function UserModeProvider({ children }: { children: React.ReactNode }) {
  const [currentMode, setCurrentMode] = useState<UserMode>(DEFAULT_MODE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedMode = window.localStorage.getItem(STORAGE_KEY) as UserMode | null;
    if (storedMode === 'CLIENTE' || storedMode === 'FREELANCER') {
      setCurrentMode(storedMode);
    }
    setIsReady(true);
  }, []);

  const setMode = useCallback((mode: UserMode) => {
    setCurrentMode(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  }, []);

  const value = useMemo(
    () => ({
      currentMode,
      setMode,
      isReady,
    }),
    [currentMode, isReady, setMode]
  );

  return <UserModeContext.Provider value={value}>{children}</UserModeContext.Provider>;
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (!context) {
    throw new Error('useUserMode deve ser usado dentro de UserModeProvider');
  }
  return context;
}


