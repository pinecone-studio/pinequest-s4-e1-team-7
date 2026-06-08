"use client";

import { TypewriterCaption } from "@/components/TypewriterCaption";

type Props = {
  detected: string;
  running: boolean;
  modelReady: boolean;
  placeholder: string;
};

export function TranslatorConversation({
  detected,
  running,
  modelReady,
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
          <div
            className="text-[16px] leading-relaxed [&>div]:min-h-0 [&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&>div]:text-[16px] [&>div]:font-medium [&>div]:leading-relaxed [&>div]:shadow-none [&>div]:text-[var(--text)]"
          >
            <TypewriterCaption text={detected} charMs={14} wordPauseMs={30} />
          </div>
        ) : (
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-3)" }}>
            {placeholder}
          </p>
        )}
      </div>
    </section>
  );
}
