"use client";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/hooks/useTheme";

export const Switch = () => {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Гэрэл горим руу шилжих" : "Бараан горим руу шилжих"}
      className="relative flex h-8 w-[3.25rem] items-center rounded-full transition-colors duration-200 active:scale-95"
      style={{ border: "1px solid var(--border-c)", background: "var(--surface-2)" }}
    >
      <span
        className="absolute flex items-center justify-center rounded-full shadow-sm transition-all duration-300 ease-in-out"
        style={{ width: "1.5rem", height: "1.5rem", left: dark ? "calc(100% - 1.625rem)" : "0.125rem", background: "var(--olive)" }}
      >
        {dark ? <MoonIcon className="h-3.5 w-3.5 text-black" /> : <SunIcon className="h-3.5 w-3.5 text-black" />}
      </span>
    </button>
  );
};

export default Switch;
