"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { usePresenceHeartbeat } from "@/hooks/usePresenceHeartbeat";
import {
  connectChatRealtime,
  disconnectChatRealtime,
  isChatRealtimeConnected,
  subscribeChatPush,
  type ChatPushEvent,
} from "@/lib/chat-realtime";

type ChatRealtimeValue = {
  connected: boolean;
  subscribe: (fn: (event: ChatPushEvent) => void) => () => void;
};

const ChatRealtimeContext = createContext<ChatRealtimeValue | null>(null);

export function ChatRealtimeProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [connected, setConnected] = useState(false);
  usePresenceHeartbeat();

  useEffect(() => {
    if (!user?.id || !token) {
      disconnectChatRealtime();
      setConnected(false);
      return;
    }

    connectChatRealtime(token);
    setConnected(isChatRealtimeConnected());

    const onStatus = (e: Event) => {
      const detail = (e as CustomEvent<{ connected: boolean }>).detail;
      setConnected(detail.connected);
    };
    window.addEventListener("sb-chat-realtime", onStatus);

    return () => {
      window.removeEventListener("sb-chat-realtime", onStatus);
      disconnectChatRealtime();
      setConnected(false);
    };
  }, [user?.id, token]);

  const value: ChatRealtimeValue = {
    connected,
    subscribe: subscribeChatPush,
  };

  return (
    <ChatRealtimeContext.Provider value={value}>
      {children}
    </ChatRealtimeContext.Provider>
  );
}

export function useChatRealtime(): ChatRealtimeValue {
  const ctx = useContext(ChatRealtimeContext);
  if (!ctx) {
    return {
      connected: false,
      subscribe: subscribeChatPush,
    };
  }
  return ctx;
}
