import type { PendingCall } from "@/lib/chat-api";

export async function notifyIncomingCall(call: PendingCall): Promise<void> {
  if (typeof window === "undefined" || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  const title = `📞 ${call.peer.name ?? call.peer.email ?? "Дуудлага"}`;
  const body = "Sign Bridge — дуудлага ирлээ";
  const options: NotificationOptions = {
    body,
    tag: `call-${call.messageId}`,
    requireInteraction: true,
    icon: "/favicon.ico",
    silent: false,
  };

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    /* fall through */
  }

  try {
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    /* ignore */
  }
}

export function registerCallServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.register("/sw.js").catch(() => {});
}

export const INCOMING_CALL_LS_KEY = "sb_incoming_call_v1";

export function syncIncomingCallToStorage(call: PendingCall | null): void {
  try {
    if (call) {
      localStorage.setItem(INCOMING_CALL_LS_KEY, JSON.stringify({ call, ts: Date.now() }));
    } else {
      localStorage.removeItem(INCOMING_CALL_LS_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function readIncomingCallFromStorage(): PendingCall | null {
  try {
    const raw = localStorage.getItem(INCOMING_CALL_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { call: PendingCall; ts: number };
    if (Date.now() - parsed.ts > 120_000) {
      localStorage.removeItem(INCOMING_CALL_LS_KEY);
      return null;
    }
    return parsed.call;
  } catch {
    return null;
  }
}
