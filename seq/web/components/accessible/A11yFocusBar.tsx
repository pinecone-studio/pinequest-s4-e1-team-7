"use client";

import { PhoneIcon, MicrophoneIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useA11yNav, type ThreadAction } from "@/lib/a11y-nav-context";
import { useA11yChatBridge } from "@/lib/a11y-chat-bridge";

const THREAD_TABS: { id: ThreadAction; label: string; Icon: typeof PhoneIcon }[] = [
  { id: "call",   label: "Дуудлага", Icon: PhoneIcon },
  { id: "voice",  label: "Дуу",      Icon: MicrophoneIcon },
  { id: "typing", label: "Бичих",    Icon: PencilSquareIcon },
];

/**
 * Дэлгэцийн доод хэсэгт идэвхтэй байгаа хэсгийг харуулна.
 * Gesture overlay-ийн дээгүүр харагдана (pointer-events-none).
 */
export function A11yFocusBar() {
  const nav = useA11yNav();
  const bridge = useA11yChatBridge();

  if (!nav) return null;

  const inThread = !!bridge.routeConvId;

  // Фокус дэх нэр
  const focusLabel = (() => {
    if (inThread) {
      if (nav.threadAction === "voice") {
        return bridge.recording ? "Дуу бичиж байна…" : "Дуут зурвас";
      }
      if (nav.threadAction === "typing") {
        return bridge.text ? `"${bridge.text}"` : "Брайль бичих";
      }
      return `${bridge.activePeer?.name ?? "Чат"} руу залгах`;
    }
    if (nav.preChatIndex === 0) {
      return bridge.search.trim() ? `Хайлт: ${bridge.search}` : "Хайлт";
    }
    const hasSearch = bridge.search.trim().length >= 2;
    const peer = hasSearch
      ? bridge.searchResults[nav.preChatIndex - 1]
      : bridge.conversations[nav.preChatIndex - 1]?.peer;
    return peer ? (peer.name ?? peer.email ?? "—") : "—";
  })();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[55] md:hidden"
      style={{ bottom: "calc(4.25rem + env(safe-area-inset-bottom))" }}
    >
      <div
        className="mx-3 overflow-hidden rounded-2xl shadow-xl"
        style={{ background: "var(--surface)", border: "2px solid var(--olive)" }}
      >
        {/* Thread: 3 tabs (call / voice / typing) */}
        {inThread && (
          <div className="flex">
            {THREAD_TABS.map(({ id, label, Icon }) => {
              const active = nav.threadAction === id;
              return (
                <div
                  key={id}
                  className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors")}
                  style={{
                    background: active
                      ? "color-mix(in srgb, var(--olive) 24%, transparent)"
                      : "transparent",
                    color: active ? "var(--olive)" : "var(--text-3)",
                    borderBottom: active ? "2px solid var(--olive)" : "2px solid transparent",
                  }}
                  aria-current={active ? "true" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span className="text-[11px] font-bold leading-none">{label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Pre-chat: search indicator */}
        {!inThread && (
          <div
            className="flex items-center justify-center gap-2 py-2"
            style={{ borderBottom: "1px solid var(--border-c)" }}
          >
            <span
              className="rounded-full px-3 py-1 text-[12px] font-bold"
              style={{
                background: nav.preChatIndex === 0
                  ? "color-mix(in srgb, var(--olive) 24%, transparent)"
                  : "transparent",
                color: nav.preChatIndex === 0 ? "var(--olive)" : "var(--text-3)",
              }}
            >
              🔍 Хайлт
            </span>
            <span className="text-[12px]" style={{ color: "var(--text-3)" }}>
              {nav.preChatIndex > 0 ? `Найз ${nav.preChatIndex}` : ""}
            </span>
          </div>
        )}

        {/* Current focus label */}
        <p
          className="truncate px-4 py-2 text-center text-[14px] font-semibold"
          style={{ color: "var(--text)" }}
          aria-live="polite"
        >
          {focusLabel}
        </p>

        {/* Mini help */}
        <p
          className="pb-1.5 text-center text-[10px]"
          style={{ color: "var(--text-3)" }}
        >
          {inThread
            ? "← → товч · 2× орох · 2 хуруу → буцах"
            : "↑ ↓ жагсаалт · 2× орох · 2 хуруу → буцах"}
        </p>
      </div>
    </div>
  );
}
