/**
 * /public/voices/ дахь pre-recorded аудиог тоглуулна.
 *
 * Бүх файлыг module ачаалах үед fetch → Blob URL болгон кэшэлнэ.
 * Тоглуулах үед шинэ Audio() үүсгэж Blob URL-ийг ашиглана →
 *   давхар дуу / reuse алдаа байхгүй, latency бараг тэг.
 * WebSpeech / TTS ашиглахгүй.
 */

type VoiceFile = { file: string; ext?: "mp3" | "wav" };

/** key = braille-mn буюу навигацийн текст, value = файл (mp3/wav) */
const VOICE_MAP: Record<string, string | VoiceFile> = {
  // Үсгүүд
  // macOS HFS+ зарим үсгийг NFD байтаар хадгалдаг тул тэдгээрийг NFD хэлбэрээр заана.
  А: "А", Б: "Б", В: "В", Г: "Г", Д: "Д",
  Е: "Е",
  Ё: "Ё",
  Ж: "Ж", З: "З", И: "И",
  Й: "Й",
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
  "дуудлага дарлаа залгаж байна": "дуудлага дарлаа залгаж байна",
  "бичих дарлаа утасаа баруун тийш": "бичих дарлаа утасаа баруун тийш",
  "mic-clicked": { file: "mic-clicked", ext: "wav" },
  calling: "calling",
  "чаатны түүх": "чаатны түүх",
  "дуудлага ирсэн": "дуудлага ирсэн",
  "дуудлага хийсэн": "дуудлага хийсэн",
  залгасан: "залгасан",
  илгээлээ: "илгээлээ",
  нэг: "нэг",
  хоёр: "хоёр",
  гурав: "гурав",
  дөрөв: "дөрөв",
  тав: "тав",
  зургаа: "зургаа",
  долоо: "долоо",
};

function resolveVoiceEntry(value: string | VoiceFile): VoiceFile {
  return typeof value === "string" ? { file: value, ext: "mp3" } : value;
}

// key → Blob URL (fetch дууссаны дараа байна)
const BLOB_CACHE = new Map<string, string>();

let currentAudio: HTMLAudioElement | null = null;
let loopAudio: HTMLAudioElement | null = null;

/** Тоглогдож буй аудиог шууд зогсооно */
export function stopVoice() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

/** Loop тоглолтыг зогсооно */
export function stopVoiceLoop() {
  if (loopAudio) {
    loopAudio.pause();
    loopAudio.loop = false;
    loopAudio = null;
  }
}

export function stopAllVoice() {
  stopVoice();
  stopVoiceLoop();
}

async function preloadOne(key: string, entry: VoiceFile) {
  try {
    const ext = entry.ext ?? "mp3";
    const url = `/voices/${encodeURIComponent(entry.file)}.${ext}`;
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
    Object.entries(VOICE_MAP).map(([key, value]) =>
      preloadOne(key, resolveVoiceEntry(value)),
    ),
  );
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildCache, { once: true });
  } else {
    buildCache();
  }
}

function resolvePlaySrc(text: string): string | null {
  const key = text.normalize("NFC");
  const cached = BLOB_CACHE.get(key) ?? BLOB_CACHE.get(text);
  if (cached) return cached;

  const entry = VOICE_MAP[key] ?? VOICE_MAP[text];
  if (!entry) return null;
  const { file, ext } = resolveVoiceEntry(entry);
  return `/voices/${encodeURIComponent(file)}.${ext ?? "mp3"}`;
}

/**
 * Тохирох /voices/*.mp3 файлыг шууд тоглуулна.
 * Файл olдохгүй бол дуугүй өнгөрнө.
 */
export function playVoice(text: string): void {
  if (typeof window === "undefined" || !text) return;

  const src = resolvePlaySrc(text);
  if (!src) return;

  stopVoice();

  // Шинэ Audio element — reuse алдаагүй
  const audio = new Audio(src);
  currentAudio = audio;
  audio.play().catch(() => {
    if (currentAudio === audio) currentAudio = null;
  });
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
  };
}

/** Тохирох аудиог loop-оор тоглуулна (duудлага хүлээх гэх мэт) */
export function playVoiceLoop(text: string): void {
  if (typeof window === "undefined" || !text) return;

  const src = resolvePlaySrc(text);
  if (!src) return;

  stopVoiceLoop();
  stopVoice();

  const audio = new Audio(src);
  audio.loop = true;
  loopAudio = audio;
  audio.play().catch(() => {
    if (loopAudio === audio) loopAudio = null;
  });
}
