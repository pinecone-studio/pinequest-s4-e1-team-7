"use client";
import { useCallback, useEffect, useState } from "react";
import type { Theme } from "@/lib/types";

const KEY = "dohio-theme";
const EVENT = "theme-change";

function getInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(KEY) as Theme | null;
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  return saved ?? (prefersLight ? "light" : "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: theme }));
  }, [theme]);

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
