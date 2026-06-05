"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="outline" size="icon" onClick={toggle} aria-label="Загвар солих">
      {theme === "dark" ? <Moon /> : <Sun />}
    </Button>
  );
};
