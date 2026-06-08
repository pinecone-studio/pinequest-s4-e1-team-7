"use client";

import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";

type Props = {
  running: boolean;
  modelReady: boolean;
  gender: "female" | "male";
  onToggle: () => void;
  onGenderChange: (g: "female" | "male") => void;
};

export function TranslatorControlBar({
  running,
  modelReady,
  gender,
  onToggle,
  onGenderChange,
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
      {/* Play / Stop */}
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

      {/* Status — fills remaining space */}
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

      {/* Gender selector — right corner with voice icon */}
      <div className="flex items-center gap-1.5">
        <SpeakerWaveIcon className="h-4 w-4 shrink-0" style={{ color: "var(--text-3)" }} />
        {(["female", "male"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onGenderChange(g)}
            className="rounded-full px-4 py-2 text-[12px] font-semibold transition-all duration-150 active:scale-95"
            style={
              gender === g
                ? { background: "var(--olive)", color: "#0d1e35" }
                : { background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border-c)" }
            }
          >
            {g === "female" ? "Эмэгтэй" : "Эрэгтэй"}
          </button>
        ))}
      </div>
    </footer>
  );
}
