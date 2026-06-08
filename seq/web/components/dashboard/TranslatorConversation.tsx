"use client";

import { TypewriterCaption } from "@/components/TypewriterCaption";
import type { LivePred } from "@/hooks/useSignDetection";

type Props = {
  detected: string;
  running: boolean;
  modelReady: boolean;
  livePred: LivePred | null;
  placeholder: string;
};

export function TranslatorConversation({
  detected,
  running,
  modelReady,
  livePred,
  placeholder,
}: Props) {
  return (
    <section
      className="flex h-full min-h-[400px] flex-col rounded-[20px] p-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[15px] font-bold" style={{ color: "var(--text)" }}>
          Орчуулсан текст
        </p>
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: running && modelReady ? "var(--olive)" : "var(--text-3)" }}
          />
          <span className="text-[11px] font-semibold" style={{ color: "var(--text-3)" }}>
            {running ? "Шууд" : "Зогссон"}
          </span>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto rounded-xl p-4"
        style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}
      >
        {detected ? (
          <div className="text-[16px] font-medium leading-relaxed">
            <TypewriterCaption
              variant="plain"
              text={detected}
              charMs={14}
              wordPauseMs={30}
            />
          </div>
        ) : running && livePred ? (
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-2)" }}>
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {livePred.label}
            </span>
            <span className="ml-2 font-mono text-[13px]" style={{ color: "var(--text-3)" }}>
              {(livePred.confidence * 100).toFixed(0)}%
            </span>
          </p>
        ) : (
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-3)" }}>
            {placeholder}
          </p>
        )}
      </div>
    </section>
  );
}
