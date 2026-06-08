"use client";

import { SpeakerWaveIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { VoiceWave } from "@/components/ui/voice-wave";
import { TypewriterCaption } from "@/components/TypewriterCaption";

type Props = {
  detected: string;
  running: boolean;
  modelReady: boolean;
  modelLoading?: boolean;
  speaking: boolean;
  volume: number;
  onSpeak: () => void;
  onVolumeChange: (v: number) => void;
};

export function TranslatorCard({
  detected,
  running,
  modelReady,
  modelLoading = false,
  speaking,
  volume,
  onSpeak,
  onVolumeChange,
}: Props) {
  const placeholder = running
    ? modelReady
      ? "Дохио хүлээж байна…"
      : modelLoading
        ? "Модел ачааллаж байна…"
        : "Дохио хүлээж байна…"
    : "Дохио танихын тулд эхлүүлнэ үү";

  return (
    <section
      className="rounded-[20px] p-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <p
        className="mb-3 text-[11px] font-bold uppercase tracking-widest"
        style={{ color: "var(--text-3)" }}
      >
        Орчуулсан текст
      </p>

      <div
        className="min-h-[88px] rounded-xl px-4 py-3"
        style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}
      >
        {detected ? (
          <div className="[&>div]:min-h-0 [&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&>div]:text-[20px] [&>div]:font-semibold [&>div]:leading-snug [&>div]:shadow-none [&>div]:text-[var(--text)]">
            <TypewriterCaption text={detected} charMs={18} wordPauseMs={40} />
          </div>
        ) : (
          <p className="text-[18px] font-medium leading-snug" style={{ color: "var(--text-3)" }}>
            {placeholder}
          </p>
        )}
      </div>

      <div className="my-4">
        <VoiceWave active={speaking} />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSpeak}
          aria-label="Дуугаар унших"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-90"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
        >
          <SpeakerWaveIcon className="h-4 w-4" style={{ color: "var(--text-3)" }} />
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="range-line flex-1 cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--olive) ${Math.round(volume * 100)}%, var(--border-c) ${Math.round(volume * 100)}%)`,
          }}
        />
        <SpeakerWaveIcon className="h-5 w-5 shrink-0" style={{ color: "var(--text-2)" }} />
        <button
          type="button"
          onClick={() => detected && navigator.clipboard.writeText(detected)}
          aria-label="Хуулах"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-90"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
        >
          <ClipboardDocumentIcon className="h-4 w-4" style={{ color: "var(--text-2)" }} />
        </button>
      </div>
    </section>
  );
}
