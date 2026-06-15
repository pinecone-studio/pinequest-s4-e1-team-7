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
            className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-150 active:scale-95 md:h-14 md:w-14"
            style={{
              background: "hsl(var(--destructive))",
              border: "1.5px solid hsl(var(--destructive)/0.7)",
              boxShadow: "0 4px 24px hsl(var(--destructive)/0.45)",
            }}
          >
            <PhoneXMarkIcon className="h-5 w-5 text-white md:h-6 md:w-6" />
          </button>
        </div>

      </div>
    </div>
  );
}
