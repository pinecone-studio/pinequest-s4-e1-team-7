import type { ChatMessage, ConversationSummary } from "@/lib/chat-api";

const CONV_KEY = "sb_conv_cache_v1";
const MSG_PREFIX = "sb_msg_cache_v1:";

export function readCachedConversations(): ConversationSummary[] | null {
  try {
    const raw = sessionStorage.getItem(CONV_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConversationSummary[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCachedConversations(list: ConversationSummary[]) {
  try {
    sessionStorage.setItem(CONV_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function readCachedMessages(convId: string): ChatMessage[] | null {
  try {
    const raw = sessionStorage.getItem(`${MSG_PREFIX}${convId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCachedMessages(convId: string, messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(`${MSG_PREFIX}${convId}`, JSON.stringify(messages));
  } catch {
    /* ignore */
  }
}
