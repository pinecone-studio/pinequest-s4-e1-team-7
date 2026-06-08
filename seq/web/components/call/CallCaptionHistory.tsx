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
  const fontSize = `${Math.round(16 * textScale)}px`;
  return (
    <div className="flex flex-col gap-2 md:gap-2.5">
      {entries.map((entry) => {
        const mine = entry.speaker === "me";
        return (
          <div
            key={entry.id}
            className={`flex ${mine ? "justify-end" : "justify-start"}`}
          >
            <p
              className={`max-w-[88%] rounded-2xl px-3.5 py-2 leading-snug md:px-4 md:py-2.5 ${
                mine
                  ? "rounded-br-md bg-[#FFE566]/20 text-[#FFE566]"
                  : "rounded-bl-md bg-white/10 text-white/90"
              }`}
              style={{ fontSize }}
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

  const panelStyle = {
    background: "rgba(0,0,0,0.62)",
    border: "1px solid rgba(255,255,255,0.15)",
  };

  if (variant === "mobile") {
    return (
      <div className="flex h-full min-h-0 flex-col bg-zinc-950" aria-label="Ярианы түүх">
        <button
          type="button"
          onClick={onToggle}
          className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2.5 text-left"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
            Ярианы түүх
          </span>
          {onToggle && (
            <ChevronLeftIcon
              className={`h-4 w-4 text-white/50 transition-transform ${open ? "rotate-90" : "-rotate-90"}`}
            />
          )}
        </button>
        {open && (
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overscroll-contain px-3 py-2"
          >
            {entries.length === 0 ? (
              <p className="py-4 text-center text-[15px] text-white/40">
                Танигдсан текст энд харагдана
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
      {!open && onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Чат нээх"
          className="pointer-events-auto absolute right-0 top-1/2 z-[35] hidden -translate-y-1/2 flex-col items-center gap-2 rounded-l-2xl border border-r-0 border-white/20 bg-black/75 px-3 py-5 shadow-[-4px_0_24px_rgba(0,0,0,0.45)] backdrop-blur-lg transition hover:bg-black/85 active:scale-[0.98] md:flex"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-[#FFE566]" />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70"
            style={{ writingMode: "vertical-lr" }}
          >
            Чат
          </span>
          <ChevronLeftIcon className="h-4 w-4 text-white/50" />
        </button>
      )}

      <aside
        className="pointer-events-none absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-0 top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 hidden min-w-[220px] transition-transform duration-300 ease-out md:flex md:flex-col"
        style={{
          width: SIDEBAR_W,
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
        aria-label="Ярианы түүх"
      >
        <div
          className="pointer-events-auto relative mx-3 mb-3 flex flex-1 flex-col overflow-hidden rounded-2xl backdrop-blur-md"
          style={panelStyle}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-white/50">
              Ярианы түүх
            </p>
            {onToggle && (
              <button
                type="button"
                onClick={onToggle}
                aria-label="Чат хаах"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 active:scale-95"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col justify-end overflow-y-auto px-3 pb-3"
          >
            {entries.length === 0 ? (
              <p className="px-1 py-6 text-center text-[16px] text-white/35">
                Танигдсан текст энд хадгалагдана
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
