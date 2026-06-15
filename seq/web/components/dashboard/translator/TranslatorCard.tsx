"use client";

import { useState } from "react";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { FontSizeControl } from "@/components/ui/FontSizeControl";

type Props = {
  detected: string;
  running: boolean;
  modelLoading?: boolean;
  speaking: boolean;
  volume: number;
  onSpeak: () => void;
  onVolumeChange: (v: number) => void;
};

export function TranslatorCard({
  detected,
  running,
  modelLoading = false,
  speaking,
  volume,
  onSpeak,
  onVolumeChange,
}: Props) {
  const [fontSize, setFontSize] = useState(22);

  const placeholder = running
    ? modelLoading ? "Ачааллаж байна…" : "Хүлээж байна…"
    : "Бичвэр энд харагдана...";

  const btnStyle = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-c)",
    color: "var(--text-2)",
  };
  const volPct = Math.round(volume * 100);

  return (
    <section
      className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-[22px] p-5 md:rounded-[24px] md:p-6"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--olive)" }} />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-3)" }}>
          Хөрвүүлсэн бичвэр
        </p>
        {speaking && (
          <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--olive)" }}>
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--olive)" }} />
            Уншиж байна…
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {detected ? (
          <p className="w-full break-words font-bold leading-snug" style={{ fontSize: `${fontSize}px`, color: "var(--text)" }}>
            {detected}
          </p>
        ) : (
          <p className="italic leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text-3)" }}>
            {placeholder}
          </p>
        )}
      </div>

      <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: "var(--border-c)" }}>
        <FontSizeControl size={fontSize} onChange={setFontSize} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSpeak}
            disabled={!detected}
            aria-label="Дуугаар унших"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-150 hover:scale-105 hover:brightness-110 active:scale-90 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
            style={speaking ? { background: "var(--olive)", border: "none" } : btnStyle}
          >
            <SpeakerWaveIcon className="h-5 w-5" style={{ color: speaking ? "#0d1e35" : "var(--text-2)" }} />
          </button>
          <input
            type="range" min={0} max={100} value={volPct}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            className="range-line flex-1 cursor-pointer"
            aria-label="Дуу"
            style={{
              background: `linear-gradient(to right, var(--olive) ${volPct}%, var(--border-c) ${volPct}%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
