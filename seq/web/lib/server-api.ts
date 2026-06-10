import { cookies } from "next/headers";
import type { ChatMessage, ConversationSummary } from "@/lib/chat-api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function serverFetch<T>(path: string): Promise<T | null> {
  if (!BASE) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get("sb_token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchServerConversations(): Promise<ConversationSummary[]> {
  return (await serverFetch<ConversationSummary[]>("/api/chat/conversations")) ?? [];
}

export async function fetchServerMessages(convId: string): Promise<ChatMessage[]> {
  const encoded = encodeURIComponent(convId);
  return (await serverFetch<ChatMessage[]>(`/api/chat/conversations/${encoded}/messages`)) ?? [];
}
