import { ChevronLeftIcon } from "@heroicons/react/24/outline";

type Props = {
  statusLabel: string;
  statusDot: "idle" | "connecting" | "connected" | "error";
  timer?: string;
  onBack: () => void;
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

export function CallTopBar({ statusLabel, statusDot, timer, onBack }: Props) {
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
          className="flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-c)",
          }}
        >
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${DOT_ANIM[statusDot]}`}
            style={{ background: DOT_COLOR[statusDot] }}
          />
          <span className="text-[13px] font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-sans)" }}>
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

        <div className="w-10" />
      </div>
    </div>
  );
}
