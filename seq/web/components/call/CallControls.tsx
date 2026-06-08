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
  micMuted: boolean;
  onCamToggle: () => void;
  onMicToggle: () => void;
  onEnd: () => void;
  onVolumeChange: (v: number) => void;
};

export function CallControls({
  camMuted,
  micMuted,
  onCamToggle,
  onMicToggle,
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
          onClick={onMicToggle}
          aria-label={micMuted ? "Микрофон асаах" : "Микрофон унтраах"}
          className={`${btn} h-11 w-11 ${micMuted ? "opacity-50" : ""}`}
        >
          <MicrophoneIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 px-1">
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
