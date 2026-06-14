"use client";

import { createContext, useContext } from "react";
import type { ChatMessage, ChatPeer, ConversationSummary } from "@/lib/chat-api";

export type A11yChatBridge = {
  conversations: ConversationSummary[];
  messages: ChatMessage[];
  activePeer: ChatPeer | null;
  routeConvId: string | null;
  search: string;
  searchResults: ChatPeer[];
  text: string;
  setText: (v: string) => void;
  setSearch: (q: string) => void;
  openChat: (convId: string, peer: ChatPeer) => void;
  closeChat: () => void;
  startWithPeer: (peer: ChatPeer) => Promise<void>;
  sendText: () => Promise<void>;
  startCall: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  recording: boolean;
  hasMoreOlder: boolean;
  loadingOlder: boolean;
  loadOlderMessages: () => Promise<number>;
};

export const A11yChatBridgeContext = createContext<A11yChatBridge | null>(null);

export function useA11yChatBridge(): A11yChatBridge {
  const ctx = useContext(A11yChatBridgeContext);
  if (!ctx) throw new Error("useA11yChatBridge within MessagesApp bridge");
  return ctx;
}
