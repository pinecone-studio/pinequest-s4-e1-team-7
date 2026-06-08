"use client";

import { TypewriterCaption } from "@/components/TypewriterCaption";
import type { LivePred } from "@/hooks/useSignDetection";

type Props = {
  detected: string;
  running: boolean;
  modelReady: boolean;
  livePred: LivePred | null;
  placeholder: string;
  textScale?: number;
};

export function TranslatorConversation({
  detected,
  running,
  modelReady,
  livePred,
  placeholder,
  textScale = 1,
}: Props) {
  const textSize = `${Math.round(18 * textScale)}px`;
  const subSize = `${Math.round(15 * textScale)}px`;

  return (
    <section
      className="flex h-full min-h-[480px] flex-col rounded-[24px] p-6"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[17px] font-bold" style={{ color: "var(--text)" }}>
          Орчуулсан текст
        </p>
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: running && modelReady ? "var(--olive)" : "var(--text-3)" }}
          />
          <span className="text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>
            {running ? "Шууд" : "Зогссон"}
          </span>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto rounded-xl p-5"
        style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}
      >
        {detected ? (
          <div className="font-medium leading-relaxed" style={{ fontSize: textSize }}>
            <TypewriterCaption
              variant="plain"
              text={detected}
              charMs={14}
              wordPauseMs={30}
            />
          </div>
        ) : running && livePred ? (
          <p className="leading-relaxed" style={{ fontSize: textSize, color: "var(--text-2)" }}>
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {livePred.label}
            </span>
            <span className="ml-2 font-mono" style={{ fontSize: subSize, color: "var(--text-3)" }}>
              {(livePred.confidence * 100).toFixed(0)}%
            </span>
          </p>
        ) : (
          <p className="leading-relaxed" style={{ fontSize: textSize, color: "var(--text-3)" }}>
            {placeholder}
          </p>
        )}
      </div>
    </section>
  );
}
