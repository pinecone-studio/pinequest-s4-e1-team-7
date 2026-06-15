"use client";

import { PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { UserAvatar } from "@/components/dashboard/shared/UserAvatar";
import type { ChatPeer } from "@/lib/chat-api";

type Props = {
  activePeer: ChatPeer;
  onClose: () => void;
  onVideoCall: () => void;
  onAudioCall: () => void;
  hideCall?: boolean;
};

export function ChatThreadHeader({
  activePeer,
  onClose,
  onVideoCall,
  onAudioCall,
  hideCall,
}: Props) {
  return (
    <header
      className="flex shrink-0 items-center gap-3 border-b px-4 py-3"
      style={{ borderColor: "var(--border-c)" }}
    >
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70 md:hidden"
        onClick={onClose}
        aria-label="Буцах"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
      >
        <ChevronLeftIcon className="h-5 w-5" style={{ color: "var(--text)" }} />
      </button>
      <div className="relative shrink-0">
        <UserAvatar
          name={activePeer.name ?? activePeer.email}
          avatarUrl={activePeer.avatarUrl}
          size={40}
        />
        <span
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-[var(--surface)]"
          style={{ background: activePeer.isOnline ? "#22c55e" : "#ef4444" }}
          aria-hidden
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[16px] font-bold"
          style={{ color: "var(--text)" }}
        >
          {activePeer.name ?? "Хэрэглэгч"}
        </p>
        <p className="truncate text-[12px]" style={{ color: "var(--text-3)" }}>
          {activePeer.isOnline ? "Онлайн" : "Офлайн"}
          {activePeer.phone ? ` · ${activePeer.phone}` : activePeer.email ? ` · ${activePeer.email}` : ""}
        </p>
      </div>
      {!hideCall && (
        <div className="flex shrink-0 items-center gap-5">
          <button
            type="button"
            onClick={onAudioCall}
            aria-label="Аудио дуудлага"
            className="flex items-center justify-center transition-transform active:scale-95"
            style={{ color: "var(--olive)" }}
          >
            <PhoneIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={onVideoCall}
            aria-label="Видео дуудлага"
            className="flex items-center justify-center transition-transform active:scale-95"
            style={{ color: "var(--olive)" }}
          >
            <VideoCameraIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </header>
  );
}
