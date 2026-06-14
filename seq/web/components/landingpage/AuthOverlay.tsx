"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const AuthOverlay = () => {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}>
      <div className="relative w-full max-w-sm rounded-2xl p-6 text-center shadow-xl" style={{ background: "var(--surface)" }}>
        <button type="button" onClick={() => router.replace("/")} className="absolute right-3 top-3" aria-label="Хаах">
          <XMarkIcon className="h-6 w-6" style={{ color: "var(--text-3)" }} />
        </button>
        <p className="mb-4 text-[14px]" style={{ color: "var(--text-2)" }}>Ачааллаж байна...</p>
        <Link href={mode === "login" ? "/auth/login" : "/auth/register"} className="font-bold" style={{ color: "var(--text)" }}>
          {mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
        </Link>
      </div>
    </div>,
    document.body,
  );
};
