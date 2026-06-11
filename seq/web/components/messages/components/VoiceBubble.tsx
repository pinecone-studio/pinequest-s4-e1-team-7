"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = { url: string; durationMs: number | null; mine: boolean };

export function VoiceBubble({ url, durationMs, mine }: Props) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const secs = durationMs ? Math.round(durationMs / 1000) : null;

  return (
    <button
      type="button"
      onClick={() => {
        const el = ref.current;
        if (!el) return;
        if (playing) {
          el.pause();
        } else {
          void el.play();
        }
      }}
      className={cn(
        "flex min-w-[140px] items-center gap-2 rounded-2xl px-3 py-2 text-left",
        mine ? "bg-[var(--olive)] text-[#0d1e35]" : "bg-[var(--surface-2)]",
      )}
    >
      <span className="text-lg">{playing ? "⏸" : "▶"}</span>
      <span className="text-[13px] font-semibold">{secs ? `${secs}s` : "Дуу"}</span>
      <audio
        ref={ref}
        src={url}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </button>
  );
}
