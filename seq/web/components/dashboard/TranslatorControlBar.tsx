"use client";

import {
  ArrowPathIcon,
  Cog6ToothIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";

type Props = {
  running: boolean;
  modelReady: boolean;
  detected: string;
  volume: number;
  showSettings: boolean;
  onToggle: () => void;
  onSpeak: () => void;
  onReset: () => void;
  onSettings: () => void;
  onVolumeChange: (v: number) => void;
};

export function TranslatorControlBar({
  running,
  modelReady,
  detected,
  volume,
  showSettings,
  onToggle,
  onSpeak,
  onReset,
  onSettings,
  onVolumeChange,
}: Props) {
  return (
    <footer
      className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] px-5 py-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex min-w-[140px] items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          style={{ background: "var(--olive-soft)", color: "var(--text)" }}
        >
          SB
        </div>
        <div>
          <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>
            Дохионы хэл
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
            {running ? "Таних идэвхтэй" : "Бэлэн"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center gap-4">
        <button
          type="button"
          onClick={onToggle}
          disabled={!modelReady && !running}
          aria-label={running ? "Зогсоох" : "Эхлүүлэх"}
          className="flex h-14 w-14 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-40"
          style={{
            background: running ? "var(--surface-2)" : "var(--olive)",
            color: running ? "var(--text)" : "#0d1e35",
            border: running ? "1px solid var(--border-c)" : "none",
            boxShadow: running ? "none" : "0 4px 20px rgba(245,197,24,0.35)",
          }}
        >
          {running ? <StopIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
        </button>
        <p className="hidden text-[12px] font-medium sm:block" style={{ color: "var(--text-3)" }}>
          {running ? "Зогсоох" : "Эхлүүлэх"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSpeak}
          disabled={!detected}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-opacity disabled:opacity-40"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)", color: "var(--text)" }}
        >
          <SpeakerWaveIcon className="h-4 w-4" />
          Дуугаар
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)", color: "var(--text)" }}
        >
          <ArrowPathIcon className="h-4 w-4" />
          Цэвэрлэх
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="range-line hidden w-20 cursor-pointer xl:block"
          aria-label="Дууны хэмжээ"
        />
        <button
          type="button"
          onClick={onSettings}
          aria-label="Тохиргоо"
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            background: showSettings ? "var(--olive)" : "var(--surface-2)",
            border: `1px solid ${showSettings ? "var(--olive)" : "var(--border-c)"}`,
          }}
        >
          <Cog6ToothIcon
            className="h-5 w-5"
            style={{ color: showSettings ? "#0d1e35" : "var(--text)" }}
          />
        </button>
      </div>
    </footer>
  );
}
