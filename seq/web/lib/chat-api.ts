import { getStoredToken } from "@/context/AuthContext";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function chatFetch(path: string, init?: RequestInit) {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Алдаа гарлаа");
  return data;
}

export type ChatPeer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatarUrl?: string | null;
  isOnline?: boolean;
};

export function pingPresence(): void {
  const token = getStoredToken();
  if (!token) return;
  void fetch(`${BASE}/api/chat/presence`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

export type PendingCall = {
  conversationId: string;
  peer: ChatPeer;
  messageId: number;
  roomId: string;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  peer: ChatPeer;
  unread: boolean;
  lastPreview: string | null;
  lastAt: string | null;
  updatedAt: string;
  lastMessage: {
    id: number;
    kind: "text" | "voice" | "call_invite" | "call_ended" | "call_declined" | "call_answered";
    senderId: string;
    body: string | null;
    voiceDurationMs: number | null;
    createdAt: string;
  } | null;
};

export function markConversationRead(convId: string): void {
  const token = getStoredToken();
  if (!token) return;
  void fetch(`${BASE}/api/chat/conversations/${encodeURIComponent(convId)}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

export type ChatMessage = {
  id: number;
  conversationId: string;
  senderId: string;
  senderName: string;
  kind: "text" | "voice" | "call_invite" | "call_ended" | "call_declined" | "call_answered";
  body: string | null;
  voiceUrl: string | null;
  voiceDurationMs: number | null;
  createdAt: string;
  mine: boolean;
};

export function searchUsers(q: string): Promise<ChatPeer[]> {
  return chatFetch(`/api/chat/users/search?q=${encodeURIComponent(q)}`);
}

export function fetchConversations(): Promise<ConversationSummary[]> {
  return chatFetch("/api/chat/conversations");
}

export function fetchPendingCalls(): Promise<PendingCall[]> {
  return chatFetch("/api/chat/pending-calls", { cache: "no-store" });
}

export function openConversation(peerId: string): Promise<{ id: string; peer: ChatPeer }> {
  return chatFetch("/api/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ peerId }),
  });
}

export const MESSAGE_PAGE_SIZE = 30;

export function fetchRecentMessages(
  conversationId: string,
  limit = MESSAGE_PAGE_SIZE,
): Promise<ChatMessage[]> {
  return chatFetch(
    `/api/chat/conversations/${conversationId}/messages?limit=${limit}`,
  );
}

export function fetchOlderMessages(
  conversationId: string,
  beforeId: number,
  limit = MESSAGE_PAGE_SIZE,
): Promise<ChatMessage[]> {
  return chatFetch(
    `/api/chat/conversations/${conversationId}/messages?beforeId=${beforeId}&limit=${limit}`,
  );
}

/** Шинэ мессежүүд (polling / push дараа) */
export function fetchMessages(
  conversationId: string,
  afterId = 0,
): Promise<ChatMessage[]> {
  const qs = afterId > 0 ? `?afterId=${afterId}` : `?limit=${MESSAGE_PAGE_SIZE}`;
  return chatFetch(`/api/chat/conversations/${conversationId}/messages${qs}`);
}

function messagePayload(
  kind: string,
  extra: Record<string, unknown>,
  peerId?: string,
) {
  return JSON.stringify({ kind, ...extra, ...(peerId ? { peerId } : {}) });
}

export function sendTextMessage(
  conversationId: string,
  body: string,
  peerId?: string,
): Promise<ChatMessage> {
  return chatFetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: messagePayload("text", { body }, peerId),
  });
}

export function sendCallInvite(
  conversationId: string,
  roomId: string,
  peerId?: string,
): Promise<ChatMessage> {
  return chatFetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: messagePayload("call_invite", { body: roomId }, peerId),
  });
}

export function sendCallEnded(conversationId: string, durationMs: number): Promise<ChatMessage> {
  return chatFetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ kind: "call_ended", durationMs }),
    keepalive: true,
  });
}

export function sendCallDeclined(conversationId: string): Promise<ChatMessage> {
  return chatFetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ kind: "call_declined" }),
    keepalive: true,
  });
}

export function sendCallAnswered(conversationId: string): Promise<ChatMessage> {
  return chatFetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ kind: "call_answered" }),
    keepalive: true,
  });
}

export function editMessage(
  conversationId: string,
  messageId: number,
  body: string,
): Promise<ChatMessage> {
  return chatFetch(`/api/chat/conversations/${conversationId}/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
}

export function deleteMessage(conversationId: string, messageId: number): Promise<{ ok: boolean }> {
  return chatFetch(`/api/chat/conversations/${conversationId}/messages/${messageId}`, {
    method: "DELETE",
  });
}

export function sendVoiceMessage(
  conversationId: string,
  file: Blob,
  durationMs: number,
  peerId?: string,
): Promise<ChatMessage> {
  const fd = new FormData();
  fd.append("file", file, "voice.webm");
  fd.append("durationMs", String(durationMs));
  if (peerId) fd.append("peerId", peerId);
  return chatFetch(`/api/chat/conversations/${conversationId}/voice`, {
    method: "POST",
    body: fd,
  });
}

export function conversationRoomId(conversationId: string): string {
  return conversationId;
}
