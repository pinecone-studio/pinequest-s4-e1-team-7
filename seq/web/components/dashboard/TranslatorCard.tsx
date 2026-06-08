"use client";
import { SpeakerWaveIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { VoiceWave } from "@/components/ui/voice-wave";

type Props = {
  detected: string;
  running: boolean;
  modelReady: boolean;
  speaking: boolean;
  volume: number;
  onSpeak: () => void;
  onVolumeChange: (v: number) => void;
};

export function TranslatorCard({ detected, running, modelReady, speaking, volume, onSpeak, onVolumeChange }: Props) {
  const placeholder = running
    ? modelReady ? "Дохио хүлээж байна…" : "Модел ачааллаж байна…"
    : "Дохио танихын тулд эхлүүлнэ үү";

  return (
    <div className="mx-4 mb-4 rounded-[22px] p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border-c)", boxShadow: "var(--shadow-sm)" }}>
      <p className="text-[24px] font-bold leading-snug" style={{ color: "var(--text)" }}>
        {detected || placeholder}
      </p>
      {detected && (
        <p className="mt-1 text-[14px] font-medium" style={{ color: "var(--teal-2)" }}>
          (дохионы хэлнээс яриа)
        </p>
      )}

      <div className="my-4"><VoiceWave active={speaking} /></div>

      <div className="mb-3 flex items-center gap-2">
        <button onClick={onSpeak}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-150 hover:bg-[var(--bg)] hover:border-[var(--border-2)] active:scale-90 active:opacity-70"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}>
          <SpeakerWaveIcon className="h-4 w-4" style={{ color: "var(--text-3)" }} />
        </button>
        <input type="range" min={0} max={100} value={Math.round(volume * 100)}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="range-line flex-1 cursor-pointer"
          style={{ background: `linear-gradient(to right, var(--olive) ${Math.round(volume * 100)}%, var(--border-c) ${Math.round(volume * 100)}%)` }} />
        <SpeakerWaveIcon className="h-5 w-5 shrink-0" style={{ color: "var(--text-2)" }} />
      </div>

      <button onClick={() => detected && navigator.clipboard.writeText(detected)}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 hover:bg-[var(--bg)] hover:border-[var(--border-2)] active:scale-90 active:opacity-70"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}>
        <ClipboardDocumentIcon className="h-4 w-4" style={{ color: "var(--text-2)" }} />
      </button>
    </div>
  );
}
