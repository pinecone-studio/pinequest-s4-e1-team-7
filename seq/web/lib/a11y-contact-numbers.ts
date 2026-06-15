import type { ConversationSummary } from "@/lib/chat-api";
import { playVoice } from "@/lib/play-voice";

const STORAGE_KEY = "a11y_contact_numbers_v1";

type NumberStore = {
  next: number;
  peers: Record<string, number>;
};

const NUMBER_VOICE: Record<number, string> = {
  1: "нэг",
  2: "хоёр",
  3: "гурав",
  4: "дөрөв",
  5: "тав",
  6: "зургаа",
  7: "долоо",
};

function readStore(): NumberStore {
  if (typeof window === "undefined") return { next: 1, peers: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { next: 1, peers: {} };
    const parsed = JSON.parse(raw) as NumberStore;
    if (!parsed || typeof parsed.next !== "number" || !parsed.peers) {
      return { next: 1, peers: {} };
    }
    return parsed;
  } catch {
    return { next: 1, peers: {} };
  }
}

function writeStore(store: NumberStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

/** Шинэ харилцагчид дараагийн дугаар онооно — өмнөх дугаар хэзээ ч өөрчлөгдөхгүй */
export function syncContactNumbers(peerIds: string[]): Record<string, number> {
  const store = readStore();
  const seen = new Set<string>();

  for (const id of peerIds) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    if (!store.peers[id]) {
      store.peers[id] = store.next;
      store.next += 1;
    }
  }

  writeStore(store);
  return { ...store.peers };
}

export function getContactNumber(
  peerId: string,
  map: Record<string, number>,
): number | undefined {
  return map[peerId];
}

export function sortConversationsByNumber(
  conversations: ConversationSummary[],
  map: Record<string, number>,
): ConversationSummary[] {
  return [...conversations].sort((a, b) => {
    const na = map[a.peer.id] ?? Number.MAX_SAFE_INTEGER;
    const nb = map[b.peer.id] ?? Number.MAX_SAFE_INTEGER;
    return na - nb;
  });
}

/** Хамгийн сүүлд мессеж илгээсэн харилцагчийн preChatIndex (0=хайлт) */
export function defaultPreChatIndex(
  conversations: ConversationSummary[],
  map: Record<string, number>,
): number {
  if (conversations.length === 0) return 0;

  const sorted = sortConversationsByNumber(conversations, map);
  let best = 0;
  let bestTime = -1;

  for (let i = 0; i < sorted.length; i++) {
    const conv = sorted[i]!;
    const t = conv.lastAt ? new Date(conv.lastAt).getTime() : 0;
    if (t > bestTime) {
      bestTime = t;
      best = i;
    }
  }

  return best + 1;
}

export function playContactNumber(n: number): void {
  const key = NUMBER_VOICE[n];
  if (key) playVoice(key);
}

export function contactNumberVoiceKey(n: number): string | null {
  return NUMBER_VOICE[n] ?? null;
}
