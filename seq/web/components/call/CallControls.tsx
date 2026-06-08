"use client";

import {
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  PhoneXMarkIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/solid";

type Props = {
  camMuted: boolean;
  voiceListening: boolean;
  voiceSupported: boolean;
  onCamToggle: () => void;
  onVoiceToggle: () => void;
  onEnd: () => void;
  onVolumeChange: (v: number) => void;
};

export function CallControls({
  camMuted,
  voiceListening,
  voiceSupported,
  onCamToggle,
  onVoiceToggle,
  onEnd,
  onVolumeChange,
}: Props) {
  const btn =
    "flex items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition active:scale-95";

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={onCamToggle}
          aria-label={camMuted ? "Камер асаах" : "Камер унтраах"}
          className={`${btn} h-11 w-11 ${camMuted ? "opacity-50" : ""}`}
        >
          {camMuted ? (
            <VideoCameraSlashIcon className="h-5 w-5" />
          ) : (
            <VideoCameraIcon className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={onEnd}
          aria-label="Дуудлага таслах"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/25 transition active:scale-95"
        >
          <PhoneXMarkIcon className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={onVoiceToggle}
          disabled={!voiceSupported}
          aria-label={voiceListening ? "Яриа зогсоох" : "Яриа эхлүүлэх"}
          className={`${btn} h-11 w-11 disabled:opacity-40 ${
            voiceListening ? "bg-[#FFE566]/90 text-black" : ""
          }`}
          style={
            voiceListening
              ? { boxShadow: "0 0 0 8px rgba(255,229,102,0.25), 0 0 0 16px rgba(255,229,102,0.1)" }
              : undefined
          }
        >
          <MicrophoneIcon className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] font-medium text-white/50">
        {voiceListening ? "Сонсож байна…" : "Микрофон — яриагаа текст болгоно"}
      </p>

      <div className="mt-2 flex items-center gap-3 px-1">
        <SpeakerWaveIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={80}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="range-line h-1 flex-1 cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--teal-2, #2dd4bf) 80%, rgba(255,255,255,0.2) 80%)`,
          }}
        />
        <SpeakerWaveIcon className="h-4 w-4 shrink-0 text-white/50" />
      </div>
    </div>
  );
}
