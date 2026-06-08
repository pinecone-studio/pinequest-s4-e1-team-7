"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Cog6ToothIcon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { initial } from "@/lib/utils";

export function AvatarMenu() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const name = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "Хэрэглэгч";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const avatar = user?.imageUrl;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Профайл"
        className="flex h-10 w-10 overflow-hidden rounded-full transition-opacity hover:opacity-90"
        style={{ border: "2px solid var(--border-c)" }}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[14px] font-bold"
            style={{ background: "linear-gradient(150deg, var(--olive-bright), var(--olive-deep))", color: "#0d1e35" }}
          >
            {initial(name)}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border-c)", boxShadow: "var(--shadow)" }}
          >
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-c)" }}>
              <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>{name}</p>
              {email && <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-3)" }}>{email}</p>}
            </div>

            <button
              onClick={() => { setOpen(false); router.push("/dashboard/settings"); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-semibold transition-colors hover:bg-[var(--surface-2)]"
              style={{ color: "var(--text-2)" }}
            >
              <Cog6ToothIcon className="h-4 w-4" /> Тохиргоо
            </button>

            <button
              onClick={() => { setOpen(false); signOut(() => router.push("/")); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-semibold transition-colors hover:bg-[var(--surface-2)]"
              style={{ borderTop: "1px solid var(--border-c)", color: "#e53535" }}
            >
              <ArrowRightEndOnRectangleIcon className="h-4 w-4" /> Гарах
            </button>
          </div>
        </>
      )}
    </div>
  );
}
