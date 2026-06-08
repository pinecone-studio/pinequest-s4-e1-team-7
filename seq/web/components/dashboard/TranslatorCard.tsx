"use client";

import { useState } from "react";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";

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

  return (
    <section
      className="flex flex-1 flex-col overflow-hidden rounded-[22px] p-5 md:rounded-[24px] md:p-6"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--olive)" }} />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-3)" }}>
          Хөрвүүлсэн бичвэр
        </p>
      </div>

      {/* Scrollable text area */}
      <div className="min-h-[120px] flex-1 overflow-y-auto">
        {detected ? (
          <p className="font-semibold leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text)" }}>
            {detected}
          </p>
        ) : (
          <p className="italic leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text-3)" }}>
            {placeholder}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: "var(--border-c)" }}>
        {/* Font size row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSize((s) => Math.max(14, s - 2))}
            aria-label="Фонт багасгах"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-all active:scale-90"
            style={btnStyle}
          >
            A
          </button>
          <input
            type="range" min={14} max={32} step={2} value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="range-line flex-1 cursor-pointer"
            aria-label="Фонтын хэмжээ"
            style={{
              background: `linear-gradient(to right, var(--olive) ${((fontSize - 14) / 18) * 100}%, var(--border-c) ${((fontSize - 14) / 18) * 100}%)`,
            }}
          />
          <button
            onClick={() => setFontSize((s) => Math.min(32, s + 2))}
            aria-label="Фонт томруулах"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[18px] font-bold transition-all active:scale-90"
            style={btnStyle}
          >
            A
          </button>
        </div>

        {/* Volume + speak row */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSpeak}
            disabled={!detected}
            aria-label="Дуугаар унших"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-30"
            style={speaking ? { background: "var(--olive)", border: "none" } : btnStyle}
          >
            <SpeakerWaveIcon className="h-5 w-5" style={{ color: speaking ? "#0d1e35" : "var(--text-2)" }} />
          </button>
          <input
            type="range" min={0} max={100} value={Math.round(volume * 100)}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            className="range-line flex-1 cursor-pointer"
            aria-label="Дуу"
            style={{
              background: `linear-gradient(to right, var(--olive) ${Math.round(volume * 100)}%, var(--border-c) ${Math.round(volume * 100)}%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
