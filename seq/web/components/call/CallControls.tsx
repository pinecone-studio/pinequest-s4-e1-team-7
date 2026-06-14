"use client";

import {
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  PhoneXMarkIcon,
} from "@heroicons/react/24/solid";

type Props = {
  camMuted: boolean;
  voiceListening: boolean;
  voiceSupported: boolean;
  onCamToggle: () => void;
  onVoiceToggle: () => void;
  onEnd: () => void;
};

export function CallControls({
  camMuted,
  voiceListening,
  voiceSupported,
  onCamToggle,
  onVoiceToggle,
  onEnd,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="flex items-end justify-center gap-8">

        {/* Camera */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onCamToggle}
            aria-label={camMuted ? "Камер асаах" : "Камер унтраах"}
            className="flex h-14 w-14 items-center justify-center rounded-full transition-all duration-150 active:scale-95"
            style={{
              background: camMuted ? "rgba(245,197,24,0.35)" : "var(--olive)",
              border: "1.5px solid var(--olive)",
              opacity: camMuted ? 0.7 : 1,
            }}
          >
            {camMuted ? (
              <VideoCameraSlashIcon className="h-6 w-6" style={{ color: "#0d1e35" }} />
            ) : (
              <VideoCameraIcon className="h-6 w-6" style={{ color: "#0d1e35" }} />
            )}
          </button>
          <span className="text-[11px] text-white/60">Камер</span>
        </div>

        {/* End call */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onEnd}
            aria-label="Дуудлага таслах"
            className="flex h-14 w-14 items-center justify-center rounded-full transition-all duration-150 active:scale-95"
            style={{
              background: "hsl(var(--destructive))",
              border: "1.5px solid hsl(var(--destructive)/0.7)",
              boxShadow: "0 4px 24px hsl(var(--destructive)/0.45)",
            }}
          >
            <PhoneXMarkIcon className="h-6 w-6 text-white" />
          </button>
          <span className="text-[11px] text-white/60">Таслах</span>
        </div>

        {/* Microphone */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onVoiceToggle}
            disabled={!voiceSupported}
            aria-label={voiceListening ? "Яриа зогсоох" : "Яриа эхлүүлэх"}
            className="flex h-14 w-14 items-center justify-center rounded-full transition-all duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            style={{
              background: "var(--olive)",
              border: "1.5px solid var(--olive)",
              boxShadow: voiceListening
                ? "0 0 0 6px var(--glow), 0 0 0 14px rgba(245,197,24,0.06)"
                : undefined,
            }}
          >
            <MicrophoneIcon className="h-6 w-6" style={{ color: "#0d1e35" }} />
          </button>
          <span className="text-[11px] text-white/60">Яриа-бичвэр</span>
        </div>

      </div>
    </div>
  );
}
