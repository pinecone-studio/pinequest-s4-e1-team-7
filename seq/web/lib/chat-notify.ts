import { toast } from "sonner";
import { readCachedConversations } from "@/lib/chat-cache";

// ─── Constants ───────────────────────────────────────────────────────────────

const CHAT_KINDS = new Set(["text", "voice"]);
const seenIds = new Set<number>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const alreadySeen = (messageId: number): boolean => {
  if (seenIds.has(messageId)) return true;
  seenIds.add(messageId);
  if (seenIds.size > 200) seenIds.delete(seenIds.values().next().value!);
  return false;
};

const isInConversation = (conversationId: string, pathname: string): boolean =>
  pathname.includes(conversationId) || pathname.includes(encodeURIComponent(conversationId));

const getPeerName = (conversationId: string): string => {
  const conv = readCachedConversations()?.find((c) => c.id === conversationId);
  return conv?.peer.name ?? conv?.peer.email ?? "Чат";
};

const sendBrowserNotif = async (title: string, body: string, conversationId: string) => {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const href = `/dashboard/call/${encodeURIComponent(conversationId)}`;
  const opts: NotificationOptions = { body, tag: `chat-${conversationId}`, icon: "/favicon.ico" };
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, opts);
  } catch {
    try {
      const n = new Notification(title, opts);
      n.onclick = () => { window.focus(); window.location.href = href; n.close(); };
    } catch { /* ignore */ }
  }
};

// ─── Public API ──────────────────────────────────────────────────────────────

export const fireChatNotification = (
  messageId: number,
  conversationId: string,
  kind: string,
  pathname: string,
  navigate: (href: string) => void,
): void => {
  if (!CHAT_KINDS.has(kind)) return;
  if (isInConversation(conversationId, pathname)) return;
  if (alreadySeen(messageId)) return;

  const peerName = getPeerName(conversationId);
  const body = kind === "voice" ? "🎤 Дуу мессеж илгээлээ" : "Шинэ мессеж ирлээ";
  const href = `/dashboard/call/${encodeURIComponent(conversationId)}`;

  toast(peerName, {
    description: body,
    action: { label: "Харах", onClick: () => navigate(href) },
    duration: 5000,
  });

  // Broadcast to the notification bell
  window.dispatchEvent(
    new CustomEvent("sb-chat-notif", { detail: { messageId, peerName, body, href } }),
  );

  void sendBrowserNotif(peerName, body, conversationId);
};
