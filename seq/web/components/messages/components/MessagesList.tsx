"use client";

import type { RefObject } from "react";
import { cn } from "@/lib/utils";
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
            if (log) {
              return (
                <CallLogCard
                  key={m.id}
                  entry={log}
                  peer={activePeer}
                  onCallAgain={onCallAgain}
                  onDelete={() => onDeleteCallLog(log)}
                />
              );
            }
            return (
              <MessageBubble
                key={m.id}
                msg={m}
                editing={editingId === m.id}
                onStartEdit={() => onStartEdit(m.id, m.body ?? "")}
                onDelete={() => onDeleteMessage(m)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
