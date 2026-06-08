import { ChevronLeftIcon } from "@heroicons/react/24/outline";

type Props = {
  statusLabel: string;
  statusDot: "idle" | "connecting" | "connected" | "error";
  timer?: string;
  onBack: () => void;
};

const DOT: Record<Props["statusDot"], string> = {
  idle: "bg-zinc-400",
  connecting: "animate-pulse bg-amber-400",
  connected: "bg-emerald-400",
  error: "bg-red-500",
};

export function CallTopBar({ statusLabel, statusDot, timer, onBack }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 px-4 pt-[max(env(safe-area-inset-top),12px)]">
      <div className="pointer-events-auto flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Буцах"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur-sm active:scale-95"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${DOT[statusDot]}`} />
          <span className="text-[13px] font-medium text-white/90">{statusLabel}</span>
          {timer && (
            <span className="font-mono text-[13px] tabular-nums text-white/70">{timer}</span>
          )}
        </div>

        <div className="w-9" />
      </div>
    </div>
  );
}
