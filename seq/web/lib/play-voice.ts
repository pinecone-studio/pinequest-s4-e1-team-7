/**
 * /public/voices/ дахь pre-recorded аудиог тоглуулна.
 * Аудио файл байхгүй бол TTS руу fallback хийнэ.
 */

import { a11ySpeak } from "./a11y-speak";

// Одоо тоглогдож буй аудио
let currentAudio: HTMLAudioElement | null = null;

/**
 * public/voices/ дахь файлын нэрсийн map.
 * key = дуудах текст, value = файлын нэр (extensionгүй).
 */
const VOICE_MAP: Record<string, string> = {
  // Үсгүүд
  А: "А", Б: "Б", В: "В", Г: "Г", Д: "Д",
  Е: "Е", Ё: "Ё", Ж: "Ж", З: "З", И: "И",
  Й: "Й", К: "К", Л: "Л", М: "М", Н: "Н",
  О: "О", Ө: "Ө", П: "П", Р: "Р", С: "С",
  Т: "Т", У: "У", Ү: "Ү", Ф: "Ф", Х: "Х",
  Ц: "Ц", Ч: "Ч", Ш: "Ш", Ъ: "Ъ", Ы: "Ы",
  Ь: "Ь", Э: "Э", Ю: "Ю", Я: "Я",

  // Тэмдэглэгээ
  ",": ",", "?": "?", ".": "цэг",

  // Навигацийн хэллэгүүд
  "Буцлаа": "Буцлаа",
  "Хайлт": "Хайлт",
  "Чаат руу орлоо": "Чаат руу орлоо",
  "Бичих": "Бичих",
  "Дуу": "Дуу",
  "Дуудлага": "Дуудлага",
};

/** Тоглогдож буй аудиог зогсооно */
export function stopVoice() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Текстэд тохирох /voices/*.mp3 файлыг тоглуулна.
 * @param text    Дуудах текст / үсэг
 * @param fallback true бол файл олдохгүй үед TTS ашиглана (default: true)
 */
export function playVoice(text: string, fallback = true): void {
  if (typeof window === "undefined" || !text) return;

  const fileName = VOICE_MAP[text];
  if (!fileName) {
    if (fallback) a11ySpeak(text, { interrupt: true });
    return;
  }

  stopVoice();

  const audio = new Audio(`/voices/${encodeURIComponent(fileName)}.mp3`);
  currentAudio = audio;

  audio.play().catch(() => {
    // Тоглуулж чадахгүй бол TTS
    currentAudio = null;
    if (fallback) a11ySpeak(text, { interrupt: true });
  });

  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
  };
}
