import {
  ChevronLeftIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

type Props = {
  statusLabel: string;
  statusDot: "idle" | "connecting" | "connected" | "error";
  timer?: string;
  onBack: () => void;
  ttsEnabled: boolean;
  onTtsToggle: () => void;
  camMuted: boolean;
  voiceListening: boolean;
  voiceSupported: boolean;
  hideCamera?: boolean;
  hideVoice?: boolean;
  onCamToggle: () => void;
  onVoiceToggle: () => void;
};

const DOT_COLOR: Record<Props["statusDot"], string> = {
  idle: "var(--text-3)",
  connecting: "var(--olive)",
  connected: "#4ade80",
  error: "hsl(var(--destructive))",
};

const DOT_ANIM: Record<Props["statusDot"], string> = {
  idle: "",
  connecting: "animate-pulse",
  connected: "",
  error: "",
};

/** Small info badge pinned to a control; reveals a descriptive tooltip on hover. */
function InfoTip({ label }: { label: string }) {
  return (
    <span className="group/tip absolute -right-1.5 -top-1.5 z-50 inline-flex">
      <span
        className="flex h-4 w-4 cursor-help items-center justify-center rounded-full"
        style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
      >
        <InformationCircleIcon className="h-3 w-3" style={{ color: "var(--text-3)" }} />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-[calc(100%+6px)] z-50 w-max max-w-[180px] rounded-lg px-2.5 py-1.5 text-[11px] font-medium leading-snug opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-c)",
          color: "var(--text)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {label}
      </span>
    </span>
  );
}

export function CallTopBar({
  statusLabel,
  statusDot,
  timer,
  onBack,
  ttsEnabled,
  onTtsToggle,
  camMuted,
  voiceListening,
  voiceSupported,
  hideCamera = false,
  hideVoice = false,
  onCamToggle,
  onVoiceToggle,
}: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 px-4 pt-[max(env(safe-area-inset-top),12px)]">
      <div className="pointer-events-auto flex items-center justify-between">

        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Буцах"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 active:scale-95"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-c)",
          }}
        >
          <ChevronLeftIcon className="h-5 w-5" style={{ color: "var(--text)" }} />
        </button>

        {/* Status pill */}
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 md:gap-2 md:px-4 md:py-2"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-c)",
          }}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full shrink-0 md:h-2 md:w-2 ${DOT_ANIM[statusDot]}`}
            style={{ background: DOT_COLOR[statusDot] }}
          />
          <span className="text-[11px] font-semibold md:text-[13px]" style={{ color: "var(--text)", fontFamily: "var(--font-sans)" }}>
            {statusLabel}
          </span>
          {timer && (
            <span
              className="font-mono text-[13px] tabular-nums font-bold"
              style={{ color: "var(--olive)" }}
            >
              {timer}
            </span>
          )}
        </div>

        {/* Right cluster: camera + microphone + TTS toggle */}
        <div className="flex items-center gap-2">
          {/* Camera */}
          {!hideCamera && (
            <div className="relative">
              <button
                type="button"
                onClick={onCamToggle}
                aria-label={camMuted ? "Камер асаах" : "Камер унтраах"}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 active:scale-95"
                style={{
                  background: camMuted ? "var(--surface)" : "var(--olive)",
                  border: "1px solid var(--border-c)",
                }}
              >
                {camMuted ? (
                  <VideoCameraSlashIcon className="h-5 w-5" style={{ color: "var(--text-3)" }} />
                ) : (
                  <VideoCameraIcon className="h-5 w-5" style={{ color: "#0d1e35" }} />
                )}
              </button>
              <InfoTip label="Өөрийн камерыг асааж дохионы хэлыг таниулах эсвэл унтраах" />
            </div>
          )}

          {/* Microphone */}
          {!hideVoice && (
            <div className="relative">
              <button
                type="button"
                onClick={onVoiceToggle}
                disabled={!voiceSupported}
                aria-label={voiceListening ? "Яриа зогсоох" : "Яриа эхлүүлэх"}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                style={{
                  background: voiceListening ? "var(--olive)" : "var(--surface)",
                  border: "1px solid var(--border-c)",
                  boxShadow: voiceListening ? "0 0 0 4px var(--glow)" : undefined,
                }}
              >
                <MicrophoneIcon
                  className="h-5 w-5"
                  style={{ color: voiceListening ? "#0d1e35" : "var(--text-3)" }}
                />
              </button>
              <InfoTip label="Яриаг бичвэр болгон хөрвүүлэх" />
            </div>
          )}

          {/* TTS toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={onTtsToggle}
              aria-label={ttsEnabled ? "Чимэгэ хаах" : "Чимэгэ нээх"}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 active:scale-95"
              style={{
                background: ttsEnabled ? "var(--olive)" : "var(--surface)",
                border: "1px solid var(--border-c)",
              }}
            >
              {ttsEnabled ? (
                <SpeakerWaveIcon className="h-5 w-5" style={{ color: "#0d1e35" }} />
              ) : (
                <SpeakerXMarkIcon className="h-5 w-5" style={{ color: "var(--text-3)" }} />
              )}
            </button>
            <InfoTip label="Хөрвүүлсэн бичвэрийг дуугаар унших" />
          </div>
        </div>
      </div>
    </div>
  );
}
