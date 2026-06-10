"use client";

import { PhoneIcon, PhoneXMarkIcon } from "@heroicons/react/24/solid";
import type { PendingCall } from "@/lib/chat-api";
import { initial } from "@/lib/utils";

function CallerAvatar({ name }: { name: string }) {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-[var(--olive)]/25" />
      <span className="absolute inset-2 animate-pulse rounded-full bg-[var(--olive)]/15" />
      <div
        className="relative flex h-28 w-28 items-center justify-center rounded-full text-4xl font-extrabold shadow-2xl"
        style={{
          background: "linear-gradient(145deg, var(--olive-bright), var(--olive-deep))",
          color: "#0d1e35",
        }}
      >
        {initial(name)}
      </div>
    </div>
  );
}

export function IncomingCallOverlay({
  call,
  onAccept,
  onDismiss,
}: {
  call: PendingCall;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const name = call.peer.name ?? call.peer.email ?? "Хэрэглэгч";

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6"
      style={{ background: "rgba(5, 10, 20, 0.92)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Дуудлага ирлээ"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <CallerAvatar name={name} />

        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Дуудлага ирлээ
          </p>
          <h2 className="mt-2 text-[28px] font-extrabold tracking-tight text-white">{name}</h2>
          <p className="mt-2 text-[15px] text-white/60">
            {call.peer.phone ?? call.peer.email}
          </p>
        </div>

        <div className="flex w-full max-w-xs items-center justify-center gap-8 pt-4">
          <button
            type="button"
            onClick={onDismiss}
            className="flex flex-col items-center gap-2"
            aria-label="Татгалзах"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform active:scale-95">
              <PhoneXMarkIcon className="h-8 w-8" />
            </span>
            <span className="text-[13px] font-semibold text-white/70">Татгалзах</span>
          </button>

          <button
            type="button"
            onClick={onAccept}
            className="flex flex-col items-center gap-2"
            aria-label="Нэгдэх"
          >
            <span
              className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full text-[#0d1e35] shadow-lg transition-transform active:scale-95"
              style={{ background: "var(--olive)" }}
            >
              <PhoneIcon className="h-8 w-8" />
            </span>
            <span className="text-[13px] font-semibold text-white/90">Нэгдэх</span>
          </button>
        </div>
      </div>
    </div>
  );
}
