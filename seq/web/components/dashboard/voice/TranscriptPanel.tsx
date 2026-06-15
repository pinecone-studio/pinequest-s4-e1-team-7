"use client";
import { useRef, useState, useEffect } from "react";
import { ClipboardDocumentIcon, TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { FontSizeControl } from "@/components/ui/FontSizeControl";

function Cursor({ size }: { size: number }) {
  return (
    <span
      className="ml-1 inline-block w-[3px] rounded-full align-middle"
      style={{
        height: `${size * 0.88}px`,
        background: "var(--olive)",
        animation: "blink .9s steps(1) infinite",
      }}
    />
  );
}

type Props = {
  sentences: string[];
  interim: string;
  fontSize: number;
  onFontSizeChange: (n: number) => void;
  listening: boolean;
  onCopy: () => void;
  onClear: () => void;
};

export function TranscriptPanel({
  sentences,
  interim,
  fontSize,
  onFontSizeChange,
  listening,
  onCopy,
  onClear,
}: Props) {
  const [confirmClear, setConfirmClear] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const hasContent = sentences.length > 0 || !!interim;

  useEffect(() => {
    const el = textRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [sentences, interim]);

  const handleClear = () => {
    onClear();
    setConfirmClear(false);
  };

  return (
    <div
      className="mb-3 flex flex-1 flex-col rounded-[22px] p-4 md:rounded-[24px] md:p-6 lg:min-h-0"
      style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--olive)" }} />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-3)" }}>
          Бичвэр
        </p>
      </div>

      <div ref={textRef} className="flex-1 min-h-0 overflow-y-auto">
        {hasContent ? (
          <div className="space-y-4">
            {sentences.slice(0, -1).map((s, i) => (
              <p key={i} className="leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text-2)" }}>
                {s}
              </p>
            ))}
            {sentences.length > 0 && (
              <p className="font-bold leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text)" }}>
                {sentences[sentences.length - 1]}
              </p>
            )}
            {interim && (
              <p className="font-bold leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text-3)" }}>
                {interim}
                <Cursor size={fontSize} />
              </p>
            )}
            {listening && !interim && <Cursor size={fontSize} />}
          </div>
        ) : (
          <p className="italic leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text-3)" }}>
            Бичвэр энд харагдана...
          </p>
        )}
      </div>

      <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: "var(--border-c)" }}>
        <FontSizeControl size={fontSize} min={14} max={32} step={2} onChange={onFontSizeChange} />

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCopy}
            disabled={!hasContent}
            aria-label="Бүгдийг хуулах"
            className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-150 hover:scale-105 hover:brightness-110 active:scale-90 active:opacity-70 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
          >
            <ClipboardDocumentIcon className="h-5 w-5" style={{ color: "var(--text-2)" }} />
          </button>
          {confirmClear ? (
            <div
              className="flex max-w-full flex-wrap items-center gap-2 rounded-2xl px-3 py-2 sm:rounded-full"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
            >
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0" style={{ color: "hsl(var(--destructive))" }} />
              <span className="text-[12px] font-semibold" style={{ color: "var(--text-2)" }}>
                Устгах уу?
              </span>
              <button
                onClick={handleClear}
                className="rounded-full px-3 py-1 text-[12px] font-bold transition-all duration-150 hover:brightness-110 active:scale-95 active:opacity-70"
                style={{ background: "hsl(var(--destructive))", color: "#fff" }}
              >
                Тийм
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-full px-3 py-1 text-[12px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-95 active:opacity-70"
                style={{ background: "var(--surface)", border: "1px solid var(--border-c)", color: "var(--text-2)" }}
              >
                Үгүй
              </button>
            </div>
          ) : (
            <button
              onClick={() => hasContent && setConfirmClear(true)}
              disabled={!hasContent}
              aria-label="Бичвэр устгах"
              className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-150 hover:scale-105 hover:brightness-110 active:scale-90 active:opacity-70 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
            >
              <TrashIcon className="h-5 w-5" style={{ color: "var(--text-2)" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
