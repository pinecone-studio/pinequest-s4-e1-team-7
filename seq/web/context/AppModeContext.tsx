"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type AppMode,
  getStoredAppMode,
  homePathForMode,
  setStoredAppMode,
} from "@/lib/accessibility-mode";

type AppModeValue = {
  mode: AppMode | null;
  setMode: (mode: AppMode) => void;
  homePath: string;
};

const AppModeContext = createContext<AppModeValue | null>(null);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode | null>(null);

  useEffect(() => {
    setModeState(getStoredAppMode());
  }, []);

  const setMode = useCallback((next: AppMode) => {
    setStoredAppMode(next);
    setModeState(next);
  }, []);

  const homePath = mode ? homePathForMode(mode) : "/mode";

  return (
    <AppModeContext.Provider value={{ mode, setMode, homePath }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) throw new Error("useAppMode within AppModeProvider");
  return ctx;
}
