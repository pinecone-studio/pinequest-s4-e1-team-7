"use client";

import { useEffect } from "react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export type SignEntry = { letter: string; url: string };

type Props = {
  entries: SignEntry[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

export function SignViewer({ entries, index, onClose, onIndexChange }: Props) {
  const current = entries[index];
  const hasPrev = index > 0;
  const hasNext = index < entries.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && hasPrev) onIndexChange(index - 1);
      else if (e.key === "ArrowRight" && hasNext) onIndexChange(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, hasPrev, hasNext, onClose, onIndexChange]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${current.letter} үсгийн дохио`}
    >
      <div
        className="relative flex w-full max-w-lg flex-col items-center p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Хаах"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-150 active:scale-95"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          <XMarkIcon className="h-5 w-5" style={{ color: "#fff" }} />
        </button>

        {/* Image with prev / next */}
        <div className="mt-6 flex w-full items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => hasPrev && onIndexChange(index - 1)}
            disabled={!hasPrev}
            aria-label="Өмнөх"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full backdrop-blur-md transition-all duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            <ChevronLeftIcon className="h-6 w-6" style={{ color: "#fff" }} />
          </button>

          <div className="aspect-square w-full max-w-[340px]">
            <img
              src={current.url}
              alt={current.letter}
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>

          <button
            type="button"
            onClick={() => hasNext && onIndexChange(index + 1)}
            disabled={!hasNext}
            aria-label="Дараах"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full backdrop-blur-md transition-all duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            <ChevronRightIcon className="h-6 w-6" style={{ color: "#fff" }} />
          </button>
        </div>

        {/* Letter caption */}
        <span
          className="mt-5 text-[34px] font-black leading-none"
          style={{ color: "var(--text)", fontFamily: "var(--font-sans)" }}
        >
          {current.letter === " " ? "␣" : current.letter}
        </span>
      </div>
    </div>
  );
}
