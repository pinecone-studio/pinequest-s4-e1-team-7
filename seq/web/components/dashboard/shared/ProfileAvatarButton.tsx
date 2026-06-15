"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "./UserAvatar";

export const AVATAR_PRESET_KEY = "sb_preset_avatar";

/** Reads the stored preset from localStorage, re-syncs when Settings changes it. */
export function usePresetAvatar() {
  const [preset, setPreset] = useState<string | null>(null);

  useEffect(() => {
    setPreset(localStorage.getItem(AVATAR_PRESET_KEY));

    const onStorage = (e: StorageEvent) => {
      if (e.key === AVATAR_PRESET_KEY) setPreset(e.newValue);
    };
    // custom event for same-tab updates from Settings
    const onPreset = (e: Event) => {
      setPreset((e as CustomEvent<string | null>).detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("sb-preset-avatar", onPreset);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sb-preset-avatar", onPreset);
    };
  }, []);

  return preset;
}

export function ProfileAvatarButton({ size = 40 }: { size?: number }) {
  const { user } = useAuth();
  const router = useRouter();
  const name = user?.name ?? user?.email ?? "Хэрэглэгч";
  const preset = usePresetAvatar();

  return (
    <button
      type="button"
      onClick={() => router.push("/dashboard/settings")}
      aria-label="Тохиргоо"
      className="rounded-full transition-all duration-150 hover:scale-105 hover:brightness-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
    >
      <UserAvatar name={name} avatarUrl={preset ?? user?.avatarUrl} size={size} />
    </button>
  );
}
