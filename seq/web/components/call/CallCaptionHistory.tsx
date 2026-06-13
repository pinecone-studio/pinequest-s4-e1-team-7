"use client";

import { useEffect, useRef } from "react";
import {
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { CaptionHistoryEntry } from "@/hooks/useCallCaptions";

const SIDEBAR_W = "min(36vw,320px)";

type Props = {
  entries: CaptionHistoryEntry[];
  variant?: "mobile" | "desktop";
  open?: boolean;
  onToggle?: () => void;
  textScale?: number;
};

function ChatBubbles({ entries, textScale = 1 }: { entries: CaptionHistoryEntry[]; textScale?: number }) {
  const fontSize = `${Math.round(15 * textScale)}px`;
  return (
    <div className="flex flex-col gap-2 md:gap-2.5">
      {entries.map((entry) => {
        const mine = entry.speaker === "me";
        return (
          <div key={entry.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[88%] rounded-2xl px-3.5 py-2 leading-snug md:px-4 md:py-2.5 ${
                mine ? "rounded-br-md" : "rounded-bl-md"
              }`}
              style={{
                fontSize,
                background: mine ? "var(--olive)" : "var(--surface-2)",
                color: mine ? "#0d1e35" : "var(--text)",
                border: mine ? "1.5px solid var(--olive-2)" : "1px solid var(--border-c)",
              }}
            >
              {entry.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function CallCaptionHistory({
  entries,
  variant = "desktop",
  open = true,
  onToggle,
  textScale = 1,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  if (variant === "mobile") {
    return (
      <div
        className="flex h-full min-h-0 flex-col"
        aria-label="Ярианы түүх"
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex shrink-0 items-center justify-between px-4 py-3 text-left"
          style={{ borderBottom: "1px solid var(--border-c)" }}
        >
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-4 w-4" style={{ color: "var(--olive)" }} />
            <span
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-sans)" }}
            >
              Ярианы түүх
            </span>
          </div>
          {onToggle && (
            <ChevronLeftIcon
              className="h-4 w-4 transition-transform"
              style={{ color: "var(--text-3)", transform: open ? "rotate(90deg)" : "rotate(-90deg)" }}
            />
          )}
        </button>
        {open && (
          <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
            {entries.length === 0 ? (
              <p className="py-6 text-center text-[14px]" style={{ color: "var(--text-3)" }}>
                Хөрвүүлсэн бичвэр энд харагдана...
              </p>
            ) : (
              <ChatBubbles entries={entries} textScale={textScale} />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Collapsed tab */}
      {!open && onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Чат нээх"
          className="pointer-events-auto absolute right-0 top-1/2 z-[35] hidden -translate-y-1/2 flex-col items-center gap-2 rounded-l-2xl px-3 py-5 transition-all duration-150 hover:opacity-90 active:scale-[0.98] md:flex"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-c)",
            borderRight: "none",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
          }}
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" style={{ color: "var(--olive)" }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ writingMode: "vertical-lr", color: "var(--text-3)", fontFamily: "var(--font-sans)" }}
          >
            Чат
          </span>
          <ChevronLeftIcon className="h-4 w-4" style={{ color: "var(--text-3)" }} />
        </button>
      )}

      {/* Desktop sidebar */}
      <aside
        className="pointer-events-none absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-0 top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 hidden min-w-[220px] transition-transform duration-300 ease-out md:flex md:flex-col"
        style={{ width: SIDEBAR_W, transform: open ? "translateX(0)" : "translateX(100%)" }}
        aria-label="Ярианы түүх"
      >
        <div
          className="pointer-events-auto relative mx-3 mb-3 flex flex-1 flex-col overflow-hidden rounded-2xl backdrop-blur-xl"
          style={{
            background: "transparent",
            border: "1px solid color-mix(in srgb, var(--border-c) 50%, transparent)",
          }}
        >
          {/* Header */}
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
          >
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-4 w-4 shrink-0" style={{ color: "var(--olive)" }} />
              <p
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "#fff", fontFamily: "var(--font-sans)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
              >
                Ярианы түүх
              </p>
            </div>
            {onToggle && (
              <button
                type="button"
                onClick={onToggle}
                aria-label="Чат хаах"
                className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.25)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                }}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex flex-1 flex-col justify-end overflow-y-auto px-3 pb-3 pt-2">
            {entries.length === 0 ? (
              <p
                className="px-1 py-6 text-center text-[14px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-sans)", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
              >
                Хөрвүүлсэн бичвэр энд харагдана...
              </p>
            ) : (
              <ChatBubbles entries={entries} textScale={textScale} />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
