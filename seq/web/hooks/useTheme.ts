"use client";
import { useCallback, useEffect, useState } from "react";
import type { Theme } from "@/lib/types";

const KEY = "dohio-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Theme | null;
    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
    setTheme(saved ?? (prefersLight ? "light" : "dark"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, toggle };
}
