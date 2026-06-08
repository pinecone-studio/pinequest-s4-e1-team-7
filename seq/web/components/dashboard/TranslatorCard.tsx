"use client";

import { SpeakerWaveIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { VoiceWave } from "@/components/ui/voice-wave";
import { TypewriterCaption } from "@/components/TypewriterCaption";
import type { LivePred } from "@/hooks/useSignDetection";

type Props = {
  detected: string;
  running: boolean;
  modelReady: boolean;
  modelLoading?: boolean;
  livePred?: LivePred | null;
  speaking: boolean;
  volume: number;
  textScale?: number;
  onSpeak: () => void;
  onVolumeChange: (v: number) => void;
};

export function TranslatorCard({
  detected,
  running,
  modelReady,
  modelLoading = false,
  livePred = null,
  speaking,
  volume,
  textScale = 1,
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

  const textSize = `${Math.round(20 * textScale)}px`;
  const subSize = `${Math.round(16 * textScale)}px`;

  return (
    <section
      className="rounded-[24px] p-6"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <p
        className="mb-4 text-[12px] font-bold uppercase tracking-widest"
        style={{ color: "var(--text-3)" }}
      >
        Орчуулсан текст
      </p>

      <div
        className="min-h-[120px] rounded-xl px-5 py-4"
        style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}
      >
        {detected ? (
          <div className="font-semibold leading-snug" style={{ fontSize: textSize }}>
            <TypewriterCaption variant="plain" text={detected} charMs={18} wordPauseMs={40} />
          </div>
        ) : running && livePred ? (
          <p className="font-medium leading-snug" style={{ fontSize: textSize, color: "var(--text-2)" }}>
            {livePred.label}
            <span className="ml-2 font-mono" style={{ fontSize: subSize, color: "var(--text-3)" }}>
              {(livePred.confidence * 100).toFixed(0)}%
            </span>
          </p>
        ) : (
          <p className="font-medium leading-snug" style={{ fontSize: textSize, color: "var(--text-3)" }}>
            {placeholder}
          </p>
        )}
      </div>

      <div className="my-5">
        <VoiceWave active={speaking} />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSpeak}
          aria-label="Дуугаар унших"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-90"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
        >
          <SpeakerWaveIcon className="h-5 w-5" style={{ color: "var(--text-3)" }} />
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-90"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
        >
          <ClipboardDocumentIcon className="h-5 w-5" style={{ color: "var(--text-2)" }} />
        </button>
      </div>
    </section>
  );
}
