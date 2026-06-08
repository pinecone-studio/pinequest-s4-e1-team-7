"use client";

import { ArrowPathIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";

type Props = {
  running: boolean;
  detected: string;
  onToggle: () => void;
  onSpeak: () => void;
  onReset: () => void;
};

export function TranslatorControlBar({
  running,
  detected,
  onToggle,
  onSpeak,
  onReset,
}: Props) {
  return (
    <footer
      className="flex w-full items-center justify-between gap-4 rounded-[24px] px-5 py-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={running ? "Зогсоох" : "Эхлүүлэх"}
          className="flex h-14 w-14 items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            background: running ? "var(--surface-2)" : "var(--olive)",
            color: running ? "var(--text)" : "#0d1e35",
            border: running ? "1px solid var(--border-c)" : "none",
            boxShadow: running ? "none" : "0 4px 20px rgba(245,197,24,0.35)",
          }}
        >
          {running ? <StopIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
        </button>
        <p className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>
          {running ? "Зогсоох" : "Эхлүүлэх"}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onSpeak}
          disabled={!detected}
          className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-opacity disabled:opacity-40"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-c)",
            color: "var(--text)",
          }}
        >
          <SpeakerWaveIcon className="h-4 w-4" />
          Дуугаар
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-c)",
            color: "var(--text)",
          }}
        >
          <ArrowPathIcon className="h-4 w-4" />
          Цэвэрлэх
        </button>
      </div>
    </footer>
  );
}
