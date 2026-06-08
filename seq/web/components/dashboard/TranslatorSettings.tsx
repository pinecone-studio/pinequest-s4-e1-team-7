"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Settings } from "@/lib/types";

const SPEEDS = [
  { label: "0.7×", value: 0.7 },
  { label: "1.0×", value: 1.0 },
  { label: "1.5×", value: 1.5 },
] as const;

function SpeedLine({ rate, onChange }: { rate: number; onChange: (v: number) => void }) {
  const activeIdx = SPEEDS.findIndex((s) => s.value === rate);
  const fillPct = activeIdx === 0 ? 0 : activeIdx === 1 ? 50 : 100;
  return (
    <div>
      <div className="relative flex items-center justify-between">
        <div className="absolute inset-x-2 h-[2px] rounded-full" style={{ background: "var(--border-c)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${fillPct}%`, background: "var(--olive)" }}
          />
        </div>
        {SPEEDS.map(({ value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className="relative z-10 h-4 w-4 rounded-full border-2 transition-all duration-200"
            style={{
              background: rate === value ? "var(--olive)" : "var(--surface)",
              borderColor: rate === value ? "var(--olive)" : "var(--border-c)",
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between">
        {SPEEDS.map(({ label, value }) => (
          <span
            key={value}
            className="text-[11px] font-semibold"
            style={{ color: rate === value ? "var(--olive)" : "var(--text-3)" }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

type Props = {
  settings: Settings;
  onUpdate: (s: Partial<Settings>) => void;
  onClose: () => void;
};

export function TranslatorSettings({ settings, onUpdate, onClose }: Props) {
  const activeStyle = { background: "var(--olive)", color: "black" };
  const inactiveStyle = {
    background: "var(--surface-2)",
    color: "var(--text-2)",
    border: "1px solid var(--border-c)",
  };

  return (
    <section
      className="rounded-[20px] p-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
          Тохиргоо
        </p>
        <button type="button" onClick={onClose} aria-label="Хаах">
          <XMarkIcon className="h-4 w-4" style={{ color: "var(--text-3)" }} />
        </button>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>
          Дуу хоолой
        </p>
        <div className="flex gap-2">
          {(["female", "male"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onUpdate({ gender: g })}
              className="flex-1 rounded-full py-2.5 text-[13px] font-semibold transition-all"
              style={settings.gender === g ? activeStyle : inactiveStyle}
            >
              {g === "female" ? "Эмэгтэй" : "Эрэгтэй"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>
          Хурд
        </p>
        <SpeedLine rate={settings.rate} onChange={(v) => onUpdate({ rate: v })} />
      </div>
    </section>
  );
}
