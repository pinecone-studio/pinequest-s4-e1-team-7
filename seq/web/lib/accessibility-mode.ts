export type AppMode = "standard" | "accessible";

const MODE_KEY = "sb_app_mode";

export function getStoredAppMode(): AppMode | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(MODE_KEY);
  if (v === "standard" || v === "accessible") return v;
  return null;
}

export function setStoredAppMode(mode: AppMode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function homePathForMode(mode: AppMode): string {
  return mode === "accessible" ? "/accessible/chat" : "/dashboard/overview";
}
