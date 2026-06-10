import { getStoredToken } from "@/context/AuthContext";
import type { AuthUser } from "@/context/AuthContext";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function uploadAvatar(file: File): Promise<AuthUser> {
  const token = getStoredToken();
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${BASE}/api/auth/avatar`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Зураг хадгалахад алдаа гарлаа");
  return data as AuthUser;
}

export async function updateProfile(payload: {
  name: string;
  phone: string;
}): Promise<AuthUser> {
  const token = getStoredToken();
  const res = await fetch(`${BASE}/api/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Хадгалахад алдаа гарлаа");
  return data as AuthUser;
}
