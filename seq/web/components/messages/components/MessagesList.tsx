"use client";

import type { RefObject } from "react";
import { cn } from "@/lib/utils";
import { useA11yNav } from "@/lib/a11y-nav-context";
import { ChatEmptyState } from "./ChatEmptyState";
import { MessageBubble } from "./MessageBubble";
import { CallLogCard } from "../CallLogCard";
import type { ChatMessage, ChatPeer } from "@/lib/chat-api";
import type { CallLogEntry } from "@/lib/call-log";

type Props = {
  messages: ChatMessage[];
  callHiddenIds: Set<number>;
  callLogMap: Map<number, CallLogEntry>;
  activePeer: ChatPeer;
  editingId: number | null;
  loadingOlder: boolean;
  scrollRef: RefObject<HTMLDivElement>;
  onScroll: () => void;
  onStartEdit: (id: number, body: string) => void;
  onDeleteMessage: (msg: ChatMessage) => void;
  onDeleteCallLog: (entry: CallLogEntry) => void;
  onCallAgain: () => void;
};

export function MessagesList({
  messages,
  callHiddenIds,
  callLogMap,
  activePeer,
  editingId,
  loadingOlder,
  scrollRef,
  onScroll,
  onStartEdit,
  onDeleteMessage,
  onDeleteCallLog,
  onCallAgain,
}: Props) {
  const nav = useA11yNav();
  const focusId = nav?.historyFocusId ?? null;

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        editingId && "pb-28",
      )}
    >
      {messages.length === 0 ? (
        <ChatEmptyState />
      ) : (
        <div className="space-y-3 px-3 py-4 md:px-6">
          {loadingOlder && (
            <p
              className="py-2 text-center text-[12px]"
              style={{ color: "var(--text-3)" }}
            >
              Өмнөх мессежүүдийг уншиж байна…
            </p>
          )}
          {messages.map((m) => {
            if (callHiddenIds.has(m.id)) return null;
            const log = callLogMap.get(m.id);
            const focused = focusId === m.id;
            const wrapClass = cn(
              "scroll-mt-4 scroll-mb-4 rounded-2xl transition-shadow",
              focused &&
                "ring-2 ring-[var(--olive)] ring-offset-2 ring-offset-[var(--bg)]",
            );

            if (log) {
              return (
                <div key={m.id} id={`a11y-msg-${m.id}`} className={wrapClass}>
                  <CallLogCard
                    entry={log}
                    peer={activePeer}
                    onCallAgain={onCallAgain}
                    onDelete={() => onDeleteCallLog(log)}
                  />
                </div>
              );
            }
            return (
              <div key={m.id} id={`a11y-msg-${m.id}`} className={wrapClass}>
                <MessageBubble
                  msg={m}
                  editing={editingId === m.id}
                  onStartEdit={() => onStartEdit(m.id, m.body ?? "")}
                  onDelete={() => onDeleteMessage(m)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
