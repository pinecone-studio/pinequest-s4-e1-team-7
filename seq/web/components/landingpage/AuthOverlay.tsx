"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function AuthOverlay() {
  const router = useRouter();
  const mode = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("auth")
    : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mode === "login") router.replace("/auth/login");
    if (mode === "register") router.replace("/auth/register");
  }, [mode, router]);

  if (!mounted || (mode !== "login" && mode !== "register")) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <button
          type="button"
          onClick={() => router.replace("/")}
          className="absolute right-3 top-3"
          aria-label="Хаах"
        >
          <XMarkIcon className="h-6 w-6 text-gray-500" />
        </button>
        <p className="mb-4 text-gray-600">Шилжиж байна...</p>
        <Link href={mode === "login" ? "/auth/login" : "/auth/register"} className="font-bold text-[#0d1e35]">
          {mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
        </Link>
      </div>
    </div>,
    document.body,
  );
}
