const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type TranslationKind = "sign" | "voice";

export interface UserStats {
  words: number;
  sessions: number;
}

export interface HistoryEntry {
  id: string;
  kind: TranslationKind;
  text: string;
  createdAt: string;
}

export interface DictionaryEntry {
  word: string;
  note: string;
}

export async function getStats(userId: string): Promise<UserStats> {
  const res = await fetch(`${BASE}/api/users/${userId}/stats`, {
    next: { tags: ["stats"] },
  });
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export async function getHistory(
  userId: string,
  limit = 10,
): Promise<HistoryEntry[]> {
  const res = await fetch(
    `${BASE}/api/users/${userId}/history?limit=${limit}`,
    { next: { tags: ["history"] } },
  );
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export async function getDictionary(): Promise<DictionaryEntry[]> {
  const res = await fetch(`${BASE}/api/dictionary`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to load dictionary");
  return res.json();
}

export async function recordTranslation(payload: {
  userId: string;
  kind: TranslationKind;
  text: string;
}): Promise<void> {
  await fetch(`${BASE}/api/translations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
