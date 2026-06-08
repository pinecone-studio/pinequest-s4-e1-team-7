"use client";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/hooks/useTheme";

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Загвар солих"
      className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
      style={{ border: "1px solid var(--border-c)", background: "var(--surface)", color: "var(--text)" }}
    >
      {theme === "dark"
        ? <MoonIcon className="h-[18px] w-[18px]" />
        : <SunIcon className="h-[18px] w-[18px]" />}
    </button>
  );
};
