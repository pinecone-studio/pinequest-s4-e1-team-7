import type { ChatMessage } from "@/lib/chat-api";
import { parseCallRoom } from "@/lib/call-mode";

export type CallLogStatus = "completed" | "missed" | "declined" | "ringing";

export type CallLogEntry = {
  anchorId: number;
  hiddenIds: number[];
  roomId: string;
  conversationId: string;
  outgoing: boolean;
  audioOnly: boolean;
  callerName: string;
  status: CallLogStatus;
  durationMs: number | null;
  createdAt: string;
  inviteMsg: ChatMessage;
};

const CALL_KINDS = new Set([
  "call_invite",
  "call_answered",
  "call_declined",
  "call_ended",
]);

const RINGING_TTL_MS = 120_000;

function isActiveRinging(invite: ChatMessage): boolean {
  return Date.now() - new Date(invite.createdAt).getTime() < RINGING_TTL_MS;
}

function staleStatus(pending: { invite: ChatMessage; answered?: ChatMessage }): CallLogStatus {
  if (isActiveRinging(pending.invite)) return "ringing";
  return "missed";
}

function finalizePending(
  pending: { invite: ChatMessage; answered?: ChatMessage },
  status: CallLogStatus,
  durationMs: number | null,
  endedAt: string,
  terminal?: ChatMessage,
): CallLogEntry {
  const anchorId = terminal?.id ?? pending.invite.id;
  const hiddenIds: number[] = [];
  if (pending.invite.id !== anchorId) hiddenIds.push(pending.invite.id);
  if (pending.answered && pending.answered.id !== anchorId) hiddenIds.push(pending.answered.id);

  const parsed = parseCallRoom(pending.invite.body ?? pending.invite.conversationId);

  return {
    anchorId,
    hiddenIds,
    roomId: parsed.roomId,
    conversationId: pending.invite.conversationId,
    outgoing: pending.invite.mine,
    audioOnly: parsed.audioOnly,
    callerName: pending.invite.senderName,
    status,
    durationMs,
    createdAt: endedAt,
    inviteMsg: pending.invite,
  };
}

export function buildCallLogs(messages: ChatMessage[]): {
  entries: CallLogEntry[];
  hiddenIds: Set<number>;
} {
  const entries: CallLogEntry[] = [];
  const hiddenIds = new Set<number>();
  const usedInviteIds = new Set<number>();
  let pending: { invite: ChatMessage; answered?: ChatMessage } | null = null;

  const pushEntry = (entry: CallLogEntry) => {
    entries.push(entry);
    entry.hiddenIds.forEach((id) => hiddenIds.add(id));
    usedInviteIds.add(entry.inviteMsg.id);
  };

  const findPriorInvite = (beforeId: number): ChatMessage | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.id >= beforeId) continue;
      if (m.kind === "call_invite" && !usedInviteIds.has(m.id)) return m;
    }
    return null;
  };

  for (const msg of messages) {
    if (!CALL_KINDS.has(msg.kind)) continue;

    if (msg.kind === "call_invite") {
      if (pending) {
        pushEntry(
          finalizePending(pending, staleStatus(pending), null, pending.invite.createdAt),
        );
      }
      pending = { invite: msg };
      continue;
    }

    if (msg.kind === "call_ended" && !pending) {
      const invite = findPriorInvite(msg.id);
      if (invite) {
        pushEntry(
          finalizePending({ invite }, "completed", msg.voiceDurationMs, msg.createdAt, msg),
        );
        continue;
      }
    }

    if (msg.kind === "call_declined" && !pending) {
      const invite = findPriorInvite(msg.id);
      if (invite) {
        const status: CallLogStatus = invite.mine ? "missed" : "declined";
        pushEntry(finalizePending({ invite }, status, null, msg.createdAt, msg));
        continue;
      }
    }

    if (!pending) continue;

    if (msg.kind === "call_answered") {
      pending.answered = msg;
      hiddenIds.add(msg.id);
      continue;
    }

    if (msg.kind === "call_declined") {
      const status: CallLogStatus = pending.invite.mine ? "missed" : "declined";
      pushEntry(finalizePending(pending, status, null, msg.createdAt, msg));
      pending = null;
      continue;
    }

    if (msg.kind === "call_ended") {
      pushEntry(
        finalizePending(pending, "completed", msg.voiceDurationMs, msg.createdAt, msg),
      );
      pending = null;
    }
  }

  if (pending) {
    const status = staleStatus(pending);
    const hidden: number[] = [];
    if (pending.answered) hidden.push(pending.answered.id);
    const parsed = parseCallRoom(pending.invite.body ?? pending.invite.conversationId);
    pushEntry({
      anchorId: pending.invite.id,
      hiddenIds: hidden,
      roomId: parsed.roomId,
      conversationId: pending.invite.conversationId,
      outgoing: pending.invite.mine,
      audioOnly: parsed.audioOnly,
      callerName: pending.invite.senderName,
      status,
      durationMs: null,
      createdAt: pending.invite.createdAt,
      inviteMsg: pending.invite,
    });
  }

  return { entries, hiddenIds };
}

export function callLogMessageIds(entry: CallLogEntry): number[] {
  return [...new Set([entry.anchorId, ...entry.hiddenIds])];
}

export function callLogByAnchor(entries: CallLogEntry[]): Map<number, CallLogEntry> {
  return new Map(entries.map((e) => [e.anchorId, e]));
}

export function formatCallDurationShort(ms: number | null): string | null {
  if (!ms || ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m > 0) return `${m} мин ${s} сек`;
  return `${s} сек`;
}

export function callLogTitle(entry: CallLogEntry): string {
  return entry.audioOnly ? "Аудио дуудлага" : "Видео дуудлага";
}
