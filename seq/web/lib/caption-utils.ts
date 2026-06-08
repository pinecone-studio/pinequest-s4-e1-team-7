/** Ижил дохио дахин emit хийсэн ч UI дээр давтахгүй (ms). */
export const WORD_DEDUP_MS = 6000;

export function shouldAcceptWord(
  word: string,
  last: { word: string; at: number } | null,
  now = Date.now()
): boolean {
  const w = word.trim();
  if (!w) return false;
  if (last && last.word === w && now - last.at < WORD_DEDUP_MS) return false;
  return true;
}

export function appendDetectedWord(prev: string, word: string): string {
  const t = prev.trim();
  if (!t) return word;
  if (t.split(/\s+/).pop() === word) return prev;
  return `${t} ${word}`;
}
