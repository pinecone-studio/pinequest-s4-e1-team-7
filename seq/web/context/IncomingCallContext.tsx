"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { IncomingCallOverlay } from "@/components/call/IncomingCallOverlay";
import { useAuth } from "@/context/AuthContext";
import {
  fetchPendingCalls,
  sendCallAnswered,
  sendCallDeclined,
  type PendingCall,
} from "@/lib/chat-api";
import {
  INCOMING_CALL_LS_KEY,
  notifyIncomingCall,
  readIncomingCallFromStorage,
  registerCallServiceWorker,
  syncIncomingCallToStorage,
} from "@/lib/incoming-call-notify";
import { createIncomingCallRing } from "@/lib/incoming-call-ring";

const BUS = "sign-bridge-incoming-call";
const POLL_MS = 500;
const INVITE_TTL_MS = 120_000;

type BusMsg =
  | { type: "incoming"; call: PendingCall }
  | { type: "dismiss"; messageId: number }
  | { type: "accept"; messageId: number }
  | { type: "clear" };

type IncomingCallContextValue = {
  markInCall: () => void;
  markAvailable: () => void;
  joinCall: (call: PendingCall) => void;
};

const IncomingCallContext = createContext<IncomingCallContextValue | null>(null);

function loadDismissed(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem("sb_dismissed_calls");
    if (raw) return new Set(JSON.parse(raw) as number[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveDismissed(set: Set<number>) {
  try {
    sessionStorage.setItem("sb_dismissed_calls", JSON.stringify([...set].slice(-80)));
  } catch {
    /* ignore */
  }
}

export function IncomingCallProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [incomingCall, setIncomingCall] = useState<PendingCall | null>(null);

  const dismissedRef = useRef<Set<number>>(loadDismissed());
  const inCallRef = useRef(false);
  const ringRef = useRef(createIncomingCallRing());
  const titleRef = useRef(typeof document !== "undefined" ? document.title : "");
  const titleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const incomingCallRef = useRef<PendingCall | null>(null);

  const inActiveCall = pathname.startsWith("/call/");

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    inCallRef.current = inActiveCall;
    if (inActiveCall) {
      setIncomingCall(null);
      syncIncomingCallToStorage(null);
      ringRef.current.stop();
    }
  }, [inActiveCall]);

  const stopRingAndTitle = useCallback(() => {
    ringRef.current.stop();
    if (titleTimerRef.current) {
      clearInterval(titleTimerRef.current);
      titleTimerRef.current = null;
    }
    if (typeof document !== "undefined") document.title = titleRef.current;
  }, []);

  const startRingAndTitle = useCallback((name: string) => {
    ringRef.current.start();
    if (typeof document === "undefined") return;
    if (titleTimerRef.current) return;
    let flip = false;
    titleTimerRef.current = setInterval(() => {
      flip = !flip;
      document.title = flip ? `📞 ${name} — Дуудлага!` : titleRef.current;
    }, 900);
  }, []);

  const emitBus = useCallback((msg: BusMsg) => {
    channelRef.current?.postMessage(msg);
  }, []);

  const showIncoming = useCallback(
    (call: PendingCall, fromSync = false) => {
      if (inCallRef.current || dismissedRef.current.has(call.messageId)) return;
      if (incomingCallRef.current?.messageId === call.messageId) return;

      setIncomingCall(call);
      syncIncomingCallToStorage(call);
      startRingAndTitle(call.peer.name ?? call.peer.email ?? "Хэрэглэгч");
      void notifyIncomingCall(call);

      if (!fromSync) {
        emitBus({ type: "incoming", call });
      }
    },
    [emitBus, startRingAndTitle],
  );

  const clearIncoming = useCallback(
    (messageId: number, reason: "dismiss" | "accept", shouldBroadcast = true) => {
      dismissedRef.current.add(messageId);
      saveDismissed(dismissedRef.current);
      setIncomingCall((prev) => (prev?.messageId === messageId ? null : prev));
      syncIncomingCallToStorage(null);
      stopRingAndTitle();
      if (shouldBroadcast) {
        emitBus({ type: reason, messageId });
      }
    },
    [emitBus, stopRingAndTitle],
  );

  const poll = useCallback(async () => {
    if (!user?.id || inCallRef.current) return;
    try {
      const pending = await fetchPendingCalls();
      const now = Date.now();
      const active = pending.find(
        (c) =>
          !dismissedRef.current.has(c.messageId) &&
          now - new Date(c.createdAt).getTime() < INVITE_TTL_MS,
      );
      if (active) {
        showIncoming(active);
      } else if (incomingCallRef.current) {
        const stillActive = pending.some((c) => c.messageId === incomingCallRef.current?.messageId);
        if (!stillActive) {
          setIncomingCall(null);
          syncIncomingCallToStorage(null);
          stopRingAndTitle();
        }
      }
    } catch {
      /* ignore */
    }
  }, [showIncoming, stopRingAndTitle, user?.id]);

  const joinCall = useCallback(
    (call: PendingCall) => {
      inCallRef.current = true;
      clearIncoming(call.messageId, "accept");
      void sendCallAnswered(call.conversationId).catch(() => {});
      const returnTo = `/dashboard/call/${encodeURIComponent(call.conversationId)}`;
      router.push(
        `/call/${encodeURIComponent(call.roomId)}?as=guest&returnTo=${encodeURIComponent(returnTo)}`,
      );
    },
    [clearIncoming, router],
  );

  useEffect(() => {
    if (!user?.id) return;

    titleRef.current = document.title;
    registerCallServiceWorker();

    const unlock = () => ringRef.current.unlock();
    document.addEventListener("pointerdown", unlock, { passive: true });
    document.addEventListener("keydown", unlock, { passive: true });

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }

    channelRef.current = new BroadcastChannel(BUS);
    channelRef.current.onmessage = (ev: MessageEvent<BusMsg>) => {
      const msg = ev.data;
      if (msg.type === "incoming") showIncoming(msg.call, true);
      if (msg.type === "dismiss" || msg.type === "accept") {
        clearIncoming(msg.messageId, msg.type, false);
      }
      if (msg.type === "clear") {
        stopRingAndTitle();
        setIncomingCall(null);
      }
    };

    const stored = readIncomingCallFromStorage();
    if (stored && !dismissedRef.current.has(stored.messageId)) {
      showIncoming(stored, true);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key !== INCOMING_CALL_LS_KEY) return;
      if (e.newValue) {
        try {
          const { call, ts } = JSON.parse(e.newValue) as { call: PendingCall; ts: number };
          if (Date.now() - ts < INVITE_TTL_MS) showIncoming(call, true);
        } catch {
          /* ignore */
        }
      } else {
        stopRingAndTitle();
        setIncomingCall(null);
      }
    };
    window.addEventListener("storage", onStorage);

    void poll();
    pollTimerRef.current = setInterval(() => void poll(), POLL_MS);

    const onVis = () => void poll();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      channelRef.current?.close();
      stopRingAndTitle();
    };
  }, [clearIncoming, poll, showIncoming, stopRingAndTitle, user?.id]);

  const acceptIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    joinCall(incomingCall);
  }, [incomingCall, joinCall]);

  const dismissIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    const { conversationId, messageId } = incomingCall;
    clearIncoming(messageId, "dismiss");
    void sendCallDeclined(conversationId).catch(() => {});
  }, [clearIncoming, incomingCall]);

  const markInCall = useCallback(() => {
    inCallRef.current = true;
    stopRingAndTitle();
    setIncomingCall(null);
    syncIncomingCallToStorage(null);
    emitBus({ type: "clear" });
  }, [emitBus, stopRingAndTitle]);

  const markAvailable = useCallback(() => {
    inCallRef.current = false;
    void poll();
  }, [poll]);

  return (
    <IncomingCallContext.Provider value={{ markInCall, markAvailable, joinCall }}>
      {children}
      {incomingCall && !inActiveCall && (
        <IncomingCallOverlay
          call={incomingCall}
          onAccept={acceptIncomingCall}
          onDismiss={dismissIncomingCall}
        />
      )}
    </IncomingCallContext.Provider>
  );
}

export function useIncomingCall() {
  const ctx = useContext(IncomingCallContext);
  if (!ctx) throw new Error("useIncomingCall must be used within IncomingCallProvider");
  return ctx;
}
