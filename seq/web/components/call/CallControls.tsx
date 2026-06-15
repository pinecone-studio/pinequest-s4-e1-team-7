"use client";

import { PhoneXMarkIcon } from "@heroicons/react/24/solid";

type Props = {
  onEnd: () => void;
};

export function CallControls({ onEnd }: Props) {
  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="flex items-end justify-center gap-8">

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

      </div>
    </div>
  );
}
