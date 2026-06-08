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
  const btn =
    "flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition active:scale-95";

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={onCamToggle}
          aria-label={camMuted ? "Камер асаах" : "Камер унтраах"}
          className={`${btn} ${camMuted ? "opacity-50" : ""}`}
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
          className={btn}
        >
          <PhoneXMarkIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onVoiceToggle}
          disabled={!voiceSupported}
          aria-label={voiceListening ? "Яриа зогсоох" : "Яриа эхлүүлэх"}
          className={`${btn} disabled:opacity-40 ${
            voiceListening ? "bg-[#FFE566]/90" : ""
          }`}
          style={
            voiceListening
              ? { boxShadow: "0 0 0 8px rgba(255,229,102,0.25), 0 0 0 16px rgba(255,229,102,0.1)" }
              : undefined
          }
        >
          <MicrophoneIcon
            className={`h-5 w-5 ${voiceListening ? "text-black" : "text-[#FFE566]"}`}
          />
        </button>
      </div>
    </div>
  );
}
