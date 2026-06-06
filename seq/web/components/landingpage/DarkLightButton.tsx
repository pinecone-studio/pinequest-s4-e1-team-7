"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const Switch = () => {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle theme"
      className="relative flex h-7 w-13 items-center rounded-full border border-border bg-muted transition-colors hover:border-primary/50"
    >
      <span
        className="absolute flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-all duration-300"
        style={{ left: dark ? "calc(100% - 1.5rem)" : "0.125rem" }}
      >
        {dark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      </span>
    </button>
  );
};

export default Switch;
