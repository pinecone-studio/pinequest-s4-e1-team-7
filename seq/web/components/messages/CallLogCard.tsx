"use client";

import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  TrashIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
} from "@heroicons/react/24/solid";
import { useIncomingCall } from "@/context/IncomingCallContext";
import type { CallLogEntry } from "@/lib/call-log";
import { formatCallDurationShort } from "@/lib/call-log";
import type { ChatMessage, ChatPeer } from "@/lib/chat-api";
import { cn } from "@/lib/utils";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(entry: CallLogEntry) {
  switch (entry.status) {
    case "completed":
      return formatCallDurationShort(entry.durationMs) ?? "0 сек";
    case "missed":
      return entry.outgoing ? "Хариулаагүй" : "Аваагүй дуудлага";
    case "declined":
      return "Татгалзсан";
    case "ringing":
      return entry.outgoing ? "Хүлээж байна…" : "Одоо залгаж байна";
    default:
      return "";
  }
}

function callerLine(entry: CallLogEntry, peerName: string) {
  if (entry.outgoing) return "Та залгасан";
  return `${entry.callerName || peerName} залгасан`;
}

export function CallLogCard({
  entry,
  peer,
  onCallAgain,
  onDelete,
}: {
  entry: CallLogEntry;
  peer: ChatPeer;
  onCallAgain: () => void;
  onDelete: () => void;
}) {
  const { joinCall } = useIncomingCall();
  const peerName = peer.name ?? peer.email ?? "Хэрэглэгч";
  const subtitle = statusLabel(entry);
  const isBad = entry.status === "missed" || entry.status === "declined";
  const Icon = isBad ? VideoCameraSlashIcon : VideoCameraIcon;
  const showOutgoingBadge = entry.outgoing && !isBad;
  const showIncomingBadge = !entry.outgoing && !isBad;

  const handleJoin = () => {
    const msg = entry.inviteMsg;
    joinCall({
      conversationId: entry.conversationId,
      roomId: entry.roomId,
      messageId: msg.id,
      createdAt: msg.createdAt,
      peer: {
        id: msg.senderId,
        name: msg.senderName,
        email: msg.senderName,
        phone: null,
      },
    });
  };

  return (
    <div className={cn("flex", entry.outgoing ? "justify-end" : "justify-start")}>
      <div
        className="w-[min(100%,228px)] overflow-hidden rounded-xl"
        style={{
          background: "var(--surface-2)",
          border: `1px solid ${isBad ? "hsl(var(--destructive)/0.25)" : "var(--border-c)"}`,
        }}
      >
        <div className="flex gap-2 px-2.5 py-2">
          <div
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{
              background: isBad ? "hsl(var(--destructive)/0.12)" : "rgba(245,197,24,0.15)",
              color: isBad ? "hsl(var(--destructive))" : "var(--olive)",
            }}
          >
            <Icon className="h-4 w-4" />
            {showOutgoingBadge && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--olive)]">
                <ArrowUpRightIcon className="h-2 w-2 text-white" />
              </span>
            )}
            {showIncomingBadge && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--olive)]">
                <ArrowDownLeftIcon className="h-2 w-2 text-white" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <div className="flex min-w-0 items-center gap-1">
                <p className="truncate text-[13px] font-bold leading-none" style={{ color: "var(--text)" }}>
                  Видео дуудлага
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <span className="text-[10px] leading-none opacity-50" style={{ color: "var(--text-3)" }}>
                  {formatTime(entry.createdAt)}
                </span>
                <button
                  type="button"
                  onClick={onDelete}
                  aria-label="Устгах"
                  className="flex h-5 w-5 items-center justify-center rounded opacity-50 transition-opacity hover:opacity-100"
                  style={{ color: "var(--text-3)" }}
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="mt-1 truncate text-[11px] leading-tight" style={{ color: "var(--text-3)" }}>
              {callerLine(entry, peerName)}
            </p>
            <p
              className={cn("text-[12px] font-medium leading-tight", isBad && "text-[hsl(var(--destructive))]")}
              style={!isBad ? { color: "var(--text-3)" } : undefined}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {entry.status === "ringing" && !entry.outgoing ? (
          <button
            type="button"
            onClick={handleJoin}
            className="w-full border-t py-1.5 text-[12px] font-bold transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderColor: "var(--border-c)", color: "var(--olive)" }}
          >
            Нэгдэх
          </button>
        ) : (
          <button
            type="button"
            onClick={onCallAgain}
            className="w-full border-t py-1.5 text-[12px] font-semibold transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderColor: "var(--border-c)", color: "var(--text)" }}
          >
            Дахин залгах
          </button>
        )}
      </div>
    </div>
  );
}

export function isCallKind(msg: ChatMessage) {
  return (
    msg.kind === "call_invite" ||
    msg.kind === "call_answered" ||
    msg.kind === "call_declined" ||
    msg.kind === "call_ended"
  );
}
