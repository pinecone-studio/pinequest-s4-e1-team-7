"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "./UserAvatar";

export function ProfileAvatarButton({ size = 40 }: { size?: number }) {
  const { user } = useAuth();
  const router = useRouter();
  const name = user?.name ?? user?.email ?? "Хэрэглэгч";

  return (
    <button
      type="button"
      onClick={() => router.push("/dashboard/settings")}
      aria-label="Тохиргоо"
      className="rounded-full transition-all duration-150 hover:scale-105 hover:brightness-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
    >
      <UserAvatar name={name} avatarUrl={user?.avatarUrl} size={size} />
    </button>
  );
}
