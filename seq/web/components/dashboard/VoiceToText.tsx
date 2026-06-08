"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { ChevronLeftIcon, TrashIcon, ClipboardDocumentIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { MicrophoneIcon } from "@heroicons/react/24/solid";

function Cursor({ size }: { size: number }) {
  return <span className="ml-1 inline-block w-[3px] rounded-full align-middle" style={{ height: `${size * 0.88}px`, background: "var(--olive)", animation: "blink .9s steps(1) infinite" }} />;
}

export function VoiceToText() {
  const router = useRouter();
  const { pushHistory, toast } = useApp();
  const [sentences, setSentences] = useState<string[]>([]);
  const [interim, setInterim] = useState("");
  const [fontSize, setFontSize] = useState(22);
  const [confirmClear, setConfirmClear] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handle = useCallback((t: string, final: boolean) => {
    if (final) { const s = t.trim(); if (s) { setSentences((p) => [...p, s]); setInterim(""); pushHistory("voice", s); } }
    else setInterim(t);
  }, [pushHistory]);

  const { listening, start, stop, supported } = useSpeechRecognition(handle);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [sentences, interim]);

  const toggle = () => { if (listening) return stop(); if (!start()) toast("warn", "Хөтөч монгол яриаг дэмжихгүй байна", "captions"); };
  const clear = () => { setSentences([]); setInterim(""); setConfirmClear(false); };
  const copyAll = () => { const text = [...sentences, interim].filter(Boolean).join(" "); if (!text) return; navigator.clipboard.writeText(text); toast("info", "Бичвэр хуулагдлаа", "clipboard"); };
  const hasContent = sentences.length > 0 || !!interim;

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col" style={{ background: "var(--bg)" }}>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <div className="flex items-center px-5 pb-2 pt-5">
          <button onClick={() => router.back()} aria-label="Буцах" className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
            <ChevronLeftIcon className="h-5 w-5" style={{ color: "var(--text)" }} />
          </button>
          <h1 className="flex-1 text-center text-[17px] font-bold md:text-[20px]" style={{ color: "var(--text)" }}>Ярианаас бичвэр</h1>
          <div className="h-10 w-10" />
        </div>

        <div className="flex items-end justify-center gap-5 py-4">
          <img src="/images/text.png" alt="" aria-hidden className="h-28 w-auto object-contain md:h-32" />
          <div className="flex flex-col items-center gap-3 pb-1">
            <button onClick={toggle} disabled={!supported} aria-label={listening ? "Зогсоох" : "Эхлүүлэх"}
              className="flex h-[100px] w-[100px] items-center justify-center rounded-full transition-all duration-300 active:scale-95 disabled:opacity-40 md:h-[120px] md:w-[120px]"
              style={{ background: "var(--olive)", boxShadow: listening ? "0 0 0 16px rgba(245,197,24,0.18), 0 0 0 32px rgba(245,197,24,0.07)" : "0 8px 28px rgba(0,0,0,0.15)" }}>
              <MicrophoneIcon className="h-12 w-12 text-black md:h-14 md:w-14" />
            </button>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] transition-colors duration-300" style={{ color: listening ? "var(--olive)" : "var(--text-3)" }}>
              {listening ? "Сонсож байна..." : "Дарж эхлүүлнэ үү"}
            </p>
          </div>
        </div>

        <div className="mx-4 mb-3 flex-1 overflow-y-auto rounded-[22px] p-5 md:rounded-[24px] md:p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-3)" }}>Бичвэр</p>
          {hasContent ? (
            <div className="space-y-4">
              {sentences.slice(0, -1).map((s, i) => <p key={i} className="leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text-2)" }}>{s}</p>)}
              {sentences.length > 0 && <p className="font-bold leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text)" }}>{sentences[sentences.length - 1]}</p>}
              {interim && <p className="font-bold leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--text-3)" }}>{interim}<Cursor size={fontSize} /></p>}
              {listening && !interim && <Cursor size={fontSize} />}
            </div>
          ) : (
            <p className="text-[15px] italic" style={{ color: "var(--text-3)" }}>Яриа энд бичвэр болж харагдана...</p>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-3 px-5 pb-2">
          <span className="shrink-0 text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>A</span>
          <input type="range" min={14} max={32} step={2} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
            className="range-line flex-1 cursor-pointer" aria-label="Фонтын хэмжээ"
            style={{ background: `linear-gradient(to right, var(--olive) ${((fontSize - 14) / 18) * 100}%, var(--border-c) ${((fontSize - 14) / 18) * 100}%)` }} />
          <span className="shrink-0 text-[18px] font-semibold" style={{ color: "var(--text-3)" }}>A</span>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-1">
          <button onClick={copyAll} disabled={!hasContent} aria-label="Бүгдийг хуулах"
            className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-150 hover:bg-[var(--surface-2)] active:scale-90 active:opacity-70 disabled:opacity-30"
            style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
            <ClipboardDocumentIcon className="h-5 w-5" style={{ color: "var(--text-2)" }} />
          </button>
          {confirmClear ? (
            <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0" style={{ color: "#e53535" }} />
              <span className="text-[12px] font-semibold" style={{ color: "var(--text-2)" }}>Устгах уу?</span>
              <button onClick={clear} className="rounded-full px-3 py-1 text-[12px] font-bold transition-opacity active:opacity-70" style={{ background: "#e53535", color: "#fff" }}>Тийм</button>
              <button onClick={() => setConfirmClear(false)} className="rounded-full px-3 py-1 text-[12px] font-semibold transition-opacity active:opacity-70" style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)", color: "var(--text-2)" }}>Үгүй</button>
            </div>
          ) : (
            <button onClick={() => hasContent && setConfirmClear(true)} disabled={!hasContent} aria-label="Бичвэр устгах"
              className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-150 hover:bg-[var(--surface-2)] active:scale-90 active:opacity-70 disabled:opacity-30"
              style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
              <TrashIcon className="h-5 w-5" style={{ color: "var(--text-2)" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
