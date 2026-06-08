"use client";

import { useEffect, useRef } from "react";
import type { CaptionHistoryEntry } from "@/hooks/useCallCaptions";

type Props = {
  entries: CaptionHistoryEntry[];
  /** mobile = доор scroll-той panel, desktop = баруун sidebar */
  variant?: "mobile" | "desktop";
};

function ChatBubbles({ entries }: { entries: CaptionHistoryEntry[] }) {
  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      {entries.map((entry) => {
        const mine = entry.speaker === "me";
        return (
          <div
            key={entry.id}
            className={`flex ${mine ? "justify-end" : "justify-start"}`}
          >
            <p
              className={`max-w-[88%] rounded-2xl px-3 py-1.5 text-[11px] leading-snug md:py-2 md:text-[12px] ${
                mine
                  ? "rounded-br-md bg-[#FFE566]/20 text-[#FFE566]"
                  : "rounded-bl-md bg-white/10 text-white/85"
              }`}
            >
              {entry.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function CallCaptionHistory({ entries, variant = "desktop" }: Props) {
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
        <p className="shrink-0 border-b border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/55">
          Ярианы түүх
        </p>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-3 py-2"
        >
          {entries.length === 0 ? (
            <p className="py-4 text-center text-[11px] text-white/40">
              Танигдсан текст энд харагдана
            </p>
          ) : (
            <ChatBubbles entries={entries} />
          )}
        </div>
      </div>
    );
  }

  return (
    <aside
      className="pointer-events-none absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-0 top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 hidden w-[min(34vw,280px)] min-w-[200px] md:flex md:flex-col"
      aria-label="Ярианы түүх"
    >
      <div
        className="mx-3 mb-3 flex flex-1 flex-col overflow-hidden rounded-2xl backdrop-blur-md"
        style={panelStyle}
      >
        <p className="shrink-0 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">
          Ярианы түүх
        </p>
        <div
          ref={scrollRef}
          className="flex flex-1 flex-col justify-end overflow-y-auto px-3 pb-3"
        >
          {entries.length === 0 ? (
            <p className="px-1 py-6 text-center text-[12px] text-white/35">
              Танигдсан текст энд хадгалагдана
            </p>
          ) : (
            <ChatBubbles entries={entries} />
          )}
        </div>
      </div>
    </aside>
  );
}
