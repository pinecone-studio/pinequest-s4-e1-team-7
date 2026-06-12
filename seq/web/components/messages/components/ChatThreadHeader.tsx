"use client";

import { PhoneIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { UserAvatar } from "@/components/dashboard/shared/UserAvatar";
import type { ChatPeer } from "@/lib/chat-api";

type Props = {
  activePeer: ChatPeer;
  onClose: () => void;
  onCall: () => void;
};

export function ChatThreadHeader({ activePeer, onClose, onCall }: Props) {
  return (
    <header
      className="flex shrink-0 items-center gap-3 border-b px-3 py-3 md:pr-16"
      style={{ borderColor: "var(--border-c)", background: "var(--surface)" }}
    >
      <button
        type="button"
        className="md:hidden"
        onClick={onClose}
        aria-label="Буцах"
      >
        <ChevronLeftIcon className="h-6 w-6" style={{ color: "var(--text)" }} />
      </button>
      <UserAvatar
        name={activePeer.name ?? activePeer.email}
        avatarUrl={activePeer.avatarUrl}
        size={40}
      />
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[16px] font-bold"
          style={{ color: "var(--text)" }}
        >
          {activePeer.name ?? "Хэрэглэгч"}
        </p>
        <p className="truncate text-[12px]" style={{ color: "var(--text-3)" }}>
          {activePeer.phone ?? activePeer.email}
        </p>
      </div>
      <button
        type="button"
        onClick={onCall}
        aria-label="Дуудлага"
        className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95"
        style={{ background: "var(--olive)", color: "#0d1e35" }}
      >
        <PhoneIcon className="h-5 w-5" />
      </button>
    </header>
  );
}
