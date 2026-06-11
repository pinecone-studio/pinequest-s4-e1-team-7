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
      className="rounded-full transition-opacity hover:opacity-90 active:scale-95"
    >
      <UserAvatar name={name} avatarUrl={user?.avatarUrl} size={size} />
    </button>
  );
}
