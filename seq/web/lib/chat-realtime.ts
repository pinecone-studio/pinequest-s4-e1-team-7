export type ChatPushEvent = {
  type: "chat";
  conversationId: string;
  messageId: number;
  kind: string;
};

type Listener = (event: ChatPushEvent) => void;

const listeners = new Set<Listener>();
let connected = false;
let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let backoffMs = 5000;
let lastOpenAt = 0;
let currentToken: string | null = null;

function setConnected(next: boolean) {
  if (connected === next) return;
  connected = next;
  window.dispatchEvent(new CustomEvent("sb-chat-realtime", { detail: { connected: next } }));
}

export function isChatRealtimeConnected(): boolean {
  return connected;
}

export function subscribeChatPush(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(event: ChatPushEvent) {
  for (const fn of listeners) fn(event);
}

function clearTimers() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  if (pingTimer) clearInterval(pingTimer);
  pingTimer = null;
}

function scheduleReconnect() {
  if (!currentToken || reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (currentToken) connectChatRealtime(currentToken);
  }, backoffMs);
  backoffMs = Math.min(backoffMs * 1.5, 30_000);
}

export function connectChatRealtime(token: string) {
  if (typeof window === "undefined") return;

  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!base) return;

  if (
    currentToken === token &&
    ws &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  currentToken = token;

  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
  clearTimers();
  setConnected(false);

  const wsBase = base.replace(/^http/, "ws");
  const url = `${wsBase}/api/chat/ws?token=${encodeURIComponent(token)}`;
  const socket = new WebSocket(url);
  ws = socket;

  socket.onopen = () => {
    lastOpenAt = Date.now();
    backoffMs = 5000;
    setConnected(true);
    pingTimer = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) socket.send("ping");
    }, 25_000);
  };

  socket.onmessage = (ev) => {
    if (ev.data === "pong") return;
    try {
      const parsed = JSON.parse(String(ev.data)) as ChatPushEvent;
      if (parsed?.type === "chat") emit(parsed);
    } catch {
      /* ignore */
    }
  };

  socket.onclose = () => {
    clearTimers();
    setConnected(false);
    ws = null;
    const livedMs = lastOpenAt ? Date.now() - lastOpenAt : 0;
    if (livedMs < 2000) backoffMs = Math.min(backoffMs * 2, 60_000);
    scheduleReconnect();
  };

  socket.onerror = () => socket.close();
}

export function disconnectChatRealtime() {
  currentToken = null;
  clearTimers();
  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
  setConnected(false);
}
