"use client";
import { VideoCameraIcon, VideoCameraSlashIcon, MicrophoneIcon, PhoneXMarkIcon, SpeakerWaveIcon } from "@heroicons/react/24/solid";

type Props = {
  camMuted: boolean;
  micMuted: boolean;
  onCamToggle: () => void;
  onMicToggle: () => void;
  onEnd: () => void;
  onVolumeChange: (v: number) => void;
};

export function CallControls({ camMuted, micMuted, onCamToggle, onMicToggle, onEnd, onVolumeChange }: Props) {
  return (
    <>
      <div className="flex items-center justify-center gap-5">
        <button onClick={onCamToggle} className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity active:opacity-70"
          style={{ background: camMuted ? "var(--text-3)" : "var(--glass-btn)", border: "1px solid var(--glass-border)" }}>
          {camMuted
            ? <VideoCameraSlashIcon className="h-5 w-5" style={{ color: "var(--text)" }} />
            : <VideoCameraIcon className="h-5 w-5" style={{ color: "var(--text)" }} />}
        </button>
        <button onClick={onEnd} className="flex h-14 w-14 items-center justify-center rounded-full transition-all duration-150 active:scale-95"
          style={{ background: "#e53535", boxShadow: "0 4px 20px rgba(229,53,53,0.40)" }}>
          <PhoneXMarkIcon className="h-6 w-6 text-white" />
        </button>
        <button onClick={onMicToggle} className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity active:opacity-70"
          style={{ background: micMuted ? "var(--text-3)" : "var(--glass-btn)", border: "1px solid var(--glass-border)" }}>
          <MicrophoneIcon className="h-5 w-5" style={{ color: micMuted ? "var(--surface)" : "var(--text)" }} />
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <SpeakerWaveIcon className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-3)" }} />
        <input type="range" min={0} max={100} defaultValue={80}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
          style={{ accentColor: "var(--teal-2)" }} />
        <SpeakerWaveIcon className="h-4 w-4 shrink-0" style={{ color: "var(--text-2)" }} />
      </div>
    </>
  );
}
