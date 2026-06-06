"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { HistoryKind, Settings, Stats, Toast, ToastKind } from "@/lib/types";
import { countWords } from "@/lib/utils";

interface AppValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  stats: Stats;
  pushHistory: (kind: HistoryKind, text: string) => void;
  toasts: Toast[];
  toast: (kind: ToastKind, message: string, icon?: string) => void;
}

const AppContext = createContext<AppValue | null>(null);
const EMPTY_STATS: Stats = { words: 0, sessions: 0, history: [] };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({ gender: "female", rate: 1, autoSpeak: true });
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
    [],
  );

  const pushHistory = useCallback((kind: HistoryKind, text: string) => {
    if (!text.trim()) return;
    setStats((s) => ({
      words: s.words + countWords(text),
      sessions: s.sessions + 1,
      history: [{ kind, text, time: "Дөнгөж сая" }, ...s.history].slice(0, 30),
    }));
    // TODO: await recordTranslation({ userId, kind, text }) from lib/api.ts
  }, []);

  const toast = useCallback((kind: ToastKind, message: string, icon = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, stats, pushHistory, toasts, toast }),
    [settings, updateSettings, stats, pushHistory, toasts, toast],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = (): AppValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
