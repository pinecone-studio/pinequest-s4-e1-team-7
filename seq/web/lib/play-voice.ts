/**
 * /public/voices/ дахь pre-recorded аудиог тоглуулна.
 *
 * Бүх файлыг module ачаалах үед fetch → Blob URL болгон кэшэлнэ.
 * Тоглуулах үед шинэ Audio() үүсгэж Blob URL-ийг ашиглана →
 *   давхар дуу / reuse алдаа байхгүй, latency бараг тэг.
 * WebSpeech / TTS ашиглахгүй.
 */

/** key = braille-mn буюу навигацийн текст, value = файлын нэм (extensionгүй, зөв encoding) */
const VOICE_MAP: Record<string, string> = {
  // Үсгүүд
  // macOS HFS+ зарим үсгийг NFD байтаар хадгалдаг тул тэдгээрийг NFD хэлбэрээр заана.
  А: "А", Б: "Б", В: "В", Г: "Г", Д: "Д",
  Е: "Е",
  // Ё disk дээр NFD → Е (U+0415) + combining diaeresis (U+0308)
  Ё: "\u0415\u0308",
  Ж: "Ж", З: "З", И: "И",
  // Й disk дээр NFD → И (U+0418) + combining breve (U+0306)
  Й: "\u0418\u0306",
  К: "К", Л: "Л", М: "М", Н: "Н",
  О: "О", Ө: "Ө", П: "П", Р: "Р", С: "С",
  Т: "Т", У: "У", Ү: "Ү", Ф: "Ф", Х: "Х",
  Ц: "Ц", Ч: "Ч", Ш: "Ш", Ъ: "Ъ", Ы: "Ы",
  Ь: "Ь", Э: "Э", Ю: "Ю", Я: "Я",

  // Тэмдэглэгээ
  ",": ",", "?": "?", ".": "цэг",

  // Навигацийн хэллэгүүд
  Буцлаа: "Буцлаа",
  Хайлт: "Хайлт",
  "Чаат руу орлоо": "Чаат руу орлоо",
  Бичих: "Бичих",
  Дуу: "Дуу",
  Дуудлага: "Дуудлага",
};

// key → Blob URL (fetch дууссаны дараа байна)
const BLOB_CACHE = new Map<string, string>();

let currentAudio: HTMLAudioElement | null = null;

/** Тоглогдож буй аудиог шууд зогсооно */
export function stopVoice() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

async function preloadOne(key: string, fileName: string) {
  try {
    const url = `/voices/${encodeURIComponent(fileName)}.mp3`;
    const resp = await fetch(url);
    if (!resp.ok) return;
    const blob = await resp.blob();
    BLOB_CACHE.set(key, URL.createObjectURL(blob));
  } catch {
    // Дуугүй алдаагаар өнгөрнө
  }
}

function buildCache() {
  void Promise.all(
    Object.entries(VOICE_MAP).map(([key, fileName]) => preloadOne(key, fileName)),
  );
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildCache, { once: true });
  } else {
    buildCache();
  }
}

/**
 * Тохирох /voices/*.mp3 файлыг шууд тоглуулна.
 * Файл olдохгүй бол дуугүй өнгөрнө.
 */
export function playVoice(text: string): void {
  if (typeof window === "undefined" || !text) return;

  const blobUrl = BLOB_CACHE.get(text);
  if (!blobUrl) return;

  stopVoice();

  // Шинэ Audio element — reuse алдаагүй
  const audio = new Audio(blobUrl);
  currentAudio = audio;
  audio.play().catch(() => {
    if (currentAudio === audio) currentAudio = null;
  });
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
  };
}
