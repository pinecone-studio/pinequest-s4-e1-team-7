"use client";
import { useCallback, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSignMap } from "@/hooks/useSignMap";
import { MicrophoneIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "@/components/ui/PageHeader";
import { TranscriptPanel } from "./TranscriptPanel";
import { TextToSignPanel } from "./TextToSignPanel";

export function VoiceToText() {
  const { pushHistory, toast } = useApp();
  const [sentences, setSentences] = useState<string[]>([]);
  const [interim, setInterim] = useState("");
  const [fontSize, setFontSize] = useState(22);
  const signMap = useSignMap();

  const handle = useCallback(
    (t: string, final: boolean) => {
      if (final) {
        const s = t.trim();
        if (s) {
          setSentences((p) => [...p, s]);
          setInterim("");
          pushHistory("voice", s);
        }
      } else setInterim(t);
    },
    [pushHistory],
  );

  const { listening, start, stop, supported } = useSpeechRecognition(handle);

  const toggle = async () => {
    if (listening) return stop();
    const ok = await start();
    if (!ok) toast("warn", "Микрофон хаалттай байна", "captions");
  };

  const copyAll = () => {
    const text = [...sentences, interim].filter(Boolean).join(" ");
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast("info", "Бичвэр хуулагдлаа", "clipboard");
  };

  const clear = () => {
    setSentences([]);
    setInterim("");
  };

  const signText = interim || sentences[sentences.length - 1] || "";

  return (
    <div
      className="h-full overflow-y-auto overscroll-y-contain lg:flex lg:flex-col lg:overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pb-[max(calc(env(safe-area-inset-bottom)+5.5rem),6.5rem)] md:px-6 lg:flex lg:h-full lg:max-h-full lg:min-h-0 lg:flex-1 lg:max-w-none lg:overflow-hidden lg:px-10 lg:pb-4 xl:px-16">
        <PageHeader title="Ярианаас бичвэр" />

        <div className="flex items-end justify-center py-2 md:py-4">
          <div className="flex flex-col items-center gap-2 pb-1 md:gap-3">
            <button
              onClick={toggle}
              disabled={!supported}
              aria-label={listening ? "Зогсоох" : "Эхлүүлэх"}
              className="flex h-[88px] w-[88px] items-center justify-center rounded-full transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:brightness-100 md:h-[120px] md:w-[120px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--olive)]"
              style={{
                background: "var(--olive)",
                boxShadow: listening
                  ? "0 0 0 16px rgba(245,197,24,0.18), 0 0 0 32px rgba(245,197,24,0.07)"
                  : "0 8px 28px rgba(0,0,0,0.15)",
              }}
            >
              <MicrophoneIcon className="h-10 w-10 text-black md:h-14 md:w-14" />
            </button>
            <p
              className="text-[12px] font-bold uppercase tracking-[0.18em] transition-colors duration-300"
              style={{ color: listening ? "var(--olive)" : "var(--text-3)" }}
            >
              {listening ? "Сонсож байна..." : "Эхлүүлэх"}
            </p>
          </div>
        </div>

        <TranscriptPanel
          sentences={sentences}
          interim={interim}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          listening={listening}
          onCopy={copyAll}
          onClear={clear}
        />

        <TextToSignPanel text={signText} signMap={signMap} />
      </div>
    </div>
  );
}
