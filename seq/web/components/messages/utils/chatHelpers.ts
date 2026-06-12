import type { ChatMessage, ChatPeer } from "@/lib/chat-api";

export function chatPath(conversationId: string) {
  return `/dashboard/call/${encodeURIComponent(conversationId)}`;
}

export function persistChatPeer(conversationId: string, peer: ChatPeer) {
  try {
    sessionStorage.setItem(`sb-chat-peer:${conversationId}`, JSON.stringify(peer));
  } catch {
    /* ignore */
  }
}

export function loadStoredChatPeer(conversationId: string): ChatPeer | null {
  try {
    const raw = sessionStorage.getItem(`sb-chat-peer:${conversationId}`);
    return raw ? (JSON.parse(raw) as ChatPeer) : null;
  } catch {
    return null;
  }
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("mn-MN", { month: "short", day: "numeric" });
}

export function mergeMessages(prev: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (!incoming.length) return prev;
  const seen = new Set(prev.map((m) => m.id));
  const added = incoming.filter((m) => !seen.has(m.id));
  return added.length ? [...prev, ...added] : prev;
}

export function prependMessages(prev: ChatMessage[], older: ChatMessage[]): ChatMessage[] {
  if (!older.length) return prev;
  const seen = new Set(prev.map((m) => m.id));
  const added = older.filter((m) => !seen.has(m.id));
  return added.length ? [...added, ...prev] : prev;
}
