"use client";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type Props = { title: string; right?: ReactNode };

export function PageHeader({ title, right }: Props) {
  const router = useRouter();
  return (
    <div className="flex items-center pb-2 pt-5">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Буцах"
        className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
        style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
      >
        <ChevronLeftIcon className="h-5 w-5" style={{ color: "var(--text)" }} />
      </button>
      <h1
        className="flex-1 text-center text-[17px] font-bold md:text-[20px]"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h1>
      <div className="flex h-10 min-w-[2.5rem] items-center justify-end">{right}</div>
    </div>
  );
}
