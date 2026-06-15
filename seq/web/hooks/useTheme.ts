"use client";
import { useCallback, useEffect, useState } from "react";
import type { Theme } from "@/lib/types";

const KEY = "dohio-theme";
const EVENT = "theme-change";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");
  // `ready` stays false until after the saved preference has been read.
  // The persist effect is gated on this so the default "dark" placeholder
  // never overwrites a previously saved "light" preference.
  const [ready, setReady] = useState(false);

  // Read saved preference on first mount.
  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Theme | null;
    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
    const initial = saved ?? (prefersLight ? "light" : "dark");
    setTheme(initial);
    setReady(true);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  // Persist + broadcast — only runs after ready (skips the default "dark" render).
  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: theme }));
  }, [theme, ready]);

  // Sync with other useTheme instances on the same page and other tabs.
  useEffect(() => {
    const onSamePage = (e: Event) => {
      const next = (e as CustomEvent<Theme>).detail;
      setTheme((cur) => (cur !== next ? next : cur));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setTheme(e.newValue as Theme);
    };
    window.addEventListener(EVENT, onSamePage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onSamePage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, toggle };
}
