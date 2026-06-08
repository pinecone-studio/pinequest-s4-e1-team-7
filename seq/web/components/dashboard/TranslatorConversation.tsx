"use client";

import { useState } from "react";
import { SpeakerWaveIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { TypewriterCaption } from "@/components/TypewriterCaption";
import type { LivePred } from "@/hooks/useSignDetection";

type Props = {
  detected: string;
  running: boolean;
  modelReady: boolean;
  livePred: LivePred | null;
  placeholder: string;
  speaking: boolean;
  volume: number;
  onSpeak: () => void;
  onVolumeChange: (v: number) => void;
  onReset: () => void;
};

export function TranslatorConversation({
  detected,
  running,
  modelReady,
  livePred,
  placeholder,
  speaking,
  volume,
  onSpeak,
  onVolumeChange,
  onReset,
}: Props) {
  const [fontSize, setFontSize] = useState(22);
  const volPct = Math.round(volume * 100);

  return (
    <section
      className="flex flex-1 min-h-[320px] flex-col overflow-hidden rounded-[24px] p-5 md:p-6"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Label + live status */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--olive)" }} />
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-3)" }}>
            Хөрвүүлсэн бичвэр
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: running && modelReady ? "var(--olive)" : "var(--text-3)" }}
          />
          <span className="text-[11px] font-semibold" style={{ color: "var(--text-3)" }}>
            {running ? "Эхэлсэн" : "Зогссон"}
          </span>
        </div>
      </div>

      {/* Scrollable text — font size applies to both detected and placeholder */}
      <div className="relative flex-1 overflow-y-auto">
        <button
          type="button" onClick={onReset} aria-label="Цэвэрлэх"
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-90"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
        >
          <ArrowPathIcon className="h-[18px] w-[18px]" style={{ color: "var(--text-2)" }} />
        </button>
        {detected ? (
          <div
            style={{ fontSize: `${fontSize}px` }}
            className="font-semibold leading-relaxed [&>div]:min-h-0 [&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&>div]:font-semibold [&>div]:leading-relaxed [&>div]:shadow-none [&>div]:text-[var(--text)]"
          >
            <TypewriterCaption text={detected} charMs={14} wordPauseMs={30} />
          </div>
        ) : running && livePred ? (
          <p className="leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text-2)" }}>
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {livePred.label}
            </span>
            <span className="ml-2 font-mono" style={{ fontSize: `${Math.round(fontSize * 0.78)}px`, color: "var(--text-3)" }}>
              {(livePred.confidence * 100).toFixed(0)}%
            </span>
          </p>
        ) : (
          <p className="italic leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text-3)" }}>
            {placeholder}
          </p>
        )}
      </div>

      {/* Controls — font size row + speak/volume row */}
      <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: "var(--border-c)" }}>
        {/* Font size row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSize((s) => Math.max(14, s - 2))}
            aria-label="Фонт багасгах"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-all active:scale-90"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)", color: "var(--text-3)" }}
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
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)", color: "var(--text-3)" }}
          >
            A
          </button>
        </div>

        {/* Speak + volume row */}
        <div className="flex items-center gap-2">
          <button
            type="button" onClick={onSpeak} aria-label="Дуугаар унших"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-90"
            style={{
              background: speaking ? "var(--olive)" : "var(--surface-2)",
              border: "1px solid var(--border-c)",
            }}
          >
            <SpeakerWaveIcon className="h-5 w-5" style={{ color: speaking ? "#0d1e35" : "var(--text-2)" }} />
          </button>
          <input
            type="range" min={0} max={100} value={volPct}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            className="range-line flex-1 cursor-pointer"
            aria-label="Дууны хэмжээ"
            style={{
              background: `linear-gradient(to right, var(--olive) ${volPct}%, var(--border-c) ${volPct}%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
