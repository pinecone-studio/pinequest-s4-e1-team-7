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

export interface SignEntry {
  id: number;
  label: string;
  category: "alphabet" | "number";
  url: string;
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

export async function getSigns(
  category: "alphabet" | "number",
): Promise<SignEntry[]> {
  try {
    const res = await fetch(`${BASE}/api/signs?category=${category}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getDictionary(): Promise<DictionaryEntry[]> {
  const res = await fetch(`${BASE}/api/dictionary`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to load dictionary");
  return res.json();
}

export async function uploadSign(
  file: File,
  label: string,
  category: "alphabet" | "number",
): Promise<SignEntry> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("label", label);
  fd.append("category", category);
  const res = await fetch(`${BASE}/api/signs/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function deleteSign(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/signs/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
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
