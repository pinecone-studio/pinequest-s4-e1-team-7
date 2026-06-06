"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export const Switch = () => {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Гэрэл горим руу шилжих" : "Бараан горим руу шилжих"}
      className="relative flex h-8 w-[3.25rem] items-center rounded-full border border-border bg-muted transition-colors duration-200 hover:border-primary/50 active:scale-95"
    >
      <span
        className="absolute flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-300 ease-in-out"
        style={{ left: dark ? "calc(100% - 1.625rem)" : "0.125rem" }}
      >
        {dark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      </span>
    </button>
  );
};

export default Switch;
