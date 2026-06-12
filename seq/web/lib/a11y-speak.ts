/** Дуут туслагч (TTS) — харааны бэрхшээлтэй горим */

let lastSpoken = "";
let lastSpokenAt = 0;

/**
 * Монголоор чангаар унших.
 * interrupt = false → давхцуулна, default = өмнөхийг таслана.
 * dedup = true → 1.5s-ийн дотор яг ижил текстийг давтахгүй.
 */
export function a11ySpeak(
  text: string,
  opts?: { interrupt?: boolean; rate?: number; dedup?: boolean },
) {
  if (typeof window === "undefined" || !text.trim()) return;
  if (!window.speechSynthesis) return;

  const dedup = opts?.dedup !== false;
  if (dedup) {
    const now = Date.now();
    if (text === lastSpoken && now - lastSpokenAt < 1500) return;
  }

  if (opts?.interrupt !== false) {
    window.speechSynthesis.cancel();
  }

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "mn-MN";
  u.rate = opts?.rate ?? 0.95;
  lastSpoken = text;
  lastSpokenAt = Date.now();
  window.speechSynthesis.speak(u);
}

export function a11yStopSpeak() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  lastSpoken = "";
  lastSpokenAt = 0;
}
