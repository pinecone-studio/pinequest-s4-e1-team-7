"use client";

import { ArrowPathIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";

type Props = {
  running: boolean;
  modelReady: boolean;
  showSettings: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSettings: () => void;
};

export function TranslatorControlBar({
  running,
  modelReady,
  showSettings,
  onToggle,
  onReset,
  onSettings,
}: Props) {

  return (
    <footer
      className="flex shrink-0 items-center gap-3 rounded-[24px] px-5 py-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Play / Stop — pill with text label */}
      <button
        type="button"
        onClick={onToggle}
        disabled={!modelReady && !running}
        aria-label={running ? "Зогсоох" : "Эхлүүлэх"}
        className="flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-50"
        style={{
          background: running ? "var(--surface-2)" : "var(--olive)",
          color: running ? "var(--text)" : "#0d1e35",
          border: running ? "1px solid var(--border-c)" : "none",
          boxShadow: running ? "none" : "0 4px 20px rgba(245,197,24,0.35)",
        }}
      >
        {running ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
        {running ? "Зогсоох" : "Эхлүүлэх"}
      </button>

      {/* Status */}
      <div className="flex flex-1 items-center gap-2">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors"
          style={{ background: running ? "var(--olive)" : "var(--text-3)" }}
        />
        <span
          className="text-[12px] font-semibold transition-colors"
          style={{ color: running ? "var(--text)" : "var(--text-3)" }}
        >
          {running ? "Идэвхтэй" : "Идэвхгүй"}
        </span>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={onReset}
        aria-label="Цэвэрлэх"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-90"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
      >
        <ArrowPathIcon className="h-[18px] w-[18px]" style={{ color: "var(--text-2)" }} />
      </button>

      {/* Settings gear */}
      <button
        type="button"
        onClick={onSettings}
        aria-label="Тохиргоо"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-90"
        style={{
          background: showSettings ? "var(--olive)" : "var(--surface-2)",
          border: `1px solid ${showSettings ? "var(--olive)" : "var(--border-c)"}`,
        }}
      >
        <Cog6ToothIcon
          className="h-[18px] w-[18px]"
          style={{ color: showSettings ? "#0d1e35" : "var(--text-2)" }}
        />
      </button>
    </footer>
  );
}
