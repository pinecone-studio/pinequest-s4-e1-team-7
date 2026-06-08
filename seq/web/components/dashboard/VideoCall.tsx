"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VideoCameraIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, LinkIcon } from "@heroicons/react/24/outline";

function genId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function VideoCall() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionId] = useState(genId);

  const startCall = () => {
    setStarting(true);
    router.push(`/call/${sessionId}`);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/call/${sessionId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg)" }}>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-[max(calc(env(safe-area-inset-bottom)+4rem),5.5rem)] md:pb-0 lg:max-w-none lg:px-10 xl:px-16">

        {/* Header */}
        <div className="flex items-center pb-2 pt-5">
          <button onClick={() => router.back()} aria-label="Буцах"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
            <ChevronLeftIcon className="h-5 w-5" style={{ color: "var(--text)" }} />
          </button>
          <h1 className="flex-1 text-center text-[17px] font-bold md:text-[20px]" style={{ color: "var(--text)" }}>
            Видео дуудлага
          </h1>
          <div className="h-10 w-10" />
        </div>

        {/* Big action button — same style as VoiceToText mic */}
        <div className="flex justify-center py-4">
          <div className="flex flex-col items-center gap-3 pb-1">
            <button onClick={startCall} disabled={starting} aria-label="Эхлүүлэх"
              className="flex h-[100px] w-[100px] items-center justify-center rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50 md:h-[120px] md:w-[120px]"
              style={{
                background: "var(--olive)",
                boxShadow: starting
                  ? "0 0 0 16px rgba(245,197,24,0.18), 0 0 0 32px rgba(245,197,24,0.07)"
                  : "0 8px 28px rgba(0,0,0,0.15)",
              }}>
              <VideoCameraIcon className="h-12 w-12 text-black md:h-14 md:w-14" />
            </button>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] transition-colors duration-300"
              style={{ color: starting ? "var(--olive)" : "var(--text-3)" }}>
              {starting ? "Нэгдэж байна..." : "Эхлүүлэх"}
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="rounded-[24px] p-5 md:p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--olive)" }} />
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-3)" }}>
              Холбоос
            </p>
          </div>
          <p className="mb-4 text-[15px] leading-relaxed" style={{ color: "var(--text-2)" }}>
            Эхлүүлэх дарж холбоосыг нөгөө хүндээ илгээнэ үү.
          </p>
          <div className="mb-3 flex items-center gap-3 rounded-[14px] px-4 py-3"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}>
            <LinkIcon className="h-4 w-4 shrink-0" style={{ color: "var(--olive)" }} />
            <span className="flex-1 truncate font-mono text-[12px]" style={{ color: "var(--text-3)" }}>
              /call/{sessionId}
            </span>
          </div>
          <button onClick={copyLink}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: "var(--olive)", color: "#0d1e35", boxShadow: "0 4px 16px rgba(245,197,24,0.3)" }}>
            <LinkIcon className="h-4 w-4 shrink-0" />
            {copied ? "Хуулагдлаа ✓" : "Холбоос хуулах"}
          </button>
        </div>

        <div className="flex-1" />

      </div>
    </div>
  );
}
